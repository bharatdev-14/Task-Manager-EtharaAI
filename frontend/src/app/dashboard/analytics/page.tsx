import { Card } from "@/components/ui/Card";

const analytics = [
  { label: "Completion rate", value: "78%", detail: "Across active projects" },
  { label: "Average cycle time", value: "4.2d", detail: "From todo to done" },
  { label: "Overdue tasks", value: "7", detail: "Needs triage" }
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Measure delivery flow and project health.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {analytics.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{item.value}</p>
            <p className="mt-1 text-xs text-muted">{item.detail}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-ink">Workload distribution</h2>
        <div className="mt-6 space-y-4">
          {[
            ["Engineering", 72],
            ["Design", 48],
            ["Operations", 36],
            ["Customer Success", 58]
          ].map(([team, value]) => (
            <div key={team}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-ink">{team}</span>
                <span className="text-muted">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
