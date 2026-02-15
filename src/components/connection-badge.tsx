import { cn } from "@/lib/utils";
import { getStrengthLevel } from "@/lib/matching";

interface ConnectionBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ConnectionBadge({ score, size = "md" }: ConnectionBadgeProps) {
  const level = getStrengthLevel(score);

  const colorClass = {
    high: "bg-strength-high/20 text-strength-high border-strength-high/30",
    medium:
      "bg-strength-medium/20 text-strength-medium border-strength-medium/30",
    low: "bg-strength-low/20 text-strength-low border-strength-low/30",
  }[level];

  const sizeClass = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        colorClass,
        sizeClass
      )}
    >
      <span className="font-bold">{score}</span>
      <span className="opacity-70">pts</span>
    </span>
  );
}
