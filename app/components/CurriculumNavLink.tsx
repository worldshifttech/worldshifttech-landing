"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function CurriculumNavLink({
  className,
}: {
  className?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    getSupabaseBrowser()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session) setShow(true);
      });
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/curriculum"
      className={
        className ??
        "text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
      }
    >
      Curriculum
    </Link>
  );
}
