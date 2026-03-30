"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    // Simple redirect based on email logic or role. 
    // We already update role in `login()`, so let's redirect.
    // For demo, if email contains 'manager' or we matched elena@, it's manager.
    if (email.toLowerCase().includes("elena") || email.toLowerCase().includes("manager")) {
      router.push("/manager/dashboard");
    } else {
      router.push("/employee/dashboard");
    }
  };

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

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@caring.com OR elena@caring.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value="password"
                onChange={() => {}} // dummy
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
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
              className="w-full bg-brand-900 hover:bg-brand-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 mt-4 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Sign In to Portal
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Demo logins: <br/>
              <span className="font-semibold">sarah@caring.com</span> (Employee) <br/>
              <span className="font-semibold">elena@caring.com</span> (Manager)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
