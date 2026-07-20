"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CourseSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function CourseSearchInput({ value, onChange, className }: CourseSearchInputProps) {
  return (
    <div className={cn("relative min-w-[240px] flex-1 md:max-w-sm", className)}>
      <MaterialIcon
        icon="search"
        className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-[18px] text-outline"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by course name"
        aria-label="Search by course name"
        className="h-10 rounded-xl border-outline-variant bg-surface-container-low pl-10 text-label-md shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      />
    </div>
  );
}
