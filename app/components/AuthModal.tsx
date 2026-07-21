"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Tab = "login" | "signup";

export default function AuthModal({
  onSignupSuccess,
  openSignupOnMount = false,
  hideTriggers = false,
  guestProjectId,
}: {
  onSignupSuccess?: (userId: string) => void;
  openSignupOnMount?: boolean;
  hideTriggers?: boolean;
  guestProjectId?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      openModal("login");
    }
  }, [searchParams]);

  useEffect(() => {
    if (openSignupOnMount) openModal("signup");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openModal(activeTab: Tab) {
    setTab(activeTab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setError("");
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tab === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(
            authError.message === "Invalid login credentials"
              ? "Wrong email or password."
              : authError.message
          );
          return;
        }
      } else {
        const { data: signUpData, error: authError } = await signUp(email, password);
        if (authError) {
          setError(
            authError.message.toLowerCase().includes("already registered")
              ? "An account with this email already exists."
              : authError.message
          );
          return;
        }
        if (onSignupSuccess && signUpData?.user?.id) {
          closeModal();
          onSignupSuccess(signUpData.user.id);
          return;
        }
      }
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (guestProjectId) {
      document.cookie = `guestProjectId=${guestProjectId};path=/;max-age=3600;SameSite=Lax`;
    }
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://worldshifttech.com/auth/callback",
      },
    });
  }

  return (
    <>
      {/* Nav buttons — hidden when used as a standalone modal trigger */}
      {!hideTriggers && (
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <span className="text-sm text-[#76777A] hidden sm:inline truncate max-w-[180px]">
                {currentUser.email}
              </span>
              <Link
                href="/projects"
                className="text-sm font-bold text-white bg-[#4B858E] px-5 py-2 rounded-full hover:bg-[#3a6b73] transition-colors duration-200"
              >
                View Profile
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => openModal("login")}
                className="text-sm font-medium text-[#00205C]/70 hover:text-[#00205C] transition-colors duration-200"
              >
                Log In
              </button>
              <button
                onClick={() => openModal("signup")}
                className="text-sm font-bold text-white bg-[#4B858E] px-5 py-2 rounded-full hover:bg-[#3a6b73] transition-colors duration-200"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-md bg-white border border-[#00205C]/10 rounded-2xl p-8 shadow-2xl">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-lg text-[#76777A] hover:text-[#00205C] hover:bg-[#00205C]/[0.06] transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-[#00205C]/[0.08]">
              {(["login", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`pt-3 pb-3 text-sm font-semibold transition-colors ${
                    tab === t
                      ? "text-[#4B858E] border-b-2 border-[#4B858E] -mb-px"
                      : "text-[#76777A] hover:text-[#00205C]"
                  }`}
                >
                  {t === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold text-sm py-3 rounded-full hover:bg-gray-100 transition-colors duration-200 mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#00205C]/10" />
              <span className="text-xs text-[#76777A]">or</span>
              <div className="flex-1 h-px bg-[#00205C]/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                  Email
                </label>
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
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-lg px-4 py-3 text-sm text-[#00205C] placeholder-[#76777A]/50 focus:outline-none focus:border-[#4B858E]/60 transition-colors"
                />
              </div>

              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-lg px-4 py-3 text-sm text-[#00205C] placeholder-[#76777A]/50 focus:outline-none focus:border-[#4B858E]/60 transition-colors"
                  />
                </div>
              )}

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
                {loading
                  ? "Working..."
                  : tab === "login"
                  ? "Log In"
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
