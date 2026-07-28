"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadAuth, clearAuth, getDashboardPath } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/types";

export interface UseAuthReturn {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = loadAuth();
    if (auth) {
      setUser(auth.user);
      setToken(auth.token);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.replace("/login");
  }, [router]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    logout,
  };
}

/** Guard: redirect ke login jika tidak auth, atau ke dashboard jika role salah */
export function useRequireRole(requiredRole: AdminUser["role"]) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (auth.user?.role !== requiredRole) {
      router.replace(getDashboardPath(auth.user!.role));
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, requiredRole, router]);

  return auth;
}
