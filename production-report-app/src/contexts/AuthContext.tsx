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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null =
    session?.user && (session.user as Record<string, unknown>).role
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
    <AuthContext.Provider value={{ user, isLoading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
