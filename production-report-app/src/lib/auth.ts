import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.email = token.email;
        // Fetch user role from Apps Script on first login
        try {
          const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
          const res = await fetch(
            `${gasUrl}?action=getCurrentUser&email=${encodeURIComponent(token.email as string)}`,
            { cache: "no-store" }
          );
          const data = await res.json();
          if (data.success && data.data) {
            token.role = data.data.role;
            token.userName = data.data.name;
            token.userNameVi = data.data.name_vi;
            token.machineNo = data.data.machine_no;
          }
        } catch {
          // Will be retried on next session access
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as unknown as Record<string, unknown>;
        user.role = token.role;
        user.userName = token.userName;
        user.userNameVi = token.userNameVi;
        user.machineNo = token.machineNo;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
