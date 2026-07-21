"use client";

import { useState, type ComponentProps } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <MaterialIcon
        icon="lock"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
      />
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 border-outline-variant bg-surface-container-low pl-10 pr-10 text-body-md focus-visible:border-primary focus-visible:ring-primary/20",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <MaterialIcon icon={visible ? "visibility_off" : "visibility"} className="text-[20px]" />
      </button>
    </div>
  );
}
