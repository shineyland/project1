"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Profile {
  name: string;
  avatarColor: string;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Skip check on login page
    if (pathname === "/login") {
      setChecked(true);
      setHasProfile(false);
      return;
    }

    // Check localStorage first for instant redirect
    const remembered = localStorage.getItem("braindump-profile");
    if (remembered) {
      setHasProfile(true);
      setChecked(true);
      return;
    }

    // Check server
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile | null) => {
        if (data && data.name) {
          setHasProfile(true);
          localStorage.setItem("braindump-profile", JSON.stringify(data));
        } else {
          router.replace("/login");
        }
        setChecked(true);
      })
      .catch(() => {
        router.replace("/login");
        setChecked(true);
      });
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  // Allow login page without profile
  if (pathname === "/login") return <>{children}</>;

  // Block other pages if no profile
  if (!hasProfile) return null;

  return <>{children}</>;
}
