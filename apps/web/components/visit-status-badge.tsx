import { Badge } from "@/components/ui/badge";

export function VisitStatusBadge({ closedAt }: { closedAt: string | null }) {
  return closedAt ? (
    <Badge variant="secondary">Zamknięta</Badge>
  ) : (
    <Badge>Otwarta</Badge>
  );
}
