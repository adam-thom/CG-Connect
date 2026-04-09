"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - Branding (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-500 relative flex-col justify-center px-12 overflow-hidden">
        <div className="relative z-10 flex items-center justify-center w-full px-4 xl:px-12">
          <div className="flex items-center justify-center gap-2 xl:gap-4">
            <Image 
              src="/2026-CG-Branding-optomized.png" 
              alt="The Caring Group" 
              width={380} 
              height={95} 
              className="object-contain w-[260px] lg:w-[320px] xl:w-[380px]" 
              priority 
            />
            <div className="w-[1px] h-12 xl:h-16 bg-white/40 shrink-0"></div>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-light text-white tracking-tight whitespace-nowrap shrink-0">
              Staff Connect
            </h2>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10 relative bg-white lg:bg-transparent">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="bg-brand-900 px-6 py-4 rounded-2xl shadow-inner w-full flex justify-center">
                <Image src="/2026-CG-Branding-optomized.png" alt="The Caring Group" width={240} height={60} className="object-contain" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Sign In</h3>
            <p className="text-slate-500 mt-2">Access your employee portal</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {state.error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="sarah@caring.com OR elena@caring.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  defaultValue="password123"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-brand-700 hover:text-brand-900 font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-900 hover:bg-brand-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 mt-4 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPending ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Demo logins: <br/>
              <span className="font-semibold">sarah@caring.com</span> (password123) <br/>
              <span className="font-semibold">elena@caring.com</span> (password123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
