"use client";

import { useState, useEffect, useRef } from "react";
import { applyAccentColor } from "@/components/theme-provider";

const accentColors = [
  { name: "Violet", value: "#7c3aed" }, { name: "Blue", value: "#2563eb" },
  { name: "Teal", value: "#0891b2" }, { name: "Green", value: "#059669" },
  { name: "Orange", value: "#d97706" }, { name: "Red", value: "#dc2626" },
  { name: "Pink", value: "#db2777" }, { name: "Indigo", value: "#4f46e5" },
];
const avatarColors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#db2777", "#9333ea", "#0891b2", "#65a30d", "#ea580c", "#475569", "#1e293b"];

export default function ThemePage() {
  const [accent, setAccent] = useState("#7c3aed");
  const [avatarColor, setAvatarColor] = useState("#7c3aed");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("User");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sa = localStorage.getItem("braindump-accent"); if (sa) setAccent(sa);
    const sb = localStorage.getItem("braindump-bg"); if (sb) setBgImage(sb);
    fetch("/api/profile").then((r) => r.json()).then((d) => { if (d) { setAvatarColor(d.avatarColor || "#7c3aed"); setProfileName(d.name || "User"); } });
  }, []);

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function saveAll() {
    localStorage.setItem("braindump-accent", accent);
    applyAccentColor(accent);
    if (bgImage) {
      localStorage.setItem("braindump-bg", bgImage);
      document.body.style.setProperty("background-image", `url(${bgImage})`, "important");
      document.body.style.setProperty("background-size", "cover", "important");
      document.body.style.setProperty("background-position", "center", "important");
      document.body.style.setProperty("background-attachment", "fixed", "important");
      document.body.style.setProperty("background-color", "transparent", "important");
    } else {
      localStorage.removeItem("braindump-bg");
      document.body.style.removeProperty("background-image");
      document.body.style.setProperty("background-color", "#f0f0f5");
    }
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatarColor }) });
    const cached = localStorage.getItem("braindump-profile");
    if (cached) { try { const p = JSON.parse(cached); p.avatarColor = avatarColor; localStorage.setItem("braindump-profile", JSON.stringify(p)); } catch {} }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const initials = profileName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-5 py-5">
      <h1 className="text-2xl font-bold text-zinc-900 mb-4">Theme</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Accent color */}
        <div className="rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-base font-semibold text-zinc-700 mb-1">App Color</h2>
          <p className="text-sm text-zinc-400 mb-4">Changes buttons and highlights</p>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((c) => (
              <button key={c.value} onClick={() => { setAccent(c.value); applyAccentColor(c.value); }} className="flex flex-col items-center gap-1.5">
                <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: c.value, boxShadow: accent === c.value ? `0 0 0 3px white, 0 0 0 5px ${c.value}` : "none" }} />
                <span className="text-[10px] font-medium text-zinc-500">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div className="rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-base font-semibold text-zinc-700 mb-1">Avatar Color</h2>
          <p className="text-sm text-zinc-400 mb-4">Shown in the header</p>
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ backgroundColor: avatarColor }}>{initials}</div>
            <div className="flex flex-wrap gap-2">
              {avatarColors.map((c) => (
                <button key={c} onClick={() => setAvatarColor(c)} className="h-8 w-8 rounded-full" style={{ backgroundColor: c, boxShadow: avatarColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="rounded-2xl border border-zinc-200 p-5 sm:col-span-2">
          <h2 className="text-base font-semibold text-zinc-700 mb-1">Background Image</h2>
          <p className="text-sm text-zinc-400 mb-4">Custom background for the whole app</p>
          <div className="flex items-start gap-4">
            {bgImage && <div className="h-28 w-48 rounded-xl bg-cover bg-center border border-zinc-200 shrink-0" style={{ backgroundImage: `url(${bgImage})` }} />}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                {bgImage ? "Change" : "Upload Image"}
              </button>
              {bgImage && <button onClick={() => setBgImage(null)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">Remove</button>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
        </div>
      </div>

      <button onClick={saveAll} className="w-full mt-5 rounded-2xl px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]" style={{ background: saved ? "#059669" : `linear-gradient(135deg, ${accent}, ${accent})`, backdropFilter: "none", WebkitBackdropFilter: "none" }}>
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
