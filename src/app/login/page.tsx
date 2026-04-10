"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const avatarColors = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626",
  "#db2777", "#9333ea", "#0891b2", "#65a30d", "#ea580c",
];

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), avatarColor: selectedColor }),
    });
    router.push("/");
  }

  const initials = name.trim()
    ? name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900">Welcome to BrainDump</h1>
          <p className="mt-2 text-base text-zinc-500">Set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-8">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              {initials}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-base font-medium text-zinc-700 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-base text-zinc-800 placeholder-zinc-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
              autoFocus
            />
          </div>

          {/* Avatar color picker */}
          <div>
            <label className="block text-base font-medium text-zinc-700 mb-3">Avatar Color</label>
            <div className="flex flex-wrap gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="h-10 w-10 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    boxShadow: selectedColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full rounded-xl bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Setting up..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
