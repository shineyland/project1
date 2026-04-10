"use client";

import { useEffect } from "react";

export function NotifChecker() {
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (!localStorage.getItem("braindump-notif")) return;

    // Check every 30 minutes if user has pending tasks
    const check = async () => {
      try {
        const res = await fetch("/api/streak");
        const data = await res.json();
        if (!data.todayDone) {
          const lastNotif = localStorage.getItem("braindump-last-notif");
          const now = Date.now();
          // Don't spam — max once every 2 hours
          if (lastNotif && now - parseInt(lastNotif) < 2 * 60 * 60 * 1000) return;
          localStorage.setItem("braindump-last-notif", String(now));
          new Notification("BrainDump Reminder", {
            body: `You have tasks to complete! Keep your ${data.streak}-day streak going.`,
            icon: "/favicon.ico",
          });
        }
      } catch {}
    };

    // Check after 5 seconds, then every 30 minutes
    const timeout = setTimeout(check, 5000);
    const interval = setInterval(check, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return null;
}
