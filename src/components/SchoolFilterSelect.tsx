"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { COURSE_SCHOOLS, type CourseSchoolFilter } from "@/lib/course-dataset";
import { cn } from "@/lib/utils";

type SchoolFilterSelectProps = {
  value: CourseSchoolFilter;
  onChange: (value: CourseSchoolFilter) => void;
  className?: string;
};

export function SchoolFilterSelect({ value, onChange, className }: SchoolFilterSelectProps) {
  return (
    <div className={cn("relative min-w-[220px]", className)}>
      <MaterialIcon
        icon="filter_list"
        className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-[18px] text-outline"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CourseSchoolFilter)}
        aria-label="Filter courses by school"
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-outline-variant bg-surface-container-low pl-10 pr-10 text-label-md font-label-md text-on-surface outline-none transition-colors hover:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {COURSE_SCHOOLS.map((school) => (
          <option key={school} value={school}>
            {school === "All" ? "All Category" : school}
          </option>
        ))}
      </select>
      <MaterialIcon
        icon="expand_more"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-outline"
      />
    </div>
  );
}
