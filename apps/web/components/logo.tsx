import { painColor } from "@/lib/body-map/pain-scale";

// ten sam znak co app/icon.svg: sylwetka z punktem bolu w kolorze ze skali NRS
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="6 3 20 26" aria-hidden="true" className={className}>
      <circle cx="16" cy="7.5" r="3" fill="currentColor" />
      <path
        d="M16 12v9M10 15h12M16 21l-4 6M16 21l4 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="15" r="2.8" fill={painColor(6)} stroke="var(--card)" strokeWidth="1" />
    </svg>
  );
}
