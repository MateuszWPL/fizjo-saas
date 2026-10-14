"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BodyMap } from "./body-map";
import { ErrorMessage } from "./load-state";
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
      <div className="space-y-3">
        <div className="flex flex-wrap justify-center gap-6">
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
        <PainLegend />
      </div>
      <div className="min-w-64">
        {selectedGroup ? (
          <div className="space-y-4">
            <h3 className="font-medium">{muscleGroupLabels[selectedGroup]}</h3>
            <div className="space-y-2">
              <Label htmlFor="painLevel">Natężenie bólu (NRS)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="painLevel"
                  type="range"
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
          <div className="space-y-3">
            {!readOnly && (
              <p className="text-sm text-muted-foreground">
                Kliknij mięsień na sylwetce, żeby oznaczyć ból.
              </p>
            )}
            <Separator />
            {markers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak oznaczeń bólu.</p>
            ) : (
              <ul className="space-y-1">
                {markers.map((marker) => (
                  <li key={marker.id}>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => selectGroup(marker.muscleGroup)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm enabled:hover:bg-muted"
                    >
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                        style={{
                          background: painColor(marker.painLevel),
                          color: painTextColor(marker.painLevel),
                        }}
                      >
                        {marker.painLevel}
                      </span>
                      <span className="flex-1">{muscleGroupLabels[marker.muscleGroup]}</span>
                      {marker.painType && (
                        <span className="text-muted-foreground">{marker.painType}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
