"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.includes("@") || password.length === 0) {
      setError("Enter a valid email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
      const searchParams = new URLSearchParams(window.location.search);
      toast({ title: "Signed in", description: "Welcome back to TeamFlow.", variant: "success" });
      router.push(searchParams.get("next") ?? "/dashboard");
    } catch {
      setError("Unable to sign in with those credentials.");
      toast({ title: "Sign in failed", description: "Check your email and password.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <div>
          <p className="text-sm font-medium text-brand-700">TeamFlow</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Access your projects, tasks, and team analytics.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Need an account?{" "}
          <Link className="font-medium text-brand-700" href="/signup">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
