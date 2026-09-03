"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Image from "next/image";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      {/* Full-bleed brand photograph. The scrim is not decorative: the mark and
        * the form both sit over it, and the spec forbids placing brand marks on
        * a busy photograph without one. */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/Brand Photos/095A1178.webp"
          alt=""
          fill
          sizes="100vw"
          className="cg-photo-settle object-cover"
          priority
        />
        <div className="absolute inset-0 animate-in fade-in duration-700 ease-cg bg-ink/80" />
        {/* Vertical falloff keeps the centre readable while the photograph
          * still shows through at the edges. */}
        <div className="absolute inset-0 animate-in fade-in duration-700 ease-cg bg-gradient-to-b from-ink/70 via-ink/40 to-ink/90" />
      </div>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-6">
        <div className="w-full max-w-[26rem]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/cg-leaf-mark.png"
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 animate-in fade-in zoom-in-95 duration-500 delay-100 ease-cg object-contain"
              priority
            />
            <h1 className="mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 ease-cg text-3xl text-white sm:text-4xl">
              Sign in to CG Connect
            </h1>
            <p className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 ease-cg text-sm text-white/70">
              Enter your details below to reach your portal.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-status-error/40 bg-status-error-soft p-4 text-sm text-status-error"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {state.error}
              </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 ease-cg space-y-2">
              <label htmlFor="email" className="cg-eyebrow block text-white/70">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder="you@caringgroup.org"
                  defaultValue="sarah@caring.com"
                  className="h-12 w-full rounded-[var(--radius-panel)] border border-white/20 bg-white/10 pl-11 pr-4 text-white transition-colors placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
                />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-[380ms] ease-cg space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="password" className="cg-eyebrow block text-white/70">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-accent-soft underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Forgotten your password?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  defaultValue="password123"
                  className="h-12 w-full rounded-[var(--radius-panel)] border border-white/20 bg-white/10 pl-11 pr-12 text-white transition-colors placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
                />
                {/* Typing a password blind on a phone is where sign-ins fail. */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-4 focus:ring-white/10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="cg-btn-primary h-12 w-full animate-in fade-in slide-in-from-bottom-3 duration-500 delay-[460ms] ease-cg"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  One moment.
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 animate-in fade-in duration-500 delay-[560ms] ease-cg text-center text-sm text-white/60">
            Trouble getting in?{" "}
            <a
              href="mailto:admin@caring.com"
              className="text-accent-soft underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Ask your administrator
            </a>
          </p>
        </div>
      </main>

      <footer className="relative animate-in fade-in duration-500 delay-700 ease-cg px-5 pb-8 text-center sm:px-6">
        <p className="cg-meta text-white/45">Demo sign-in — sarah@caring.com / password123</p>
        <p className="cg-meta mt-2 text-white/35">
          © {new Date().getFullYear()} The Caring Group · Trust. Leadership. Confidence.
        </p>
      </footer>
    </div>
  );
}
