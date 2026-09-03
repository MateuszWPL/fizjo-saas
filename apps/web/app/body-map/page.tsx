"use client";

import { useState } from "react";
import { BodyMap } from "@/components/body-map";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";

export default function BodyMapPage() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  function toggleGroup(group: string) {
    setSelectedGroups((groups) =>
      groups.includes(group) ? groups.filter((g) => g !== group) : [...groups, group],
    );
  }

  const groupFills = Object.fromEntries(selectedGroups.map((group) => [group, "#c96f4a"]));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold text-stone-800">Mapa ciała</h1>
      <p className="mt-1 text-sm text-stone-600">
        Kliknij mięsień, żeby go zaznaczyć. Strony liczone są od strony pacjenta.
      </p>
      <div className="mt-4 flex flex-wrap gap-8">
        <BodyMap view="front" groupFills={groupFills} onGroupClick={toggleGroup} />
        <BodyMap view="back" groupFills={groupFills} onGroupClick={toggleGroup} />
        <section className="min-w-56 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-stone-800">Zaznaczone</h2>
            {selectedGroups.length > 0 && (
              <button
                onClick={() => setSelectedGroups([])}
                className="text-sm text-stone-500 underline hover:text-stone-700"
              >
                Wyczyść
              </button>
            )}
          </div>
          {selectedGroups.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">Nic nie zaznaczono.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-stone-700">
              {selectedGroups.map((group) => (
                <li key={group}>{muscleGroupLabels[group]}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
