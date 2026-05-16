import { ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage workspace access and application defaults.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Team members</h2>
              <p className="mt-1 text-sm text-muted">Invite users and assign project-level roles.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Role based access</h2>
              <p className="mt-1 text-sm text-muted">Use ADMIN and MEMBER project roles.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
