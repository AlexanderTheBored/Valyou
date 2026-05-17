"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavbarDark() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(document.cookie.split(";").some((c) => c.trim().startsWith("valyou_auth=")));
  }, [pathname]);

  return (
    <nav className="bg-white dark:bg-[#0f0f0e] border-b border-black/[0.07] dark:border-white/[0.07] h-[60px] flex items-center px-6 justify-between sticky top-0 z-50 relative">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
        <MapPin size={18} className="text-[#C3110F]" />
        <span className="text-[#242420] dark:text-white">Val<span className="text-[#C3110F]">You</span></span>
      </Link>

      {/* Truly centered — absolute so it doesn't shift with left/right widths */}
      <Link
        href="/map"
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 h-full items-center px-4 text-sm border-b-2 transition-colors ${
          pathname === "/map"
            ? "border-[#C3110F] text-[#242420] dark:text-white font-semibold"
            : "border-transparent text-[#242420]/40 dark:text-white/40 hover:text-[#242420]/80 dark:hover:text-white/80"
        }`}
      >
        Explore Map
      </Link>

      <div className="flex items-center gap-1 text-sm shrink-0">
        <ThemeToggle className="text-[#242420]/40 dark:text-white/40 hover:text-[#242420] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10" />
        {!loggedIn && (
          <>
            <Link href="/auth" className="text-[#242420]/50 dark:text-white/50 hover:text-[#242420] dark:hover:text-white transition-colors px-3 py-1.5">
              Log In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="bg-[#C3110F] text-white px-4 py-1.5 rounded font-medium hover:bg-red-700 transition-colors ml-1"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
