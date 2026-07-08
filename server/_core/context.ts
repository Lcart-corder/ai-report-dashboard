import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * 開発用の認証バイパス(本番では絶対に有効化されない)。
 * NODE_ENV !== "production" かつ環境変数 LMS_DEV_LOGIN=1 のときのみ、
 * 合成の運営管理者ユーザーを注入する。OAuth/DB無しでLMSのUIを確認するための仕組み。
 * メール/氏名は LMS_DEV_EMAIL / LMS_DEV_NAME で上書き可能。
 */
function devBypassUser(): User | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.LMS_DEV_LOGIN !== "1") return null;
  const now = new Date();
  return {
    id: 0,
    openId: "dev-local",
    name: process.env.LMS_DEV_NAME ?? "開発ユーザー",
    email: process.env.LMS_DEV_EMAIL ?? "dev@example.com",
    loginMethod: "dev",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // 未認証かつ開発バイパスが有効なら合成ユーザーを使用(本番無効)
  if (!user) {
    user = devBypassUser();
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
