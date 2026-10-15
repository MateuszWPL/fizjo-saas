"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { NativeSelect } from "@/components/native-select";
import { PainLegend } from "@/components/pain-legend";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";
import { fillsFromMarkers, painColor, painTextColor } from "@/lib/body-map/pain-scale";
import { formatDate } from "@/lib/format";
import type { PainHistoryVisit } from "@/lib/types";

function PainLevel({ level }: { level: number | undefined }) {
  if (level === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span
      className="inline-block w-8 rounded py-0.5 text-center font-medium tabular-nums"
      style={{ background: painColor(level), color: painTextColor(level) }}
    >
      {level}
    </span>
  );
}

function Change({ before, after }: { before: number | undefined; after: number | undefined }) {
  if (before === undefined) {
    return <span className="text-destructive">nowy obszar</span>;
  }
  if (after === undefined) {
    return <span className="text-primary">ustąpił</span>;
  }
  const diff = after - before;
  if (diff === 0) {
    return <span className="text-muted-foreground">bez zmian</span>;
  }
  return diff < 0 ? (
    <span className="inline-flex items-center gap-1 text-primary tabular-nums">
      <ArrowDown className="size-4" aria-label="spadek" />
      {diff}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-destructive tabular-nums">
      <ArrowUp className="size-4" aria-label="wzrost" />+{diff}
    </span>
  );
}

// wizyty przychodza posortowane od najstarszej
export function PainComparison({ visits }: { visits: PainHistoryVisit[] }) {
  const [beforeId, setBeforeId] = useState(visits[0].id);
  const [afterId, setAfterId] = useState(visits[visits.length - 1].id);

  const before = visits.find((visit) => visit.id === beforeId) ?? visits[0];
  const after = visits.find((visit) => visit.id === afterId) ?? visits[visits.length - 1];
  const levelIn = (visit: PainHistoryVisit, group: string) =>
    visit.bodyMarkers.find((marker) => marker.muscleGroup === group)?.painLevel;

  const groups = [
    ...new Set([...before.bodyMarkers, ...after.bodyMarkers].map((m) => m.muscleGroup)),
  ].sort((a, b) => muscleGroupLabels[a].localeCompare(muscleGroupLabels[b], "pl"));

  const columns = [
    { label: "Wcześniej", visit: before, selected: beforeId, onChange: setBeforeId },
    { label: "Później", visit: after, selected: afterId, onChange: setAfterId },
  ];

  return (
    <div className="space-y-6">
      {visits.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Do porównania potrzebne są co najmniej dwie wizyty z oznaczeniami bólu.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        {columns.map(({ label, visit, selected, onChange }) => (
          <section key={label} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor={`visit-${label}`}>{label}</Label>
              <NativeSelect
                id={`visit-${label}`}
                value={selected}
                onChange={(e) => onChange(e.target.value)}
              >
                {visits.map((option) => (
                  <option key={option.id} value={option.id}>
                    {formatDate(option.visitDate)}
                  </option>
                ))}
              </NativeSelect>
              <span className="text-sm text-muted-foreground">
                obszary bólu: {visit.bodyMarkers.length}
              </span>
            </div>
            <div className="flex justify-center gap-4">
              <BodyMap view="front" groupFills={fillsFromMarkers(visit.bodyMarkers)} />
              <BodyMap view="back" groupFills={fillsFromMarkers(visit.bodyMarkers)} />
            </div>
          </section>
        ))}
      </div>
      <PainLegend />
      {groups.length === 0 ? null : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mięsień</TableHead>
              <TableHead className="text-center">{formatDate(before.visitDate)}</TableHead>
              <TableHead className="text-center">{formatDate(after.visitDate)}</TableHead>
              <TableHead>Zmiana NRS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group}>
                <TableCell className="font-medium">{muscleGroupLabels[group]}</TableCell>
                <TableCell className="text-center">
                  <PainLevel level={levelIn(before, group)} />
                </TableCell>
                <TableCell className="text-center">
                  <PainLevel level={levelIn(after, group)} />
                </TableCell>
                <TableCell>
                  <Change before={levelIn(before, group)} after={levelIn(after, group)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
