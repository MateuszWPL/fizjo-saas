import { painScale } from "@/lib/body-map/pain-scale";

export function PainLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span>Natężenie bólu (NRS):</span>
      {painScale.map((step) => (
        <span key={step.label} className="flex items-center gap-1">
          <span className="size-3 rounded-sm" style={{ background: step.color }} />
          {step.label}
        </span>
      ))}
    </div>
  );
}
