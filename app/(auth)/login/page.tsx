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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-bg">
      {/* Background sama dengan Hero section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-360 w-360">
        <Image
          src="/images/landing/halo-top.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 translate-y-270 -right-100 h-488 w-488">
        <Image
          src="/images/landing/halo-bottom.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Decorative shuttlecocks */}
      <div className="pointer-events-none absolute -left-28 top-36 h-32 w-32 sm:h-132 sm:w-132">
        <Image src="/images/landing/cock2.png" alt="" fill sizes="50vw" className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -right-36 top-10 h-32 w-32 sm:h-144 sm:w-144">
        <Image src="/images/landing/cock1.png" alt="" fill sizes="50vw" priority className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -bottom-52 right-32 h-32 w-32 sm:h-120 sm:w-120">
        <Image src="/images/landing/cock3.png" alt="" fill sizes="50vw" className="object-contain" />
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-login {
          animation: slideUpFade 0.8s ease-out forwards;
        }
      `}</style>

      {/* Login card: transparan & minimalis */}
      <div className="animate-login relative z-10 w-full max-w-sm p-8 flex flex-col items-center">
        {/* Logo & Sign In */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <Image
            src="/images/global/logo.webp"
            alt="UGM Cup"
            width={400}
            height={100}
            className="h-12 w-auto"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
              className="w-full bg-transparent px-2 py-3 text-sm text-white placeholder-white/50 outline-none border-0 border-b border-white/30 transition-all focus:border-white focus:ring-0"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full bg-transparent px-2 py-3 text-sm text-white placeholder-white/50 outline-none border-0 border-b border-white/30 transition-all focus:border-white focus:ring-0"
            />
          </div>

          {error && (
            <div className="text-center text-xs text-red-400 mt-2">
              {error}
            </div>
          )}

          <div className="pt-6 flex flex-col">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-white/10 py-3.5 text-sm font-semibold tracking-wider text-white uppercase transition-all hover:bg-white hover:text-black disabled:opacity-50"
            >
              {isLoading ? "sek yoo..." : "Login"}
            </button>
            <p className="mt-3 text-right text-[10px] tracking-widest text-white/40 uppercase">
              Internal Only
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
