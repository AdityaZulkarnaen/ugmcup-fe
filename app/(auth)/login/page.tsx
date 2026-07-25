"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, saveAuth, loadAuth, getDashboardPath } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    const auth = loadAuth();
    if (auth) {
      router.replace(getDashboardPath(auth.user.role));
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { token, user } = await login(username, password);
      saveAuth(token, user);
      router.replace(getDashboardPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Periksa kembali credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #14183B 0%, #000033 100%)" }}
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #8352D9 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #66FFB4 0%, transparent 70%)" }}
      />

      {/* Login card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl border p-8 shadow-2xl"
        style={{
          background: "rgba(20, 24, 59, 0.8)",
          borderColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="/images/global/logo.webp"
            alt="UGM Cup"
            width={1200}
            height={300}
            className="h-10 w-auto"
          />
          <div className="text-center">
            <h1 className="text-xl font-black italic text-white">Portal Manajemen</h1>
            <p className="mt-1 text-sm" style={{ color: "#9D9DB6" }}>
              UGM CUP 2026 — Internal Dashboard
            </p>
          </div>
        </div>

        {/* Eyebrow pill */}
        <div className="mb-6 flex justify-center">
          <span
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{
              borderColor: "rgba(131,82,217,0.4)",
              background: "rgba(131,82,217,0.1)",
              color: "#66FFB4",
            }}
          >
            🔒 Akses Terbatas — Panitia
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9D9DB6" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              autoComplete="username"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(131,82,217,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9D9DB6" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(131,82,217,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          {error && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl py-3 text-sm font-black italic text-[#14183B] transition hover:brightness-110 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #66FFB4 0%, #02F5D4 100%)" }}
          >
            {isLoading ? "Masuk..." : "Masuk →"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: "#9D9DB6" }}>
          Hak akses dikelola oleh Super Admin UGM CUP.
        </p>
      </div>
    </div>
  );
}
