"use client";

import { useMemo, useState } from "react";
import { AssignmentDeadlineCalendar } from "@/components/AssignmentDeadlineCalendar";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  formatAssignmentDueDate,
  formatDueCountdown,
  type DueDateFilter,
  type StatusFilter,
  type StudentAssignment,
} from "@/lib/course-assignments";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { cn } from "@/lib/utils";

const DUE_DATE_FILTERS: Array<{ value: DueDateFilter; label: string }> = [
  { value: "all", label: "All Due Dates" },
  { value: "this-week", label: "This Week" },
  { value: "next-week", label: "Next Week" },
  { value: "this-month", label: "This Month" },
  { value: "overdue", label: "Overdue" },
];

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "overdue", label: "Overdue" },
];

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex min-w-[160px] flex-col">
      <span className="mb-1 ml-1 text-[10px] font-bold uppercase text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-label-md text-on-surface focus:ring-1 focus:ring-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentAssignment["status"] }) {
  const styles = {
    pending: "bg-warning/20 text-warning",
    submitted: "bg-success/10 text-success",
    overdue: "bg-error-container text-on-error-container",
  } as const;

  const labels = {
    pending: "Pending",
    submitted: "Submitted",
    overdue: "Overdue",
  } as const;

  return (
    <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", styles[status])}>
      {labels[status]}
    </span>
  );
}

function AssignmentCard({
  assignment,
  onSubmit,
}: {
  assignment: StudentAssignment;
  onSubmit: (assignmentId: string) => void;
}) {
  const borderClass =
    assignment.status === "overdue"
      ? "border-l-urgent"
      : assignment.status === "pending"
        ? "border-l-warning"
        : "border-l-success";

  return (
    <div className={cn("bento-card flex h-full flex-col rounded-2xl border-l-[6px] p-6", borderClass)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded bg-surface-container px-2 py-1 text-label-sm font-label-sm text-on-surface-variant">
          {assignment.courseCode}
        </span>
        <StatusBadge status={assignment.status} />
      </div>

      <h3 className="mb-2 text-headline-sm font-headline-sm text-on-surface">{assignment.title}</h3>
      <p className="flex-1 text-body-sm text-on-surface-variant">{assignment.description}</p>

      <div className="mt-6 space-y-3 border-t border-outline-variant pt-4">
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn(
              "flex items-center gap-2 text-label-md font-bold",
              assignment.status === "overdue"
                ? "text-urgent"
                : assignment.status === "pending"
                  ? "text-warning"
                  : "text-success",
            )}
          >
            <MaterialIcon icon="schedule" className="text-[18px]" />
            {assignment.status === "submitted"
              ? "Submitted"
              : formatDueCountdown(assignment.dueDate)}
          </div>
          <span className="text-label-sm text-on-surface-variant">
            Due {formatAssignmentDueDate(assignment.dueDate)}
          </span>
        </div>

        {assignment.status === "submitted" ? (
          <Button type="button" variant="outline" className="w-full" disabled>
            Submitted
          </Button>
        ) : (
          <Button type="button" className="w-full" onClick={() => onSubmit(assignment.id)}>
            {assignment.status === "overdue" ? "Submit Now" : "Mark as Submitted"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AssignmentDashboardPage() {
  const { assignments, enrolledCourses, isReady, submitAssignment, filterAssignments } =
    useStudentAssignments();
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const courseOptions = useMemo(
    () => [
      { value: "all", label: "All Courses" },
      ...enrolledCourses.map(({ course }) => ({
        value: course.id,
        label: `${course.code} · ${course.name}`,
      })),
    ],
    [enrolledCourses],
  );

  const filteredAssignments = useMemo(
    () => filterAssignments(courseFilter, statusFilter, dueDateFilter, selectedDateKey),
    [filterAssignments, courseFilter, statusFilter, dueDateFilter, selectedDateKey],
  );

  const deadlineDates = useMemo(
    () => Array.from(new Set(assignments.map((assignment) => assignment.dueDateKey))),
    [assignments],
  );

  const handleDueDateFilterChange = (value: DueDateFilter) => {
    setDueDateFilter(value);
    setSelectedDateKey(null);
  };

  const handleCalendarSelect = (dateKey: string | null) => {
    setSelectedDateKey(dateKey);
    if (dateKey) {
      setDueDateFilter("all");
    }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <h2 className="text-headline-lg font-headline-lg text-on-surface">Assignment</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Track deadlines for subjects you are enrolled in this semester.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="portal-section mb-8 rounded-xl border border-pastel-purple-border bg-pastel-purple/30 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <FilterSelect
                label="Course"
                value={courseFilter}
                options={courseOptions}
                onChange={setCourseFilter}
              />
              <FilterSelect
                label="Submission Status"
                value={statusFilter}
                options={STATUS_FILTERS}
                onChange={setStatusFilter}
              />
              <FilterSelect
                label="Due Date"
                value={dueDateFilter}
                options={DUE_DATE_FILTERS}
                onChange={handleDueDateFilterChange}
              />
            </div>
          </div>

          {!isReady ? (
            <p className="text-body-md text-on-surface-variant">Loading assignments...</p>
          ) : enrolledCourses.length === 0 ? (
            <div className="portal-section rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
              <MaterialIcon icon="school" className="mb-3 text-[40px] text-outline" />
              <h3 className="text-headline-sm font-headline-sm text-on-surface">No enrolled subjects yet</h3>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Enroll in courses from My Courses to see your assignment deadlines here.
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="portal-section rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
              <MaterialIcon icon="filter_alt_off" className="mb-3 text-[40px] text-outline" />
              <h3 className="text-headline-sm font-headline-sm text-on-surface">No assignments match your filters</h3>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Try adjusting the course, status, or due date filters.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-label-sm text-on-surface-variant">
                Showing {filteredAssignments.length} of {assignments.length} assignments
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onSubmit={submitAssignment}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="xl:sticky xl:top-[4.5rem] xl:self-start">
          <AssignmentDeadlineCalendar
            deadlineDates={deadlineDates}
            selectedDateKey={selectedDateKey}
            onSelectDate={handleCalendarSelect}
          />
        </aside>
      </div>
    </div>
  );
}
