"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const avatarColors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#db2777", "#9333ea", "#0891b2", "#65a30d", "#ea580c"];

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [rememberMe, setRememberMe] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      if (d?.name) { setName(d.name); setSelectedColor(d.avatarColor || avatarColors[0]); setIsExisting(true); }
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), avatarColor: selectedColor }) });
    if (rememberMe) localStorage.setItem("braindump-profile", JSON.stringify({ name: name.trim(), avatarColor: selectedColor }));
    window.location.href = "/";
  }

  const initials = name.trim() ? name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">{isExisting ? "Edit Profile" : "Welcome to BrainDump"}</h1>
          <p className="mt-1 text-sm text-zinc-500">{isExisting ? "Update your info" : "Create your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 p-6 space-y-5">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: selectedColor }}>{initials}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-violet-300" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Avatar Color</label>
            <div className="flex flex-wrap gap-2.5">
              {avatarColors.map((c) => (
                <button key={c} type="button" onClick={() => setSelectedColor(c)} className="h-9 w-9 rounded-full" style={{ backgroundColor: c, boxShadow: selectedColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none" }} />
              ))}
            </div>
          </div>
          {!isExisting && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-violet-600" />
              <span className="text-sm text-zinc-600">Remember me</span>
            </label>
          )}
          <button type="submit" disabled={!name.trim() || saving} className="w-full rounded-xl bg-violet-600 py-3 text-base font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? "Saving..." : isExisting ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
