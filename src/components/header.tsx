"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-zinc-900">BrainDump</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              pathname === "/"
                ? "bg-violet-50 text-violet-700"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            )}
          >
            New Dump
          </Link>
          <Link
            href="/plans"
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              pathname === "/plans" || pathname.startsWith("/plan/")
                ? "bg-violet-50 text-violet-700"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            )}
          >
            My Plans
          </Link>
        </nav>
      </div>
    </header>
  );
}
