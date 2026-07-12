import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * 認証（Auth.js / NextAuth v5）。
 *
 * 本システムは内部利用者のみログイン可能（要件定義書 3.1 / 3.2）。
 * 許可メールは環境変数で制御する:
 *   AUTH_ALLOWED_EMAILS  … カンマ区切りの許可メール（完全一致）
 *   AUTH_ALLOWED_DOMAIN  … 許可ドメイン（例: yatoaka.example.jp）
 * どちらも未設定の場合は「全 Google アカウント許可」（試作の初期値）。
 */
function parseList(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const addr = email.toLowerCase();
  const allowedEmails = parseList(process.env.AUTH_ALLOWED_EMAILS);
  const allowedDomains = parseList(process.env.AUTH_ALLOWED_DOMAIN);

  // 何も設定されていなければ全許可（試作）。
  if (allowedEmails.length === 0 && allowedDomains.length === 0) return true;

  if (allowedEmails.includes(addr)) return true;
  const domain = addr.split("@")[1] ?? "";
  if (allowedDomains.includes(domain)) return true;
  return false;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // 内部利用者のみログインを許可
    async signIn({ user }) {
      return isEmailAllowed(user.email);
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.name = (profile.name as string) ?? token.name;
        token.picture = (profile.picture as string) ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
