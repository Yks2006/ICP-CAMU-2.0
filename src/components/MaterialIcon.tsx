import { cn } from "@/lib/utils";

type MaterialIconProps = {
  icon: string;
  className?: string;
  filled?: boolean;
};

export function MaterialIcon({ icon, className, filled = false }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
    >
      {icon}
    </span>
  );
}
