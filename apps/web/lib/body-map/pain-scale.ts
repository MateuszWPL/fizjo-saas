// progi skali NRS 0-10 i ich kolory, od jasnozoltego do bordowego
export const painScale = [
  { max: 2, label: "0-2", color: "#fde68a" },
  { max: 4, label: "3-4", color: "#fbbf24" },
  { max: 6, label: "5-6", color: "#f97316" },
  { max: 8, label: "7-8", color: "#dc2626" },
  { max: 10, label: "9-10", color: "#7f1d1d" },
];

export function painColor(level: number): string {
  return (painScale.find((step) => level <= step.max) ?? painScale[painScale.length - 1]).color;
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
