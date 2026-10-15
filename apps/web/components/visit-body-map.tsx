"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BodyMap } from "./body-map";
import { ErrorMessage } from "./load-state";
import { NativeSelect } from "./native-select";
import { PainLegend } from "./pain-legend";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";
import { fillsFromMarkers, painColor, painTextColor } from "@/lib/body-map/pain-scale";
import type { BodyMarker } from "@/lib/types";

export interface MarkerFormValues {
  painLevel: number;
  painType: string;
  note: string;
}

const painTypes = ["ostry", "tępy", "piekący", "pulsujący", "promieniujący"];

const emptyValues: MarkerFormValues = { painLevel: 5, painType: "", note: "" };

interface VisitBodyMapProps {
  markers: BodyMarker[];
  readOnly: boolean;
  onSave: (group: string, values: MarkerFormValues) => Promise<void>;
  onDelete: (group: string) => Promise<void>;
}

export function VisitBodyMap({ markers, readOnly, onSave, onDelete }: VisitBodyMapProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [values, setValues] = useState<MarkerFormValues>(emptyValues);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupFills = fillsFromMarkers(markers);
  const selectedMarker = markers.find((marker) => marker.muscleGroup === selectedGroup);
  const unmarkedGroups = Object.entries(muscleGroupLabels)
    .filter(([group]) => !markers.some((marker) => marker.muscleGroup === group))
    .sort(([, a], [, b]) => a.localeCompare(b, "pl"));

  function selectGroup(group: string) {
    const marker = markers.find((m) => m.muscleGroup === group);
    setSelectedGroup(group);
    setValues(
      marker
        ? { painLevel: marker.painLevel, painType: marker.painType ?? "", note: marker.note ?? "" }
        : emptyValues,
    );
    setError(null);
  }

  async function save() {
    if (!selectedGroup) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSave(selectedGroup, values);
      setSelectedGroup(null);
    } catch {
      setError("Nie udało się zapisać znacznika.");
    }
    setPending(false);
  }

  async function remove() {
    if (!selectedGroup) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onDelete(selectedGroup);
      setSelectedGroup(null);
    } catch {
      setError("Nie udało się usunąć znacznika.");
    }
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="flex justify-center gap-4 sm:gap-6">
        <BodyMap
          view="front"
          groupFills={groupFills}
          selectedGroup={selectedGroup}
          onGroupClick={readOnly ? undefined : selectGroup}
        />
        <BodyMap
          view="back"
          groupFills={groupFills}
          selectedGroup={selectedGroup}
          onGroupClick={readOnly ? undefined : selectGroup}
        />
      </div>
      <div className="min-w-64 lg:border-l lg:pl-6">
        {selectedGroup ? (
          <div className="space-y-4">
            <h3 className="font-medium">{muscleGroupLabels[selectedGroup]}</h3>
            <div className="space-y-2">
              <Label htmlFor="painLevel">Natężenie bólu (NRS)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="painLevel"
                  type="range"
                  autoFocus
                  min={0}
                  max={10}
                  value={values.painLevel}
                  onChange={(e) =>
                    setValues((current) => ({ ...current, painLevel: Number(e.target.value) }))
                  }
                  className="w-full accent-primary"
                />
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
                  style={{
                    background: painColor(values.painLevel),
                    color: painTextColor(values.painLevel),
                  }}
                >
                  {values.painLevel}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Charakter bólu</Label>
              <div className="flex flex-wrap gap-2">
                {painTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={values.painType === type ? "default" : "outline"}
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        painType: current.painType === type ? "" : type,
                      }))
                    }
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="markerNote">Notatka</Label>
              <Textarea
                id="markerNote"
                rows={3}
                value={values.note}
                onChange={(e) => setValues((current) => ({ ...current, note: e.target.value }))}
              />
            </div>
            {error && <ErrorMessage message={error} />}
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={pending}>
                Zapisz
              </Button>
              <Button variant="outline" onClick={() => setSelectedGroup(null)} disabled={pending}>
                Anuluj
              </Button>
              {selectedMarker && (
                <Button variant="destructive" onClick={remove} disabled={pending}>
                  <Trash2 />
                  Usuń
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">
                Oznaczenia bólu
                {markers.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {markers.length}
                  </span>
                )}
              </h3>
              {!readOnly && (
                <p className="text-sm text-muted-foreground">
                  Kliknij obszar na sylwetce albo pozycję z listy, żeby ją zmienić.
                </p>
              )}
            </div>
            {/* sylwetki nie da sie obsluzyc klawiatura, wiec obszar mozna tez wybrac z listy */}
            {!readOnly && (
              <NativeSelect
                aria-label="Dodaj obszar z listy"
                value=""
                onChange={(e) => selectGroup(e.target.value)}
                className="w-full"
              >
                <option value="">Dodaj obszar z listy...</option>
                {unmarkedGroups.map(([group, label]) => (
                  <option key={group} value={group}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            )}
            {markers.length === 0 ? (
              <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                {readOnly
                  ? "Na tej wizycie nie oznaczono bólu."
                  : "Brak oznaczeń. Kliknij bolesny obszar na sylwetce."}
              </p>
            ) : (
              <ul className="divide-y rounded-md border">
                {markers.map((marker) => (
                  <li key={marker.id}>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => selectGroup(marker.muscleGroup)}
                      className="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm enabled:hover:bg-muted"
                    >
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-md font-semibold tabular-nums"
                        style={{
                          background: painColor(marker.painLevel),
                          color: painTextColor(marker.painLevel),
                        }}
                      >
                        {marker.painLevel}
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium">
                          {muscleGroupLabels[marker.muscleGroup]}
                        </span>
                        {(marker.painType || marker.note) && (
                          <span className="block text-muted-foreground">
                            {[marker.painType, marker.note].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <PainLegend />
          </div>
        )}
      </div>
    </div>
  );
}
