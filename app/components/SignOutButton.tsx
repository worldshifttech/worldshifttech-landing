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
      className="text-sm text-[#767B7A] hover:text-[#F4F2EE] transition-colors duration-200"
    >
      Sign Out
    </button>
  );
}
