"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshUser, token } = useAuthStore();

  useEffect(() => {
    if (token) refreshUser();
  }, [token, refreshUser]);

  return <>{children}</>;
}
