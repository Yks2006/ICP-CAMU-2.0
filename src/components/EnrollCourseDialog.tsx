"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import type { CourseSubject } from "@/lib/course-dataset";
import { formatSessionWithVenue } from "@/lib/course-venues";
import {
  parseScheduleSlot,
  slotClashesWithAny,
  type ScheduleSlot,
} from "@/lib/course-schedule";
import type { TutorialChoice } from "@/hooks/useStudentEnrollments";
import { cn } from "@/lib/utils";

type EnrollCourseDialogProps = {
  course: CourseSubject | null;
  occupiedSlots: ScheduleSlot[];
  onClose: () => void;
  onConfirm: (course: CourseSubject, tutorial: TutorialChoice) => void;
};

type SessionOption = {
  label: string;
  time: string;
  venue: string;
  lecturer: string;
  slot: ScheduleSlot | null;
  clashes: boolean;
  tutorial?: TutorialChoice;
};

function SessionRow({
  option,
  selected,
  onSelect,
}: {
  option: SessionOption;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const isSelectable = Boolean(onSelect) && !option.clashes;

  return (
    <button
      type="button"
      disabled={!isSelectable}
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        option.clashes
          ? "cursor-not-allowed border-outline-variant/50 bg-surface-container-high/70 opacity-60"
          : selected
            ? "border-primary bg-primary/5"
            : isSelectable
              ? "border-outline-variant bg-surface-container-low hover:border-primary/40"
              : "border-outline-variant bg-surface-container-low",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-label-sm font-bold uppercase tracking-wide",
              option.clashes ? "text-outline" : "text-primary",
            )}
          >
            {option.label}
          </p>
          <p className={cn("mt-1 text-label-md font-label-md", option.clashes ? "text-outline" : "text-on-surface")}>
            {formatSessionWithVenue(option.time, option.venue)}
          </p>
          <p className={cn("mt-1 text-body-sm", option.clashes ? "text-outline" : "text-on-surface-variant")}>
            {option.lecturer}
          </p>
        </div>
        {option.clashes ? (
          <span className="rounded-full bg-surface-container-highest px-2 py-1 text-[10px] font-bold uppercase text-outline">
            Time Clash
          </span>
        ) : selected ? (
          <MaterialIcon icon="check_circle" className="text-[20px] text-primary" />
        ) : null}
      </div>
    </button>
  );
}

export function EnrollCourseDialog({
  course,
  occupiedSlots,
  onClose,
  onConfirm,
}: EnrollCourseDialogProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialChoice | null>(null);

  useEffect(() => {
    setSelectedTutorial(null);
  }, [course?.id]);

  const options = useMemo<{
    lecture: SessionOption;
    tutorials: SessionOption[];
    canEnroll: boolean;
  } | null>(() => {
    if (!course) {
      return null;
    }

    const lectureSlot = parseScheduleSlot(course.lecture);
    const tutorialOneSlot = parseScheduleSlot(course.tutorial1);
    const tutorialTwoSlot = parseScheduleSlot(course.tutorial2);

    const lecture: SessionOption = {
      label: "Lecture",
      time: course.lecture,
      venue: course.lectureVenue,
      lecturer: course.lecturer,
      slot: lectureSlot,
      clashes: slotClashesWithAny(lectureSlot, occupiedSlots),
    };

    const tutorials: SessionOption[] = [
      {
        label: "Tutorial 1",
        time: course.tutorial1,
        venue: course.tutorial1Venue,
        lecturer: course.lecturer,
        slot: tutorialOneSlot,
        clashes: slotClashesWithAny(tutorialOneSlot, occupiedSlots),
        tutorial: 1,
      },
      {
        label: "Tutorial 2",
        time: course.tutorial2,
        venue: course.tutorial2Venue,
        lecturer: course.lecturer,
        slot: tutorialTwoSlot,
        clashes: slotClashesWithAny(tutorialTwoSlot, occupiedSlots),
        tutorial: 2,
      },
    ];

    const hasAvailableTutorial = tutorials.some((tutorial) => !tutorial.clashes);

    return {
      lecture,
      tutorials,
      canEnroll: !lecture.clashes && hasAvailableTutorial,
    };
  }, [course, occupiedSlots]);

  if (!course || !options) {
    return null;
  }

  const selectedOption = options.tutorials.find((tutorial) => tutorial.tutorial === selectedTutorial);
  const canConfirm = options.canEnroll && selectedOption && !selectedOption.clashes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="portal-section max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant bg-surface-light p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enroll-course-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-label-sm font-bold uppercase tracking-wide text-primary">{course.code}</p>
            <h3 id="enroll-course-title" className="mt-1 text-headline-sm font-headline-sm text-on-surface">
              Choose Tutorial Time
            </h3>
            <p className="mt-1 text-body-sm text-on-surface-variant">{course.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Close enrollment dialog"
          >
            <MaterialIcon icon="close" className="text-[20px]" />
          </button>
        </div>

        <div className="space-y-3">
          <SessionRow option={options.lecture} />

          <p className="pt-1 text-label-sm font-label-md text-on-surface-variant">
            Select one tutorial slot. Grey options clash with your current timetable.
          </p>

          {options.tutorials.map((tutorial) => (
            <SessionRow
              key={tutorial.label}
              option={tutorial}
              selected={selectedTutorial === tutorial.tutorial}
              onSelect={() => {
                if (tutorial.tutorial && !tutorial.clashes) {
                  setSelectedTutorial(tutorial.tutorial);
                }
              }}
            />
          ))}
        </div>

        {!options.canEnroll && (
          <p className="mt-4 rounded-xl border border-error/20 bg-error-container/40 p-3 text-body-sm text-on-error-container">
            This subject cannot be enrolled because the lecture or both tutorial slots clash with your
            current schedule.
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!canConfirm}
            onClick={() => {
              if (selectedTutorial) {
                onConfirm(course, selectedTutorial);
                setSelectedTutorial(null);
                onClose();
              }
            }}
          >
            Confirm Enrollment
          </Button>
        </div>
      </div>
    </div>
  );
}
