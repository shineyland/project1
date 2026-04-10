"use client";

import { useState, useEffect, useRef } from "react";

const accentColors = [
  { name: "Violet", value: "#7c3aed" },
  { name: "Blue", value: "#2563eb" },
  { name: "Teal", value: "#0891b2" },
  { name: "Green", value: "#059669" },
  { name: "Orange", value: "#d97706" },
  { name: "Red", value: "#dc2626" },
  { name: "Pink", value: "#db2777" },
  { name: "Indigo", value: "#4f46e5" },
];

const avatarColors = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626",
  "#db2777", "#9333ea", "#0891b2", "#65a30d", "#ea580c",
  "#475569", "#1e293b",
];

export default function ThemePage() {
  const [accent, setAccent] = useState("#7c3aed");
  const [avatarColor, setAvatarColor] = useState("#7c3aed");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("User");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved theme
    const savedAccent = localStorage.getItem("braindump-accent");
    const savedBg = localStorage.getItem("braindump-bg");
    if (savedAccent) setAccent(savedAccent);
    if (savedBg) setBgImage(savedBg);

    // Load profile
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setAvatarColor(data.avatarColor || "#7c3aed");
          setProfileName(data.name || "User");
        }
      });
  }, []);

  function handleAccentChange(color: string) {
    setAccent(color);
    localStorage.setItem("braindump-accent", color);
    document.documentElement.style.setProperty("--accent-color", color);
  }

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBgImage(dataUrl);
      localStorage.setItem("braindump-bg", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function removeBg() {
    setBgImage(null);
    localStorage.removeItem("braindump-bg");
  }

  async function saveAvatarColor(color: string) {
    setAvatarColor(color);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarColor: color }),
    });
  }

  async function saveAll() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = profileName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Theme & Appearance</h1>
        <p className="mt-2 text-base text-zinc-500">Customize how BrainDump looks</p>
      </div>

      <div className="space-y-8">
        {/* App accent color */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-zinc-700 mb-2">App Color</h2>
          <p className="text-base text-zinc-400 mb-5">Choose your accent color</p>
          <div className="flex flex-wrap gap-4">
            {accentColors.map((c) => (
              <button
                key={c.value}
                onClick={() => handleAccentChange(c.value)}
                className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <div
                  className="h-14 w-14 rounded-2xl shadow-sm transition-all"
                  style={{
                    backgroundColor: c.value,
                    outline: accent === c.value ? "3px solid" : "none",
                    outlineColor: c.value,
                    outlineOffset: "4px",
                  }}
                />
                <span className="text-xs font-medium text-zinc-500">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar color */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-zinc-700 mb-2">Avatar</h2>
          <p className="text-base text-zinc-400 mb-5">Change your avatar color</p>
          <div className="flex items-center gap-8">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md transition-colors"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <div className="flex flex-wrap gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  onClick={() => saveAvatarColor(color)}
                  className="h-10 w-10 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    outline: avatarColor === color ? "3px solid" : "none",
                    outlineColor: color,
                    outlineOffset: "3px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Background image */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-zinc-700 mb-2">Background Image</h2>
          <p className="text-base text-zinc-400 mb-5">Upload a custom background for the app</p>
          {bgImage ? (
            <div className="space-y-4">
              <div
                className="h-48 rounded-2xl bg-cover bg-center border border-zinc-200"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-zinc-200 px-5 py-3 text-base font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Change Image
                </button>
                <button
                  onClick={removeBg}
                  className="rounded-xl border border-red-200 px-5 py-3 text-base font-medium text-red-500 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-zinc-300 py-12 text-center hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-base text-zinc-500 font-medium">Click to upload an image</p>
              <p className="mt-1 text-sm text-zinc-400">PNG, JPG up to 5MB</p>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleBgUpload}
            className="hidden"
          />
        </div>

        <button
          onClick={saveAll}
          className="w-full rounded-xl bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow active:scale-[0.98]"
        >
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
