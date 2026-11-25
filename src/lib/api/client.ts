const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL || "/backend-api";
const SERVER_BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN || "http://54.66.6.54"
).replace(/\/+$/, "");

function resolveApiBase(): string {
  // Di Server Component / SSR Next.js, path relatif (/backend-api) tidak valid untuk fetch() Node.js,
  // sehingga diarahkan langsung ke origin backend EC2.
  if (typeof window === "undefined" && PUBLIC_API_BASE.startsWith("/")) {
    return `${SERVER_BACKEND_ORIGIN}/api`;
  }
  return PUBLIC_API_BASE;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ugmcup_token");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${resolveApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const API_BASE_URL = PUBLIC_API_BASE;
