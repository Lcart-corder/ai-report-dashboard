/**
 * LMS 通知チャネルの配信層。
 *
 * 方針(多社セグメント配信): 受講者への到達は「メール(Amazon SES)を主軸 + LINE任意」。
 * - メール: CSV登録で全社員のアドレスを保有済み。会社/部署/個人でDBクエリ的にセグメント可能。
 *   Amazon SES は 1,000通 ≈ $0.10 と最安クラスで、多社化しても線形にスケール。
 * - LINE : 友だち追加した希望者(lineUserId 保有)にのみプッシュ。あれば嬉しい補助チャネル。
 * - 管理者/協業先向けの内部通知は Slack/Chatwork/Google Chat の Webhook(無料)を想定。
 *
 * いずれも未設定でもビルド/起動は壊さず、送信結果を "sent"|"queued"|"failed" で返す。
 * 認証情報が未設定なら "queued"(記録のみ)にフォールバックし、設定後に実送信へ切り替わる。
 */
import { LineMessagingService } from "./line-messaging";

export type DispatchStatus = "sent" | "queued" | "failed";

/**
 * メール送信(Amazon SES)。
 * 必要な環境変数: AWS_REGION, LMS_MAIL_FROM(送信元/検証済みアドレス), 及びAWS認証情報。
 * @aws-sdk/client-ses は動的importで解決(未インストールでもビルドを壊さない)。
 */
export async function dispatchEmail(to: string | null | undefined, subject: string, body: string): Promise<DispatchStatus> {
  const from = process.env.LMS_MAIL_FROM;
  const region = process.env.AWS_REGION;
  if (!to || !from || !region) return "queued"; // 未設定 → 記録のみ
  try {
    const pkgName = "@aws-sdk/" + "client-ses";
    const mod: any = await import(pkgName).catch(() => null);
    if (!mod?.SESClient) return "queued";
    const client = new mod.SESClient({ region });
    await client.send(
      new mod.SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Text: { Data: body, Charset: "UTF-8" } },
        },
      }),
    );
    return "sent";
  } catch (e) {
    console.warn("[LMS] SES send failed:", e);
    return "failed";
  }
}

/**
 * LINE プッシュ送信。既存の LineMessagingService を利用。
 * LINE公式連携(integrations: line_official)が active かつ lineUserId がある場合のみ実送信。
 */
export async function dispatchLine(lineUserId: string | null | undefined, text: string): Promise<DispatchStatus> {
  if (!lineUserId) return "queued";
  try {
    const svc = new LineMessagingService("lms");
    const ok = await svc.sendTextMessage(lineUserId, text);
    return ok ? "sent" : "queued";
  } catch (e) {
    console.warn("[LMS] LINE push failed:", e);
    return "failed";
  }
}

/**
 * 内部通知Webhook送信(協業先・企業管理者・運営向け)。いずれも無料。
 * - slack / googlechat: Incoming Webhook URL に {text} をPOST
 * - chatwork: API(トークン + ルームID)で body=message をPOST
 */
export async function dispatchWebhook(
  cfg: { channel: string; webhookUrl?: string | null; apiToken?: string | null; roomId?: string | null },
  text: string,
): Promise<DispatchStatus> {
  try {
    if (cfg.channel === "slack") {
      if (!cfg.webhookUrl) return "queued";
      const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return res.ok ? "sent" : "failed";
    }
    if (cfg.channel === "googlechat") {
      if (!cfg.webhookUrl) return "queued";
      const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ text }),
      });
      return res.ok ? "sent" : "failed";
    }
    if (cfg.channel === "chatwork") {
      if (!cfg.apiToken || !cfg.roomId) return "queued";
      const res = await fetch(`https://api.chatwork.com/v2/rooms/${cfg.roomId}/messages`, {
        method: "POST",
        headers: { "X-ChatWorkToken": cfg.apiToken, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ body: text }).toString(),
      });
      return res.ok ? "sent" : "failed";
    }
    return "queued";
  } catch (e) {
    console.warn("[LMS] internal webhook failed:", e);
    return "failed";
  }
}

/** チャネルに応じて配信し、結果ステータスを返す。 */
export async function dispatchByChannel(
  channel: string,
  recipient: { email?: string | null; lineUserId?: string | null },
  subject: string,
  body: string,
): Promise<DispatchStatus> {
  switch (channel) {
    case "email":
      return dispatchEmail(recipient.email, subject, body);
    case "line":
      return dispatchLine(recipient.lineUserId, body);
    case "app":
      // アプリ内通知は受講者ポータルで常時表示するため、ここでは記録のみで送信済み扱い。
      return "sent";
    default:
      // Slack/Chatwork/Google Chat 等の内部通知は将来Webhookで配線。現状は記録のみ。
      return "queued";
  }
}
