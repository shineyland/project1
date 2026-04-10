"use client";

import { useEffect } from "react";

function hexToLightVariant(hex: string): string {
  // Create a very light version for backgrounds
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Mix with white at 12% opacity
  const lr = Math.round(r * 0.12 + 255 * 0.88);
  const lg = Math.round(g * 0.12 + 255 * 0.88);
  const lb = Math.round(b * 0.12 + 255 * 0.88);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function hexToDarkVariant(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Darken by 15%
  const dr = Math.round(r * 0.85);
  const dg = Math.round(g * 0.85);
  const db = Math.round(b * 0.85);
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}

export function applyAccentColor(color: string) {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-light", hexToLightVariant(color));
  document.documentElement.style.setProperty("--accent-hover", hexToDarkVariant(color));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved background image
    const bg = localStorage.getItem("braindump-bg");
    if (bg) {
      document.body.style.setProperty("background-image", `url(${bg})`, "important");
      document.body.style.setProperty("background-size", "cover", "important");
      document.body.style.setProperty("background-position", "center", "important");
      document.body.style.setProperty("background-attachment", "fixed", "important");
      document.body.style.setProperty("background-color", "transparent", "important");
    }

    // Apply saved accent color
    const accent = localStorage.getItem("braindump-accent");
    if (accent) {
      applyAccentColor(accent);
    }
  }, []);

  return <>{children}</>;
}
