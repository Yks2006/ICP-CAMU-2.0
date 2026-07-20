"use client";

import { Info } from "lucide-react";
import { MaterialIcon } from "@/components/MaterialIcon";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PASSWORD_RULES } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

type PasswordRequirementsHintProps = {
  password?: string;
};

export function PasswordRequirementsHint({ password = "" }: PasswordRequirementsHintProps) {
  const passedCount = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const progress = (passedCount / PASSWORD_RULES.length) * 100;

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full bg-secondary-container text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="View password requirements"
      >
        <Info className="size-3.5" strokeWidth={2.5} />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-80 overflow-hidden border-outline-variant bg-surface-light p-0 shadow-xl ring-1 ring-primary/10"
      >
        <div className="bg-gradient-to-r from-[#00346d] to-[#124687] px-4 py-3 text-white">
          <PopoverHeader className="gap-1">
            <PopoverTitle className="flex items-center gap-2 text-sm font-semibold text-white">
              <MaterialIcon icon="shield" className="text-base" />
              Password Requirements
            </PopoverTitle>
            <PopoverDescription className="text-xs text-white/80">
              Your password must meet all five rules below.
            </PopoverDescription>
          </PopoverHeader>

          {password.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/90">
                <span>Strength check</span>
                <span>
                  {passedCount}/{PASSWORD_RULES.length}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <ul className="space-y-2 p-3">
          {PASSWORD_RULES.map((rule) => {
            const passed = password.length > 0 && rule.test(password);
            const pending = password.length === 0;

            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  pending && "border-outline-variant/60 bg-surface-container-low/40",
                  !pending && passed && "border-success/30 bg-success/5",
                  !pending && !passed && "border-outline-variant bg-surface-container-low/60",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    pending && "bg-primary/10 text-primary",
                    !pending && passed && "bg-success/15 text-success",
                    !pending && !passed && "bg-error/10 text-error",
                  )}
                >
                  {rule.badge}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-label-sm font-semibold text-on-surface">{rule.shortLabel}</p>
                  <p className="text-[11px] leading-snug text-on-surface-variant">{rule.label}</p>
                </div>

                <MaterialIcon
                  icon={pending ? rule.icon : passed ? "check_circle" : "cancel"}
                  className={cn(
                    "shrink-0 text-lg",
                    pending && "text-primary/70",
                    !pending && passed && "text-success",
                    !pending && !passed && "text-error",
                  )}
                  filled={!pending && passed}
                />
              </li>
            );
          })}
        </ul>

        <div className="border-t border-outline-variant bg-surface-container-low/50 px-4 py-2.5">
          <p className="text-[11px] leading-relaxed text-on-surface-variant">
            Allowed special characters:{" "}
            <span className="font-mono text-on-surface">! @ # $ % ^ & * ( ) - _ = +</span>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
