export function painColor(level: number): string {
  if (level <= 2) return "#fde68a";
  if (level <= 4) return "#fbbf24";
  if (level <= 6) return "#f97316";
  if (level <= 8) return "#dc2626";
  return "#7f1d1d";
}
