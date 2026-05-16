import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md rounded-lg border border-border bg-white p-6 text-center shadow-soft">
        <h1 className="text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">The page you are looking for does not exist.</p>
        <Link href="/dashboard">
          <Button className="mt-5">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
