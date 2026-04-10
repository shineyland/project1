"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved background image
    const bg = localStorage.getItem("braindump-bg");
    if (bg) {
      document.body.style.backgroundImage = `url(${bg})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }

    // Apply saved accent color
    const accent = localStorage.getItem("braindump-accent");
    if (accent) {
      document.documentElement.style.setProperty("--accent-color", accent);
    }
  }, []);

  return <>{children}</>;
}
