export function painColor(level: number): string {
  if (level <= 2) return "#fde68a";
  if (level <= 4) return "#fbbf24";
  if (level <= 6) return "#f97316";
  if (level <= 8) return "#dc2626";
  return "#7f1d1d";
}

// od poziomu 7 tlo jest na tyle ciemne, ze tekst musi byc bialy
export function painTextColor(level: number): string {
  return level >= 7 ? "#fff" : "#1c1917";
}

export function fillsFromMarkers(
  markers: { muscleGroup: string; painLevel: number }[],
): Record<string, string> {
  const fills: Record<string, string> = {};
  for (const marker of markers) {
    fills[marker.muscleGroup] = painColor(marker.painLevel);
  }
  return fills;
}
