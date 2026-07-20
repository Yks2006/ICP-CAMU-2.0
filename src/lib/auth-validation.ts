export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 12;

export const INSTITUTION_NAME = "University of Wollongong Malaysia";

export const STUDENT_STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Suspended",
  "Graduated",
] as const;

export const DEGREE_LEVEL_OPTIONS = [
  "Foundation",
  "Diploma",
  "Bachelor",
  "Master",
  "PhD",
] as const;

export const PASSWORD_RULES = [
  {
    id: "uppercase",
    label: "At least 1 uppercase letter (A–Z)",
    shortLabel: "Uppercase letter",
    badge: "A-Z",
    icon: "text_increase",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "At least 1 lowercase letter (a–z)",
    shortLabel: "Lowercase letter",
    badge: "a-z",
    icon: "text_decrease",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "At least 1 number (0–9)",
    shortLabel: "Number",
    badge: "0-9",
    icon: "pin",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "At least 1 special character",
    shortLabel: "Special character",
    badge: "!@#",
    icon: "tag",
    test: (value: string) => /[!@#$%^&*()\-_=+[\]{}|;:'",<.>/?\\]/.test(value),
  },
  {
    id: "length",
    label: "8 to 12 characters long",
    shortLabel: "Password length",
    badge: "8-12",
    icon: "straighten",
    test: (value: string) =>
      value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  },
] as const;

export type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  studentId?: string;
  studentStatus?: string;
  degreeLevel?: string;
  department?: string;
  programName?: string;
  institution?: string;
};

export function validateStudentEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return "Student email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return "Enter a valid email address.";
  }

  if (!trimmed.toLowerCase().endsWith("student.uow.edu.my")) {
    return "Student email must end with student.uow.edu.my.";
  }

  return undefined;
}

export function validateStudentId(studentId: string): string | undefined {
  const trimmed = studentId.trim();

  if (!trimmed) {
    return "Student ID is required.";
  }

  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    return "Student ID may only contain letters and numbers.";
  }

  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(password));
  if (failedRules.length > 0) {
    return "Password does not meet all requirements. Click the info icon for details.";
  }

  return undefined;
}

export function validateLoginForm(email: string, password: string): FieldErrors {
  return {
    email: validateStudentEmail(email),
    password: validatePassword(password),
  };
}

export function validateActivateAccountForm(
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const passwordError = validatePassword(password);
  let confirmPasswordError: string | undefined;

  if (!confirmPassword) {
    confirmPasswordError = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    confirmPasswordError = "Passwords do not match.";
  }

  return {
    email: validateStudentEmail(email),
    password: passwordError,
    confirmPassword: confirmPasswordError,
  };
}

export function validateAdminStudentForm(input: {
  fullName: string;
  studentId: string;
  email: string;
  studentStatus: string;
  degreeLevel: string;
  department: string;
  programName: string;
  institution: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.fullName.trim()) {
    errors.fullName = "Student name is required.";
  }

  errors.studentId = validateStudentId(input.studentId);
  errors.email = validateStudentEmail(input.email);

  if (
    !errors.studentId &&
    !errors.email &&
    input.email.trim().split("@")[0]?.toLowerCase() !== input.studentId.trim().toLowerCase()
  ) {
    errors.email = "Student email prefix must match the student ID.";
  }

  if (!STUDENT_STATUS_OPTIONS.includes(input.studentStatus as (typeof STUDENT_STATUS_OPTIONS)[number])) {
    errors.studentStatus = "Select a valid student status.";
  }

  if (!input.degreeLevel.trim()) {
    errors.degreeLevel = "Degree level is required.";
  }

  if (!input.department.trim()) {
    errors.department = "Department is required.";
  }

  if (!input.programName.trim()) {
    errors.programName = "Program name is required.";
  }

  if (input.institution.trim() !== INSTITUTION_NAME) {
    errors.institution = `Institution must be "${INSTITUTION_NAME}".`;
  }

  return errors;
}
