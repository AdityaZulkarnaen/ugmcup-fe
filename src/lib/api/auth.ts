import { apiRequest } from "./client";
import type { AdminUser } from "@/lib/types";

interface LoginResponse {
  access_token: string;
}

interface DecodedJwt {
  sub: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

function decodeJwt(token: string): DecodedJwt {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload)) as DecodedJwt;
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string; user: AdminUser }> {
  const res = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const decoded = decodeJwt(res.access_token);
  const user: AdminUser = {
    id: decoded.sub,
    username: decoded.username,
    role: decoded.role as AdminUser["role"],
  };

  return { token: res.access_token, user };
}

export function saveAuth(token: string, user: AdminUser): void {
  localStorage.setItem("ugmcup_token", token);
  localStorage.setItem("ugmcup_user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("ugmcup_token");
  localStorage.removeItem("ugmcup_user");
}

export function loadAuth(): { token: string; user: AdminUser } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("ugmcup_token");
  const userStr = localStorage.getItem("ugmcup_user");
  if (!token || !userStr) return null;
  try {
    const user = JSON.parse(userStr) as AdminUser;
    return { token, user };
  } catch {
    return null;
  }
}

export function getDashboardPath(role: AdminUser["role"]): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin";
    case "EDITOR_KONTEN":
      return "/media";
    default:
      return "/login";
  }
}
