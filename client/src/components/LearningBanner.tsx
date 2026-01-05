import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle,
  X,
  ChevronRight,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "wouter";

interface LearningBannerProps {
  variant?: "dashboard" | "feature" | "compact";
  featureName?: string;
  relatedVideoId?: string;
}

// Mock data for learning progress
const LEARNING_DATA = {
  currentLevel: "実践編",
  completedVideos: 5,
  totalVideos: 12,
  nextVideo: {
    id: "video_4",
    title: "一斉配信とステップ配信",
    duration: "8分",
    level: "実践編",
    thumbnail: "https://placehold.co/320x180/06C755/FFFFFF?text=Tutorial+Video",
  },
  recommendedVideos: [
    {
      id: "video_5",
      title: "セグメント配信とタグ管理",
      duration: "10分",
      level: "実践編",
    },
    {
      id: "video_6",
      title: "クーポンとフォーム活用",
      duration: "7分",
      level: "実践編",
    },
  ],
  achievements: [
    { id: 1, name: "基礎マスター", unlocked: true },
    { id: 2, name: "実践者", unlocked: false },
  ],
};

const FEATURE_VIDEOS: Record<string, { id: string; title: string; duration: string }> = {
  broadcast: {
    id: "video_4",
    title: "一斉配信とステップ配信の活用法",
    duration: "8分",
  },
  tags: {
    id: "video_5",
    title: "セグメント配信とタグ管理",
    duration: "10分",
  },
  forms: {
    id: "video_6",
    title: "クーポンとフォーム活用",
    duration: "7分",
  },
  "rich-menus": {
    id: "video_2",
    title: "リッチメニューの作成と最適化",
    duration: "5分",
  },
  analysis: {
    id: "video_8",
    title: "データ分析とKPI管理",
    duration: "10分",
  },
};

export default function LearningBanner({
  variant = "dashboard",
  featureName,
  relatedVideoId,
}: LearningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const progress = (LEARNING_DATA.completedVideos / LEARNING_DATA.totalVideos) * 100;

  // Dashboard variant - Full banner with progress
  if (variant === "dashboard") {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Video Thumbnail */}
            <div className="hidden md:block flex-shrink-0">
              <div className="relative w-48 h-28 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={LEARNING_DATA.nextVideo.thumbnail}
                  alt={LEARNING_DATA.nextVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  学習を続けましょう
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {LEARNING_DATA.currentLevel}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                次のステップ: <span className="font-medium">{LEARNING_DATA.nextVideo.title}</span>
                <span className="text-gray-400 ml-2">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {LEARNING_DATA.nextVideo.duration}
                </span>
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>学習進捗</span>
                  <span>
                    {LEARNING_DATA.completedVideos} / {LEARNING_DATA.totalVideos} 完了
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link href="/learning">
                  <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
                    <PlayCircle className="w-4 h-4" />
                    続きを見る
                  </Button>
                </Link>
                <Link href="/learning">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    全ての動画を見る
                  </Button>
                </Link>
              </div>
            </div>

            {/* Achievements */}
            <div className="hidden lg:flex flex-col gap-2">
              <div className="text-xs font-medium text-gray-500 mb-1">実績</div>
              {LEARNING_DATA.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    achievement.unlocked
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50 border border-gray-200 opacity-50"
                  }`}
                >
                  <Award
                    className={`w-4 h-4 ${
                      achievement.unlocked ? "text-yellow-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-xs">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Feature variant - Contextual help for specific features
  if (variant === "feature" && featureName) {
    const video = FEATURE_VIDEOS[featureName];
    if (!video) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              この機能の使い方を学ぶ
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {video.title}（{video.duration}）
            </p>
            <Link href={`/learning?video=${video.id}`}>
              <Button size="sm" variant="outline" className="gap-2">
                動画を見る
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant - Minimal inline hint
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
        <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-gray-700">
          この機能をマスターして売上アップ！
        </span>
        <Link href="/learning">
          <Button size="sm" variant="link" className="h-auto p-0 text-xs text-green-600">
            学習する
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 ml-auto"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return null;
}
