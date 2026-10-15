"use client";

import { useState } from "react";
import bodyMapData from "@/lib/body-map/body-map-data.json";
import { muscleGroupLabels, type BodyView } from "@/lib/body-map/muscle-groups";

interface BodyMapProps {
  view: BodyView;
  // grupy bez wpisu dostaja kolor bazowy
  groupFills: Record<string, string>;
  selectedGroup?: string | null;
  onGroupClick?: (group: string) => void;
}

const fills = {
  contour: "#e7e3dc",
  base: "#f2efe9",
  hovered: "#d8cbb4",
};

export function BodyMap({ view, groupFills, selectedGroup, onGroupClick }: BodyMapProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const { viewBox, paths } = bodyMapData[view];

  function fillFor(group: string | null) {
    if (!group) return fills.contour;
    const custom = groupFills[group];
    if (custom) return custom;
    return group === hoveredGroup || group === selectedGroup ? fills.hovered : fills.base;
  }

  return (
    <figure className="m-0">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={view === "front" ? "Mapa ciała, przód" : "Mapa ciała, tył"}
        className="h-[280px] w-auto sm:h-[440px]"
        onMouseLeave={() => setHoveredGroup(null)}
      >
        {paths.map(({ d, group }, i) => (
          <path
            key={i}
            d={d}
            fill={fillFor(group)}
            stroke={group && group === selectedGroup ? "#44403c" : "#a09a8f"}
            strokeWidth={group && group === selectedGroup ? 1 : 0.4}
            className={!group ? "pointer-events-none" : onGroupClick ? "cursor-pointer" : ""}
            onMouseEnter={group ? () => setHoveredGroup(group) : undefined}
            onClick={group && onGroupClick ? () => onGroupClick(group) : undefined}
          />
        ))}
      </svg>
      <figcaption className="mt-1 min-h-5 text-center text-sm">
        {hoveredGroup ? (
          <span className="font-medium">{muscleGroupLabels[hoveredGroup]}</span>
        ) : (
          <span className="text-muted-foreground">{view === "front" ? "Przód" : "Tył"}</span>
        )}
      </figcaption>
    </figure>
  );
}
