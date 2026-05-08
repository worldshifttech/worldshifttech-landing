"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuestProjectAttacher() {
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("guestProjectId="));
    if (!hasCookie) return;
    document.cookie = "guestProjectId=;path=/;max-age=0";
    console.log("[GUEST ATTACH HANDLED SERVER SIDE]");
    router.refresh();
  }, [router]);

  return null;
}
