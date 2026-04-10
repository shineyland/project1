"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dump" },
  { href: "/today", label: "Today" },
  { href: "/tasks", label: "Tasks" },
  { href: "/plans", label: "Plans" },
  { href: "/streak", label: "Streak" },
  { href: "/insights", label: "Insights" },
];

interface Profile {
  name: string;
  avatarColor: string;
}

export function Header() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Try localStorage first for instant render
    const cached = localStorage.getItem("braindump-profile");
    if (cached) {
      try { setProfile(JSON.parse(cached)); } catch {}
    }
    // Then sync from server
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile | null) => {
        if (data && data.name) {
          setProfile(data);
          localStorage.setItem("braindump-profile", JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Hide header on login page
  if (pathname === "/login") return null;

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-900 hidden sm:block">BrainDump</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-violet-50 text-violet-700"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/theme" className={clsx(
            "rounded-xl p-2 transition-colors",
            pathname === "/theme" ? "bg-violet-50 text-violet-700" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          )}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
          {profile && initials && (
            <Link href="/login" className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-zinc-50 transition-colors" title="Edit profile">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: profile.avatarColor || "#7c3aed" }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{profile.name.split(" ")[0]}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
