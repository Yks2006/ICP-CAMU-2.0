import { parseScheduleSlot, slotsClash, type ScheduleSlot } from "@/lib/course-schedule";

export const LECTURE_THEATRES = ["GF-LTR-07", "GF-LTR-08", "GF-LTR-09"] as const;

export const LAB_VENUES = ["3A-LAB-A", "3A-LAB-B", "3A-LAB-C", "3A-LAB-D"] as const;

function buildCrmVenues(floor: "01" | "02" | "03") {
  const rooms: string[] = [];
  for (let index = 1; index <= 13; index += 1) {
    rooms.push(`${floor}-CRM-${String(index).padStart(2, "0")}`);
  }
  rooms.push(`${floor}-CRM-13A`);
  return rooms;
}

export const CRM_VENUES = [
  ...buildCrmVenues("01"),
  ...buildCrmVenues("02"),
  ...buildCrmVenues("03"),
] as const;

export const ALL_VENUES = [...LECTURE_THEATRES, ...CRM_VENUES, ...LAB_VENUES] as const;

type SessionKind = "lecture" | "tutorial1" | "tutorial2";

type PendingSession = {
  courseId: string;
  kind: SessionKind;
  slot: ScheduleSlot;
  usesLab: boolean;
  isTutorial: boolean;
};

type VenueBooking = {
  venue: string;
  slot: ScheduleSlot;
};

export function courseUsesComputerLab(
  course: Pick<CourseSubjectBase, "id" | "school" | "name" | "description">,
) {
  if (course.school === "Computing") {
    return true;
  }

  const labCourseIds = new Set([
    "BUS102-business",
    "ENG102-engineering",
    "COM105-communication",
  ]);

  if (labCourseIds.has(course.id)) {
    return true;
  }

  return /programming|database|data science|computer|digital media|CAD|analytics|network|software/i.test(
    `${course.name} ${course.description}`,
  );
}

function slotSortKey(slot: ScheduleSlot) {
  return slot.dayIndex * 10_000 + slot.startHour * 60 + slot.startMinute;
}

function getVenuePools(session: PendingSession) {
  if (session.usesLab && session.isTutorial) {
    return [...LAB_VENUES, ...LECTURE_THEATRES, ...CRM_VENUES];
  }

  return [...LECTURE_THEATRES, ...CRM_VENUES];
}

function isVenueAvailable(venue: string, slot: ScheduleSlot, bookings: VenueBooking[]) {
  return !bookings.some(
    (booking) => booking.venue === venue && slotsClash(booking.slot, slot),
  );
}

function assignVenue(
  session: PendingSession,
  bookings: VenueBooking[],
): string | null {
  for (const venue of getVenuePools(session)) {
    if (isVenueAvailable(venue, session.slot, bookings)) {
      bookings.push({ venue, slot: session.slot });
      return venue;
    }
  }

  return null;
}

type CourseSubjectBase = {
  id: string;
  school: string;
  name: string;
  description: string;
  lecture: string;
  tutorial1: string;
  tutorial2: string;
  lectureVenue: string;
  tutorial1Venue: string;
  tutorial2Venue: string;
};

export function assignVenuesToCourses<
  T extends Pick<
    CourseSubjectBase,
    "id" | "school" | "name" | "description" | "lecture" | "tutorial1" | "tutorial2"
  >,
>(courses: T[]) {
  const usesLabByCourse = new Map(courses.map((course) => [course.id, courseUsesComputerLab(course)]));
  const sessions: PendingSession[] = [];

  courses.forEach((course) => {
    const usesLab = usesLabByCourse.get(course.id) ?? false;
    const sessionEntries: Array<{ kind: SessionKind; time: string; isTutorial: boolean }> = [
      { kind: "lecture", time: course.lecture, isTutorial: false },
      { kind: "tutorial1", time: course.tutorial1, isTutorial: true },
      { kind: "tutorial2", time: course.tutorial2, isTutorial: true },
    ];

    sessionEntries.forEach(({ kind, time, isTutorial }) => {
      const slot = parseScheduleSlot(time);
      if (!slot) {
        return;
      }

      sessions.push({
        courseId: course.id,
        kind,
        slot,
        usesLab,
        isTutorial,
      });
    });
  });

  sessions.sort((first, second) => {
    const byTime = slotSortKey(first.slot) - slotSortKey(second.slot);
    if (byTime !== 0) {
      return byTime;
    }

    const byCourse = first.courseId.localeCompare(second.courseId);
    if (byCourse !== 0) {
      return byCourse;
    }

    return first.kind.localeCompare(second.kind);
  });

  const bookings: VenueBooking[] = [];
  const assignments = new Map<string, string>();

  sessions.forEach((session) => {
    const venue = assignVenue(session, bookings);
    if (!venue) {
      throw new Error(`Unable to assign venue for ${session.courseId} ${session.kind}`);
    }

    assignments.set(`${session.courseId}:${session.kind}`, venue);
  });

  return courses.map((course) => ({
    ...course,
    lectureVenue: assignments.get(`${course.id}:lecture`) ?? "",
    tutorial1Venue: assignments.get(`${course.id}:tutorial1`) ?? "",
    tutorial2Venue: assignments.get(`${course.id}:tutorial2`) ?? "",
  }));
}

export function verifyVenueAssignments(courses: CourseSubjectBase[]) {
  const bookings: VenueBooking[] = [];

  courses.forEach((course) => {
    const entries: Array<{ time: string; venue: string }> = [
      { time: course.lecture, venue: course.lectureVenue },
      { time: course.tutorial1, venue: course.tutorial1Venue },
      { time: course.tutorial2, venue: course.tutorial2Venue },
    ];

    entries.forEach(({ time, venue }) => {
      const slot = parseScheduleSlot(time);
      if (!slot || !venue) {
        return;
      }

      const clash = bookings.find(
        (booking) => booking.venue === venue && slotsClash(booking.slot, slot),
      );

      if (clash) {
        throw new Error(`Venue clash at ${venue} for ${time}`);
      }

      if (venue.startsWith("3A-LAB-") && !courseUsesComputerLab(course)) {
        throw new Error(`Lab venue assigned to non-computer course ${course.id}`);
      }

      bookings.push({ venue, slot });
    });
  });
}

export function formatSessionWithVenue(time: string, venue: string) {
  return venue ? `${time} · ${venue}` : time;
}
