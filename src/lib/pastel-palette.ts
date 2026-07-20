export const PASTEL_TONES = [
  {
    card: "bg-pastel-green border-pastel-green-border",
    label: "text-pastel-green-text",
  },
  {
    card: "bg-pastel-yellow border-pastel-yellow-border",
    label: "text-pastel-yellow-text",
  },
  {
    card: "bg-pastel-coral border-pastel-coral-border",
    label: "text-pastel-coral-text",
  },
  {
    card: "bg-pastel-purple border-pastel-purple-border",
    label: "text-pastel-purple-text",
  },
  {
    card: "bg-pastel-blue border-pastel-blue-border",
    label: "text-pastel-blue-text",
  },
  {
    card: "bg-pastel-mint border-pastel-mint-border",
    label: "text-pastel-mint-text",
  },
] as const;

export function getPastelTone(index: number) {
  return PASTEL_TONES[index % PASTEL_TONES.length];
}

export const PORTAL_SECTION_TONES = {
  profile: "bg-pastel-blue/40 border-pastel-blue-border",
  classes: "bg-pastel-blue/30 border-pastel-blue-border",
  assignments: "bg-pastel-purple/35 border-pastel-purple-border",
  attendance: "bg-pastel-green/40 border-pastel-green-border",
  calendar: "bg-pastel-yellow/45 border-pastel-yellow-border",
  updates: "bg-pastel-coral/35 border-pastel-coral-border",
  courses: "bg-pastel-mint/40 border-pastel-mint-border",
  notifications: "bg-pastel-purple/30 border-pastel-purple-border",
} as const;
