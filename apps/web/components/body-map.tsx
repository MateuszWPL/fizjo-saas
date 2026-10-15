"use client";

import { useId, useState } from "react";
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
  // id musi byc unikalne, bo na stronie bywa kilka sylwetek naraz
  const clipId = `contour-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { viewBox, paths } = bodyMapData[view];

  // podklady (patrz scripts/build-body-map.mjs) w spoczynku maja kolor konturu,
  // zeby rysunek wygladal jak oryginal, a kolor dostaja dopiero razem z grupa
  function fillFor(group: string | null, underlay: boolean) {
    if (!group) return fills.contour;
    const custom = groupFills[group];
    if (custom) return custom;
    if (group === hoveredGroup || group === selectedGroup) return fills.hovered;
    return underlay ? fills.contour : fills.base;
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
        <defs>
          {/* pierwsza sciezka to zawsze kontur sylwetki */}
          <clipPath id={clipId}>
            <path d={paths[0].d} />
          </clipPath>
        </defs>
        {paths.map(({ d, group, underlay = false }, i) => (
          <path
            key={i}
            d={d}
            fill={fillFor(group, underlay)}
            clipPath={underlay ? `url(#${clipId})` : undefined}
            stroke={underlay ? "none" : group && group === selectedGroup ? "#44403c" : "#a09a8f"}
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
