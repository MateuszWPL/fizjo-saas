"use client";

import { useState } from "react";
import bodyMapData from "@/lib/body-map/body-map-data.json";
import { muscleGroupLabels, type BodyView } from "@/lib/body-map/muscle-groups";

interface BodyMapProps {
  view: BodyView;
  selectedGroups: string[];
  onGroupClick: (group: string) => void;
}

const fills = {
  contour: "#e7e3dc",
  base: "#f2efe9",
  hovered: "#d8cbb4",
  selected: "#c96f4a",
  selectedHovered: "#b85c38",
};

export function BodyMap({ view, selectedGroups, onGroupClick }: BodyMapProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const { viewBox, paths } = bodyMapData[view];

  function fillFor(group: string | null) {
    if (!group) return fills.contour;
    const selected = selectedGroups.includes(group);
    if (group === hoveredGroup) return selected ? fills.selectedHovered : fills.hovered;
    return selected ? fills.selected : fills.base;
  }

  return (
    <figure className="m-0">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={view === "front" ? "Mapa ciała, przód" : "Mapa ciała, tył"}
        className="h-[70vh] w-auto"
        onMouseLeave={() => setHoveredGroup(null)}
      >
        {paths.map(({ d, group }, i) => (
          <path
            key={i}
            d={d}
            fill={fillFor(group)}
            stroke="#a09a8f"
            strokeWidth={0.4}
            className={group ? "cursor-pointer" : "pointer-events-none"}
            onMouseEnter={group ? () => setHoveredGroup(group) : undefined}
            onClick={group ? () => onGroupClick(group) : undefined}
          />
        ))}
      </svg>
      <figcaption className="mt-1 min-h-5 text-center text-sm text-stone-600">
        {hoveredGroup ? muscleGroupLabels[hoveredGroup] : ""}
      </figcaption>
    </figure>
  );
}
