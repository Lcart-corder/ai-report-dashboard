import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, CheckCircle2, Lock, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// サーバーの WATCH_COMPLETE_THRESHOLD と一致させる(視聴完了の判定閾値)。
const THRESHOLD = 95;
const SAVE_EVERY_SEC = 10; // 視聴ログの保存間隔(秒)

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
const isPlayable = (url?: string | null) => !!url && /^https?:\/\//.test(url);

export type LessonInitial = { watchRate: number; lastPositionSec: number; completed: boolean };

/**
 * レッスン動画プレイヤー。
 * - 実URLがあればHTML5<video>で再生し、視聴位置・視聴率を自動記録
 * - 助成金の視聴担保のため「未視聴区間へのスキップ」を抑止(早送り防止)
 * - 前回の続きから再開(lastPositionSec)
 * - 動画URLが無いレッスンはデモ用の擬似再生でフロー検証が可能
 */
export function LessonPlayer({
  open, onOpenChange, enrollmentId, lessonId, learnerId, title, chapter, videoUrl, durationMinutes, initial, onProgress,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  enrollmentId: number;
  lessonId: number;
  learnerId: number;
  title: string;
  chapter?: string | null;
  videoUrl?: string | null;
  durationMinutes: number;
  initial: LessonInitial;
  onProgress?: () => void;
}) {
  const durationSec = Math.max(1, Math.round(durationMinutes * 60));
  const playable = isPlayable(videoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(initial.lastPositionSec ?? 0);
  const savedAtRef = useRef(initial.lastPositionSec ?? 0);

  const [curSec, setCurSec] = useState(initial.lastPositionSec ?? 0);
  const [dur, setDur] = useState(playable ? 0 : durationSec);
  const [watchRate, setWatchRate] = useState(initial.watchRate ?? 0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(initial.completed ?? false);
  const [speed, setSpeed] = useState(1);

  const record = trpc.lms.recordProgress.useMutation({
    onSuccess: () => onProgress?.(),
    // 順番制御でロックされたレッスンはサーバー側でも拒否される(防御的二重チェック)。
    onError: e => { toast.error(e.message); setPlaying(false); onOpenChange(false); },
  });

  // 視聴ログを保存(閾値到達・強制・一定間隔ごと)。maxWatchedRefは単調増加。
  function persist(cur: number, d: number, force = false) {
    const wr = d > 0 ? Math.min(100, Math.round((maxWatchedRef.current / d) * 100)) : 0;
    setWatchRate(wr);
    const done = wr >= THRESHOLD;
    if (force || done || maxWatchedRef.current - savedAtRef.current >= SAVE_EVERY_SEC) {
      savedAtRef.current = maxWatchedRef.current;
      record.mutate({
        enrollmentId, lessonId,
        watchRate: wr,
        completed: done,
        lastPositionSec: Math.round(cur),
        playbackRate: String(speed),
      });
      if (done && !completed) { setCompleted(true); toast.success("視聴完了を記録しました"); }
    }
  }

  // --- 実動画: メタデータ読込で長さ確定＆続きから再開 ---
  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    setDur(v.duration || durationSec);
    if ((initial.lastPositionSec ?? 0) > 0 && (initial.lastPositionSec ?? 0) < (v.duration || durationSec)) {
      v.currentTime = initial.lastPositionSec;
    }
  }
  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    const cur = v.currentTime;
    if (cur > maxWatchedRef.current) maxWatchedRef.current = cur;
    setCurSec(cur);
    persist(cur, v.duration || durationSec);
  }
  // 未視聴区間への早送りを抑止(数秒のバッファは許容、巻き戻しは自由)。
  function onSeeking() {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime > maxWatchedRef.current + 3) {
      v.currentTime = maxWatchedRef.current;
      toast.info("未視聴の区間へは早送りできません");
    }
  }

  // --- デモ擬似再生: 動画URLが無い場合の内部クロック ---
  useEffect(() => {
    if (!open || playable || !playing) return;
    const id = setInterval(() => {
      setCurSec(prev => {
        const next = Math.min(durationSec, prev + speed);
        if (next > maxWatchedRef.current) maxWatchedRef.current = next;
        persist(next, durationSec);
        if (next >= durationSec) setPlaying(false);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, playable, playing, speed, durationSec]);

  // ダイアログを開くたびに擬似再生の表示位置を初期化
  useEffect(() => {
    if (open && !playable) { setCurSec(Math.min(maxWatchedRef.current, durationSec)); }
    if (!open) setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function applySpeed(s: number) {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }
  function restart() {
    if (videoRef.current) { videoRef.current.currentTime = 0; }
    setCurSec(0);
  }

  const shownDur = playable ? (dur || durationSec) : durationSec;
  const pct = Math.min(100, Math.round((curSec / shownDur) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MonitorPlay className="h-4 w-4 text-blue-600" />
            {chapter ? `${chapter} ` : ""}{title}
          </DialogTitle>
        </DialogHeader>

        {/* 映像領域 */}
        <div className="relative overflow-hidden rounded-lg bg-slate-900">
          {playable ? (
            <video
              ref={videoRef}
              src={videoUrl!}
              className="aspect-video w-full"
              controls
              onLoadedMetadata={onLoadedMetadata}
              onTimeUpdate={onTimeUpdate}
              onSeeking={onSeeking}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onRateChange={() => setSpeed(videoRef.current?.playbackRate ?? 1)}
              onEnded={() => { const v = videoRef.current; if (v) persist(v.currentTime, v.duration || durationSec, true); }}
            />
          ) : (
            // デモ擬似プレイヤー
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 text-slate-300">
              <MonitorPlay className="h-12 w-12 opacity-70" />
              <div className="text-sm">デモ再生（動画URL未設定）</div>
              <div className="text-3xl font-bold tabular-nums text-white">{fmt(curSec)} <span className="text-base font-normal text-slate-400">/ {fmt(durationSec)}</span></div>
              {completed && <div className="flex items-center gap-1 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> 視聴完了</div>}
            </div>
          )}
        </div>

        {/* シークバー(視聴率) */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">{fmt(curSec)} / {fmt(shownDur)}</span>
            <span className={cn("font-semibold tabular-nums", watchRate >= THRESHOLD ? "text-emerald-600" : "text-blue-600")}>視聴率 {watchRate}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {/* 視聴済み(最大到達) */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-blue-200 dark:bg-blue-900" style={{ width: `${Math.min(100, Math.round((maxWatchedRef.current / shownDur) * 100))}%` }} />
            {/* 現在位置 */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* コントロール */}
        <div className="flex flex-wrap items-center gap-2">
          {!playable && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setPlaying(p => !p)} disabled={curSec >= durationSec && !playing}>
              {playing ? <><Pause className="mr-1.5 h-4 w-4" /> 一時停止</> : <><Play className="mr-1.5 h-4 w-4" /> {curSec > 0 && curSec < durationSec ? "続きから再生" : "再生"}</>}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={restart}><RotateCcw className="mr-1.5 h-4 w-4" /> 最初から</Button>

          <div className="ml-1 flex items-center gap-1 text-xs text-slate-500">
            <span>速度</span>
            {[1, 1.5, 2].map(s => (
              <button key={s} onClick={() => applySpeed(s)} className={cn("rounded px-2 py-1 font-medium", speed === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}>{s}x</button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs">
            {completed
              ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> 視聴完了</span>
              : <span className="inline-flex items-center gap-1 text-slate-400"><Lock className="h-3.5 w-3.5" /> 視聴率{THRESHOLD}%で完了</span>}
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          ※ 視聴位置と視聴率は自動で記録されます（証跡）。未視聴区間への早送りは制限され、視聴率{THRESHOLD}%以上で「視聴完了」になります。
        </p>
      </DialogContent>
    </Dialog>
  );
}
