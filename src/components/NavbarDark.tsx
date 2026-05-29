"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  username: string;
  email: string;
}

export default function NavbarDark() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^| )valyou_auth=([^;]+)/);
    const token = tokenMatch ? tokenMatch[2] : null;
    const hasToken = !!token;
    setLoggedIn(hasToken);
    setMenuOpen(false);
    setDropdownOpen(false);

    if (hasToken && token) {
      const stored = localStorage.getItem("valyou_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
          .then(res => {
            if (res.ok) return res.json();
            throw new Error();
          })
          .then(userData => {
            localStorage.setItem("valyou_user", JSON.stringify(userData));
            setUser(userData);
          })
          .catch(() => {
            document.cookie = "valyou_auth=; path=/; max-age=0;";
            localStorage.removeItem("valyou_user");
            setLoggedIn(false);
            setUser(null);
          });
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    const tokenMatch = document.cookie.match(/(^| )valyou_auth=([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/logout`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout API request failed:", e);
      }
    }

    document.cookie = "valyou_auth=; path=/; max-age=0;";
    localStorage.removeItem("valyou_user");
    setLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/auth";
  };

  return (
    <nav className="bg-white/95 dark:bg-[#0f0f0e]/95 supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0f0f0e]/80 backdrop-blur-md border-b border-black/[0.07] dark:border-white/[0.07] h-[60px] flex items-center px-4 sm:px-6 justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0 group">
        <span className="inline-flex w-7 h-7 rounded-lg bg-[#C3110F] items-center justify-center shadow-sm shadow-[#C3110F]/30 group-hover:shadow-md group-hover:shadow-[#C3110F]/40 transition-shadow">
          <MapPin size={14} className="text-white" />
        </span>
        <span className="text-[#242420] dark:text-white">Val<span className="text-[#C3110F]">you</span></span>
      </Link>

      {/* Desktop center link */}
      <Link
        href="/map"
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 h-full items-center px-4 text-sm border-b-2 transition-colors ${pathname === "/map"
            ? "border-[#C3110F] text-[#242420] dark:text-white font-semibold"
            : "border-transparent text-[#242420]/45 dark:text-white/45 hover:text-[#242420] dark:hover:text-white"
          }`}
      >
        Explore Map
      </Link>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-1 text-sm shrink-0">
        <ThemeToggle className="text-[#242420]/50 dark:text-white/50 hover:text-[#242420] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 mr-1" />

        {!loggedIn ? (
          <>
            <Link href="/auth" className="text-[#242420]/60 dark:text-white/60 hover:text-[#242420] dark:hover:text-white transition-colors px-3 py-1.5 rounded-md">
              Log In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="bg-[#C3110F] text-white px-4 py-1.5 rounded-md font-medium hover:bg-[#a80e0d] transition-colors ml-1 shadow-sm shadow-[#C3110F]/20"
            >
              Sign Up
            </Link>
          </>
        ) : (
          user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold text-[#242420] dark:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-[#C3110F]/10 border border-[#C3110F]/20 text-[#C3110F] flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                  {user.username.slice(0, 2)}
                </div>
                <span className="truncate max-w-[120px]">{user.username}</span>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#141413] border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden valyou-fade-up">
                    <div className="px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.05]">
                      <p className="text-[10px] text-[#242420]/45 dark:text-white/45 font-bold uppercase tracking-wider">Logged in as</p>
                      <p className="text-xs font-bold text-[#242420] dark:text-white truncate mt-0.5">{user.username}</p>
                    </div>
                    <Link
                      href="/valuations"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-xs text-[#242420] dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03] font-semibold transition-colors border-b border-black/[0.05] dark:border-white/[0.05]"
                    >
                      Previous Valuations
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#C3110F] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] font-semibold transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* Mobile actions */}
      <div className="flex md:hidden items-center gap-1">
        <ThemeToggle className="text-[#242420]/50 dark:text-white/50 hover:text-[#242420] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10" />
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[#242420]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-[60px] bg-black/30 dark:bg-black/60 md:hidden z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute md:hidden top-full inset-x-0 bg-white dark:bg-[#0f0f0e] border-b border-black/[0.07] dark:border-white/[0.07] shadow-lg z-50 valyou-fade-up">
            <div className="px-4 py-3 flex flex-col gap-1">
              <Link
                href="/map"
                className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-colors ${pathname === "/map"
                    ? "bg-[#C3110F]/10 text-[#C3110F] font-semibold"
                    : "text-[#242420]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <MapPin size={14} />
                Explore Map
              </Link>

              {!loggedIn ? (
                <div className="flex gap-2 pt-2 mt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <Link
                    href="/auth"
                    className="flex-1 text-center py-2.5 rounded-md text-sm border border-black/10 dark:border-white/10 text-[#242420]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="flex-1 text-center py-2.5 rounded-md text-sm bg-[#C3110F] text-white font-medium hover:bg-[#a80e0d] transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                user && (
                  <div className="flex flex-col gap-3 py-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-1">
                      <div className="w-9 h-9 rounded-full bg-[#C3110F]/10 border border-[#C3110F]/20 text-[#C3110F] flex items-center justify-center font-bold text-xs uppercase">
                        {user.username.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#242420] dark:text-white truncate">{user.username}</p>
                        <p className="text-xs text-[#242420]/45 dark:text-white/45 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/valuations"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-md text-sm bg-black/[0.04] dark:bg-white/[0.04] text-[#242420] dark:text-white font-bold hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors"
                    >
                      Previous Valuations
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center py-2.5 rounded-md text-sm bg-black/[0.04] dark:bg-white/[0.04] text-[#C3110F] font-bold hover:bg-[#C3110F]/10 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
