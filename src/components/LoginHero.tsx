"use client";

import Galaxy from "@/components/Galaxy/Galaxy";
import { MaterialIcon } from "@/components/MaterialIcon";

const orbitIcons = [
  "dashboard",
  "calendar_today",
  "assignment",
  "notifications",
  "fact_check",
  "settings",
] as const;

const ORBIT_RADIUS = 108;

export function LoginHero() {
  const angleStep = 360 / orbitIcons.length;

  return (
    <section className="relative hidden min-h-screen w-full shrink-0 overflow-hidden bg-black lg:flex lg:w-2/5 lg:items-center lg:justify-center">
      <div className="absolute inset-0">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1.8}
          glowIntensity={0.65}
          saturation={0}
          hueShift={0}
          twinkleIntensity={0.5}
          transparent
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-12 text-center text-white">
        <div className="relative mb-16 flex size-[280px] shrink-0 items-center justify-center">
          <div className="pointer-events-none absolute inset-0 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute inset-8 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute inset-16 rounded-full border border-dashed border-white/20" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-white/5 blur-2xl" />

          <div className="login-orbit-ring absolute inset-0">
            {orbitIcons.map((icon, index) => {
              const angle = -90 + index * angleStep;

              return (
                <div
                  key={icon}
                  className="absolute left-1/2 top-1/2 h-0 w-0"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${ORBIT_RADIUS}px)`,
                  }}
                >
                  <div className="login-orbit-icon-slot">
                    <div className="login-orbit-icon-spin">
                      <div className="flex size-10 items-center justify-center rounded-2xl border border-white/20 bg-black/60 shadow-[0_0_20px_rgba(255,255,255,0.12)] backdrop-blur-md">
                        <MaterialIcon icon={icon} className="text-base text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex size-24 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-white/15 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.15)] backdrop-blur-md">
            <MaterialIcon icon="school" className="text-4xl text-white" />
          </div>
        </div>

        <p className="text-label-sm font-label-sm uppercase tracking-[0.35em] text-white/70">
          Student Portal
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] xl:text-6xl">
          CAMU 2.0
        </h1>
        <p className="mt-4 max-w-sm text-body-md leading-relaxed text-white/80">
          Your gateway to courses, schedules, assignments, and campus life — all in one place.
        </p>
      </div>
    </section>
  );
}
