"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-[#76777A] hover:text-[#00205C] transition-colors duration-200"
    >
      Sign Out
    </button>
  );
}
