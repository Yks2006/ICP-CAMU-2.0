"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentNotificationsProvider } from "@/contexts/StudentNotificationsContext";
import { navItems } from "@/lib/navigation";
import { fetchAuthProfile } from "@/lib/client-auth";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  showFab?: boolean;
};

export function AppShell({ children, showFab = false }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState({ fullName: "", studentId: "", role: "" as "" | "admin" | "student" });

  useEffect(() => {
    let cancelled = false;

    fetchAuthProfile().then((profileData) => {
      if (cancelled || !profileData) {
        return;
      }

      setProfile({
        fullName: profileData.fullName,
        studentId: profileData.studentId,
        role: profileData.role,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const visibleNavItems = navItems.filter((item) =>
    profile.role === "admin" ? item.adminOnly : !item.adminOnly,
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <StudentNotificationsProvider>
      <div className="bg-bg-app text-on-surface min-h-screen">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[228px] flex-col border-r border-pastel-blue-border bg-gradient-to-b from-pastel-blue/50 via-pastel-purple/20 to-surface px-3 py-5">
        <div className="mb-8 px-3">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">CAMU 2.0</h1>
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            Student Portal
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all",
                  active
                    ? "scale-98 border-l-4 border-primary bg-pastel-blue text-pastel-blue-text active:opacity-80"
                    : "text-on-surface-variant hover:bg-pastel-mint/50",
                )}
              >
                <MaterialIcon icon={item.icon} className="text-[20px]" />
                <span className="text-label-md font-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-9 w-full gap-2 border-outline-variant py-2 text-label-md font-label-md text-on-surface-variant hover:bg-surface-container"
          >
            <MaterialIcon icon="logout" className="text-[18px]" />
            Sign Out
          </Button>
        </div>
      </aside>

      <header className="glass-header fixed top-0 right-0 z-40 ml-[228px] flex h-14 w-[calc(100%-228px)] items-center justify-end border-b border-pastel-blue-border bg-pastel-blue/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-label-md font-label-md leading-none text-on-surface">
                {profile.fullName || "Student"}
              </p>
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                ID: {profile.studentId || "—"}
              </p>
            </div>
            <Avatar className="h-8 w-8 border-2 border-pastel-purple-border bg-pastel-purple">
              <AvatarFallback className="bg-pastel-purple text-pastel-purple-text">
                <MaterialIcon icon="person" className="text-lg" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="ml-[228px] min-h-screen px-6 pb-8 pt-[4.5rem]">{children}</main>

      {showFab && (
        <Button
          size="icon"
          className="group fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-on-primary shadow-lg hover:scale-110 active:scale-95"
        >
          <MaterialIcon icon="add" />
          <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg border border-outline-variant bg-surface px-2.5 py-1 text-label-sm font-label-sm text-on-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            Quick Action
          </span>
        </Button>
      )}
      </div>
    </StudentNotificationsProvider>
  );
}
