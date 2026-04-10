"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Checklist" },
  { href: "/schedule", label: "Schedule" },
  { href: "/calendar", label: "Calendar" },
  { href: "/streak", label: "Streak" },
  { href: "/theme", label: "Theme" },
];

interface Profile { name: string; avatarColor: string; }

export function Header() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("braindump-profile");
    if (cached) { try { setProfile(JSON.parse(cached)); } catch {} }
    fetch("/api/profile").then((r) => r.json()).then((data: Profile | null) => {
      if (data?.name) { setProfile(data); localStorage.setItem("braindump-profile", JSON.stringify(data)); }
    }).catch(() => {});
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  if (pathname === "/login") return null;

  const initials = profile?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="border-b border-zinc-200/80 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-zinc-900 hidden sm:block">BrainDump</span>
        </Link>
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={clsx(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              isActive(item.href) ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            )}>{item.label}</Link>
          ))}
        </nav>
        {profile && initials && (
          <Link href="/login" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-zinc-50 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: profile.avatarColor || "#7c3aed" }}>{initials}</div>
            <span className="text-sm font-medium text-zinc-700 hidden sm:block">{profile.name.split(" ")[0]}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
