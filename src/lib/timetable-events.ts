import type { CourseSubject } from "@/lib/course-dataset";
import {
  getEnrollmentScheduleSlots,
  parseScheduleSlot,
  type ScheduleSlot,
} from "@/lib/course-schedule";
import { getPastelTone } from "@/lib/pastel-palette";
import { addDays, getWeekMonday, toDateKey } from "@/lib/timetable-week";
import type { StudentEnrollment } from "@/lib/student-enrollments";

export type TimetableEvent = {
  id: string;
  weekMonday: string;
  dayIndex: number;
  startHour: number;
  startMinute?: number;
  endHour: number;
  endMinute?: number;
  courseCode: string;
  title: string;
  instructor?: string;
  venue?: string;
  tag: string;
  cardClass: string;
  tagClass?: string;
};

export const COURSE_DURATION_WEEKS = 13;

function selectedTutorialVenue(
  course: CourseSubject,
  enrollment: StudentEnrollment,
) {
  return enrollment.selectedTutorial === 1 ? course.tutorial1Venue : course.tutorial2Venue;
}

export function getOccupiedScheduleSlots(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];

  enrollments.forEach((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    if (!course) {
      return;
    }

    const tutorial =
      enrollment.selectedTutorial === 1 ? course.tutorial1 : course.tutorial2;

    slots.push(...getEnrollmentScheduleSlots(course.lecture, tutorial));
  });

  return slots;
}

export function buildEnrollmentTimetableEvents(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStartMonday: Date,
): TimetableEvent[] {
  const events: TimetableEvent[] = [];
  const semesterMonday = getWeekMonday(semesterStartMonday);

  enrollments.forEach((enrollment, enrollmentIndex) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    if (!course) {
      return;
    }

    const tone = getPastelTone(enrollmentIndex);
    const cardClass = `${tone.card} ${tone.label}`;
    const tutorial =
      enrollment.selectedTutorial === 1 ? course.tutorial1 : course.tutorial2;

    const sessions = [
      { slot: parseScheduleSlot(course.lecture), tag: "Lecture", venue: course.lectureVenue },
      { slot: parseScheduleSlot(tutorial), tag: "Tutorial", venue: selectedTutorialVenue(course, enrollment) },
    ];

    for (let week = 0; week < COURSE_DURATION_WEEKS; week += 1) {
      const weekMonday = addDays(semesterMonday, week * 7);
      const weekKey = toDateKey(weekMonday);

      sessions.forEach(({ slot, tag, venue }) => {
        if (!slot) {
          return;
        }

        events.push({
          id: `${enrollment.courseId}-${weekKey}-${tag.toLowerCase()}`,
          weekMonday: weekKey,
          dayIndex: slot.dayIndex,
          startHour: slot.startHour,
          startMinute: slot.startMinute,
          endHour: slot.endHour,
          endMinute: slot.endMinute,
          courseCode: course.code,
          title: course.name,
          instructor: course.lecturer,
          venue,
          tag,
          cardClass,
        });
      });
    }
  });

  return events;
}

export function getSemesterEndMonday(semesterStartMonday: Date) {
  return addDays(getWeekMonday(semesterStartMonday), (COURSE_DURATION_WEEKS - 1) * 7);
}

export function buildTemplateTimetableEvents(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStartMonday: Date,
): TimetableEvent[] {
  const firstWeekKey = toDateKey(getWeekMonday(semesterStartMonday));
  const seen = new Set<string>();

  return buildEnrollmentTimetableEvents(enrollments, courses, semesterStartMonday)
    .filter((event) => event.weekMonday === firstWeekKey)
    .filter((event) => {
      const key = `${event.dayIndex}-${event.courseCode}-${event.tag}-${event.startHour}-${event.startMinute ?? 0}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}
