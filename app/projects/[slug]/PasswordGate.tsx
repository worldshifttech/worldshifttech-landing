"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PasswordGate({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/project-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "Incorrect password" ? "Incorrect password." : "Something went wrong.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F4F2EE]">
      <div className="w-full max-w-sm bg-white border border-[#00205C]/10 rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
            alt="World Shift Technologies"
            width={160}
            height={38}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-center text-[#76777A] text-sm mb-6">
          This project page is password protected.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-lg px-4 py-3 text-sm text-[#00205C] placeholder-[#76777A]/50 focus:outline-none focus:border-[#4B858E]/60 transition-colors"
          />
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B858E] text-white font-bold py-3 rounded-full hover:bg-[#3a6b73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "Checking..." : "View Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
