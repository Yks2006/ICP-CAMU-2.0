import type { CourseSubject } from "@/lib/course-dataset";

const DEFAULT_COVER = "/course-covers/default.jpg";

export function getCourseImage(course: CourseSubject) {
  return `/course-covers/${course.id}.jpg`;
}

export function getCourseImageFallback() {
  return DEFAULT_COVER;
}
