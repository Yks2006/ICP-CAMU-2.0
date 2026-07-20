export type NavItem = {
  href: string;
  label: string;
  icon: string;
  key: string;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard", key: "dashboard" },
  { href: "/my-courses", label: "Courses", icon: "school", key: "my-courses" },
  {
    href: "/assignment-dashboard",
    label: "Assignment",
    icon: "assignment",
    key: "assignment-dashboard",
  },
  { href: "/timetable", label: "Timetable", icon: "calendar_today", key: "timetable" },
  {
    href: "/attendance-dashboard",
    label: "Attendance",
    icon: "fact_check",
    key: "attendance-dashboard",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "notifications",
    key: "notifications",
  },
  {
    href: "/admin/register-student",
    label: "Register Student",
    icon: "person_add",
    key: "admin-register-student",
    adminOnly: true,
  },
];
