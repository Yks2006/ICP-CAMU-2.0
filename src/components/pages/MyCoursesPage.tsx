"use client";

import { useMemo, useState } from "react";
import { CourseInfoDialog, EnrollmentCourseCard } from "@/components/CourseEnrollmentCard";
import { EnrollCourseDialog } from "@/components/EnrollCourseDialog";
import { EnrolledCourseCard } from "@/components/EnrolledCourseCard";
import { CourseSearchInput } from "@/components/CourseSearchInput";
import { SchoolFilterSelect } from "@/components/SchoolFilterSelect";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import {
  COURSE_SUBJECTS,
  filterCoursesByName,
  filterCoursesBySchool,
  type CourseSchoolFilter,
  type CourseSubject,
} from "@/lib/course-dataset";
import { getCourseImage } from "@/lib/course-images";
import { getOccupiedScheduleSlots } from "@/lib/timetable-events";

export function MyCoursesPage() {
  const [activeSchool, setActiveSchool] = useState<CourseSchoolFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseSubject | null>(null);
  const [courseToEnroll, setCourseToEnroll] = useState<CourseSubject | null>(null);
  const { enrollments, enrolledIds, enrolledCourses, enroll, withdraw, isReady, isEnrolled } =
    useStudentEnrollments();

  const occupiedSlots = useMemo(
    () => getOccupiedScheduleSlots(enrollments, COURSE_SUBJECTS),
    [enrollments],
  );

  const availableCourses = useMemo(
    () => COURSE_SUBJECTS.filter((course) => !enrolledIds.includes(course.id)),
    [enrolledIds],
  );

  const filteredCourses = useMemo(() => {
    const bySchool = filterCoursesBySchool(availableCourses, activeSchool);
    return filterCoursesByName(bySchool, searchQuery);
  }, [availableCourses, activeSchool, searchQuery]);

  const openEnrollmentDialog = (course: CourseSubject) => {
    setSelectedCourse(null);
    setCourseToEnroll(course);
  };

  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-8">
        <h2 className="text-headline-lg font-headline-lg text-primary">My Academic Path</h2>

        {isReady && enrolledCourses.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-4">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Enrolled Courses</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-label-sm font-label-sm text-primary">
                {enrolledCourses.length} Active
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {enrolledCourses.map(({ course, enrollment }) => (
                <EnrolledCourseCard
                  key={course.id}
                  course={course}
                  imageUrl={getCourseImage(course)}
                  selectedTutorial={enrollment.selectedTutorial}
                  onInfo={() => setSelectedCourse(course)}
                  onWithdraw={() => withdraw(course.id)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Available for Enrollment</h3>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-label-sm font-label-sm text-secondary">
                {filteredCourses.length} Subjects
              </span>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <CourseSearchInput value={searchQuery} onChange={setSearchQuery} />
              <SchoolFilterSelect value={activeSchool} onChange={setActiveSchool} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <EnrollmentCourseCard
                key={course.id}
                course={course}
                imageUrl={getCourseImage(course)}
                imageIndex={index}
                onInfo={() => setSelectedCourse(course)}
                onRequestEnroll={() => openEnrollmentDialog(course)}
                isEnrolled={isEnrolled(course.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <CourseInfoDialog
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onRequestEnroll={() => {
          if (selectedCourse) {
            openEnrollmentDialog(selectedCourse);
          }
        }}
        isEnrolled={selectedCourse ? isEnrolled(selectedCourse.id) : false}
      />

      <EnrollCourseDialog
        course={courseToEnroll}
        occupiedSlots={occupiedSlots}
        onClose={() => setCourseToEnroll(null)}
        onConfirm={(course, tutorial) => enroll(course.id, tutorial)}
      />
    </>
  );
}
