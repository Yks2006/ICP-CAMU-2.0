export function formatStudentEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.toUpperCase()}@${domain.toLowerCase()}`;
}
