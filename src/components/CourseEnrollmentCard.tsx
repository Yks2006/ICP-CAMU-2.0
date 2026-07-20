"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import { formatCourseFee, type CourseSubject } from "@/lib/course-dataset";
import { formatSessionWithVenue } from "@/lib/course-venues";
import { getCourseImageFallback } from "@/lib/course-images";
import { getPastelTone } from "@/lib/pastel-palette";
import { cn } from "@/lib/utils";

type CourseInfoDialogProps = {
  course: CourseSubject | null;
  onClose: () => void;
  onRequestEnroll?: () => void;
  isEnrolled?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-label-sm font-medium text-on-surface-variant">{label}</span>
      <span className="text-body-sm text-on-surface sm:max-w-[60%] sm:text-right">{value}</span>
    </div>
  );
}

export function CourseInfoDialog({ course, onClose, onRequestEnroll, isEnrolled }: CourseInfoDialogProps) {
  if (!course) {
    return null;
  }

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
        aria-labelledby="course-info-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-label-sm font-bold uppercase tracking-wide text-primary">{course.code}</p>
            <h3 id="course-info-title" className="mt-1 text-headline-sm font-headline-sm text-on-surface">
              {course.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Close course information"
          >
            <MaterialIcon icon="close" className="text-[20px]" />
          </button>
        </div>

        <p className="mb-5 text-body-sm text-on-surface-variant">{course.description}</p>

        <div className="space-y-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 p-4">
          <DetailRow label="School" value={course.school} />
          <DetailRow label="Programme" value={course.programme} />
          <DetailRow label="Type" value={course.coreElective} />
          <DetailRow label="Credits" value={`${course.credits}`} />
          <DetailRow label="Fee" value={formatCourseFee(course.fee)} />
          <DetailRow label="Lecturer" value={course.lecturer} />
          <DetailRow label="Lecture" value={formatSessionWithVenue(course.lecture, course.lectureVenue)} />
          <DetailRow label="Tutorial 1" value={formatSessionWithVenue(course.tutorial1, course.tutorial1Venue)} />
          <DetailRow label="Tutorial 2" value={formatSessionWithVenue(course.tutorial2, course.tutorial2Venue)} />
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="button" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isEnrolled}
            onClick={() => {
              onRequestEnroll?.();
            }}
          >
            {isEnrolled ? "Enrolled" : "Enroll Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

type EnrollmentCourseCardProps = {
  course: CourseSubject;
  imageUrl: string;
  imageIndex: number;
  onInfo: () => void;
  onRequestEnroll: () => void;
  isEnrolled?: boolean;
};

function CourseCoverFallback({
  course,
  imageIndex,
}: {
  course: CourseSubject;
  imageIndex: number;
}) {
  const tone = getPastelTone(imageIndex);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center border p-4 text-center",
        tone.card,
      )}
    >
      <MaterialIcon icon="menu_book" className={cn("mb-2 text-[40px]", tone.label)} />
      <p className={cn("text-label-sm font-bold uppercase tracking-wide", tone.label)}>{course.code}</p>
      <p className={cn("mt-1 line-clamp-2 text-label-md font-bold", tone.label)}>{course.name}</p>
    </div>
  );
}

export function EnrollmentCourseCard({
  course,
  imageUrl,
  imageIndex,
  onInfo,
  onRequestEnroll,
  isEnrolled = false,
}: EnrollmentCourseCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageSrc, setImageSrc] = useState(imageUrl);

  const handleImageError = () => {
    if (imageSrc !== getCourseImageFallback()) {
      setImageSrc(getCourseImageFallback());
      return;
    }

    setImageFailed(true);
  };

  return (
    <div className="course-card-shadow flex flex-col rounded-2xl border border-dashed border-outline-variant bg-surface-light p-2 transition-all hover:shadow-lg group">
      <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-surface-container-low">
        {imageFailed ? (
          <CourseCoverFallback course={course} imageIndex={imageIndex} />
        ) : (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={imageSrc}
            alt={course.name}
            loading="lazy"
            onError={handleImageError}
          />
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
          <span className="mb-2 w-fit rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {course.coreElective}
          </span>
          <p className="pointer-events-auto cursor-text select-text text-headline-sm font-headline-sm leading-tight text-white selection:bg-white/30 selection:text-white">
            {course.name}
          </p>
        </div>
        <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {course.code}
        </div>
      </div>

      <div className="px-3 pb-4">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isEnrolled}
            onClick={onRequestEnroll}
            className="flex-1 rounded-xl bg-primary py-3 text-label-md font-label-md text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnrolled ? "Enrolled" : "Enroll Now"}
          </button>
          <button
            type="button"
            onClick={onInfo}
            className="rounded-xl bg-surface-container-high p-3 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            aria-label={`View information for ${course.name}`}
          >
            <MaterialIcon icon="info" className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
