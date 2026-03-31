"use client";

import type { UserRole } from "@/lib/types";
import { useSession } from "next-auth/react";
import React, { createContext, useContext } from "react";

interface AuthUser {
  email: string;
  name: string;
  nameVi: string;
  role: UserRole;
  machineNo: string;
  isApprover: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// DEV_MODE: ダミーユーザーで認証バイパス（本番ではsession版に戻すこと）
const DEV_MODE = !process.env.NEXT_PUBLIC_GAS_URL;

const DEV_USER: AuthUser = {
  email: "staff1@lcart-official.co.jp",
  name: "田中太郎",
  nameVi: "Tanaka Taro",
  role: "staff",
  machineNo: "M06",
  isApprover: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null = DEV_MODE
    ? DEV_USER
    : session?.user && (session.user as Record<string, unknown>).role
      ? {
          email: session.user.email || "",
          name:
            ((session.user as Record<string, unknown>).userName as string) ||
            session.user.name ||
            "",
          nameVi:
            ((session.user as Record<string, unknown>).userNameVi as string) ||
            "",
          role: (session.user as Record<string, unknown>).role as UserRole,
          machineNo:
            ((session.user as Record<string, unknown>).machineNo as string) ||
            "M06",
          isApprover: ["kakarichou", "hinshitsu", "buchou", "admin"].includes(
            (session.user as Record<string, unknown>).role as string
          ),
        }
      : null;

  return (
    <AuthContext.Provider value={{ user, isLoading: DEV_MODE ? false : status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
