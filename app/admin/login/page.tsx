"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "@/lib/auth";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Wrong email or password."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  async function handleGoogleSignIn() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://worldshifttech.com/auth/callback",
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F4F2EE]">
      <div className="w-full max-w-sm bg-white border border-[#00205C]/10 rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-8">
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
            alt="World Shift Technologies"
            width={160}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold text-sm py-3 rounded-full border border-[#00205C]/10 hover:bg-gray-50 transition-colors duration-200 mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#00205C]/10" />
          <span className="text-xs text-[#76777A]">or</span>
          <div className="flex-1 h-px bg-[#00205C]/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#76777A] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-lg px-4 py-3 text-sm text-[#00205C] placeholder-[#76777A]/50 focus:outline-none focus:border-[#4B858E]/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#76777A] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-lg px-4 py-3 text-sm text-[#00205C] placeholder-[#76777A]/50 focus:outline-none focus:border-[#4B858E]/60 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B858E] text-white font-bold py-3 rounded-full hover:bg-[#3a6b73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
