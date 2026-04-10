import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-zinc-900">
          BrainDump
        </Link>
        <nav className="flex gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            New Dump
          </Link>
          <Link
            href="/plans"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            My Plans
          </Link>
        </nav>
      </div>
    </header>
  );
}
