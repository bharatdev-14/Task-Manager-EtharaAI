import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ForbiddenNotice({ message }: { message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3 text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
    </Card>
  );
}
