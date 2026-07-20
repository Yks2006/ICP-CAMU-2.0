"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CourseSubject } from "@/lib/course-dataset";
import { formatSessionWithVenue } from "@/lib/course-venues";
import { getCourseImageFallback } from "@/lib/course-images";
import type { TutorialChoice } from "@/hooks/useStudentEnrollments";
import { cn } from "@/lib/utils";

type EnrolledCourseCardProps = {
  course: CourseSubject;
  imageUrl: string;
  selectedTutorial: TutorialChoice;
  onInfo: () => void;
  onWithdraw: () => void;
};

export function EnrolledCourseCard({
  course,
  imageUrl,
  selectedTutorial,
  onInfo,
  onWithdraw,
}: EnrolledCourseCardProps) {
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [isOpen, setIsOpen] = useState(false);
  const tutorialTime = selectedTutorial === 1 ? course.tutorial1 : course.tutorial2;
  const tutorialVenue = selectedTutorial === 1 ? course.tutorial1Venue : course.tutorial2Venue;

  return (
    <div className="portal-section course-card-shadow group flex flex-col overflow-hidden rounded-xl border border-pastel-blue-border bg-pastel-blue/25 transition-all hover:border-primary">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="text-left"
        aria-expanded={isOpen}
      >
        <div className="relative h-40 overflow-hidden">
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={imageSrc}
            alt={course.name}
            loading="lazy"
            onError={() => setImageSrc(getCourseImageFallback())}
          />
          <div className="absolute top-3 left-3 rounded bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-on-primary uppercase">
            {course.code}
          </div>
          <div className="absolute top-3 right-3 rounded-full bg-black/45 p-1.5 text-white">
            <MaterialIcon
              icon={isOpen ? "expand_less" : "expand_more"}
              className="text-[18px]"
            />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col p-5 pr-14">
          <h4 className="mb-1 text-label-md font-label-md text-on-surface">{course.name}</h4>
          <p className="text-body-sm font-body-sm text-outline">{course.lecturer}</p>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            Lecture: {formatSessionWithVenue(course.lecture, course.lectureVenue)}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Tutorial {selectedTutorial}: {formatSessionWithVenue(tutorialTime, tutorialVenue)}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onInfo();
            }}
            className="absolute right-5 bottom-5 rounded-xl bg-surface-container-high p-3 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            aria-label={`View information for ${course.name}`}
          >
            <MaterialIcon icon="info" className="text-[20px]" />
          </button>
        </div>
      </button>

      <div
        className={cn(
          "overflow-hidden px-5 transition-all duration-200",
          isOpen ? "max-h-20 pb-5 opacity-100" : "max-h-0 pb-0 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onWithdraw}
          className="w-full rounded-lg border border-error/30 bg-error-container/30 py-2 text-label-md font-label-md text-error transition-colors hover:bg-error-container/60"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
