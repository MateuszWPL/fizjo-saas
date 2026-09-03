"use client";

import { useState } from "react";
import { BodyMap } from "./body-map";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";
import { painColor } from "@/lib/body-map/pain-scale";
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

  const groupFills: Record<string, string> = {};
  for (const marker of markers) {
    groupFills[marker.muscleGroup] = painColor(marker.painLevel);
  }

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
    <div className="flex flex-wrap gap-8">
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
      <section className="min-w-64 flex-1">
        {selectedGroup ? (
          <div className="max-w-xs">
            <h3 className="font-medium text-stone-800">{muscleGroupLabels[selectedGroup]}</h3>
            <label className="mt-3 block text-sm text-stone-700">
              Natężenie bólu (NRS): {values.painLevel}
              <input
                type="range"
                min={0}
                max={10}
                value={values.painLevel}
                onChange={(e) =>
                  setValues((current) => ({ ...current, painLevel: Number(e.target.value) }))
                }
                className="mt-1 w-full"
              />
            </label>
            <label className="mt-3 block text-sm text-stone-700">
              Charakter bólu
              <select
                value={values.painType}
                onChange={(e) =>
                  setValues((current) => ({ ...current, painType: e.target.value }))
                }
                className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              >
                <option value="">Nie określono</option>
                {painTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm text-stone-700">
              Notatka
              <textarea
                rows={3}
                value={values.note}
                onChange={(e) => setValues((current) => ({ ...current, note: e.target.value }))}
                className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </label>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-4 flex gap-3 text-sm">
              <button
                onClick={save}
                disabled={pending}
                className="rounded bg-stone-800 px-4 py-2 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
              >
                Zapisz
              </button>
              {selectedMarker && (
                <button
                  onClick={remove}
                  disabled={pending}
                  className="text-red-700 underline hover:text-red-800 disabled:opacity-60"
                >
                  Usuń
                </button>
              )}
              <button
                onClick={() => setSelectedGroup(null)}
                disabled={pending}
                className="text-stone-500 underline hover:text-stone-700 disabled:opacity-60"
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!readOnly && (
              <p className="text-sm text-stone-600">Kliknij mięsień, aby oznaczyć ból.</p>
            )}
            {markers.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">Brak oznaczeń bólu.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-stone-700">
                {markers.map((marker) => (
                  <li key={marker.id} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border border-stone-300"
                      style={{ background: painColor(marker.painLevel) }}
                    />
                    {readOnly ? (
                      <span>{muscleGroupLabels[marker.muscleGroup]}</span>
                    ) : (
                      <button
                        onClick={() => selectGroup(marker.muscleGroup)}
                        className="underline hover:text-stone-900"
                      >
                        {muscleGroupLabels[marker.muscleGroup]}
                      </button>
                    )}
                    <span className="text-stone-500">
                      NRS {marker.painLevel}
                      {marker.painType ? `, ${marker.painType}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
