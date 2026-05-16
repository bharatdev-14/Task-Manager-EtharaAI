"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/providers/ToastProvider";

const passwordRules = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { label: "lowercase", test: (value: string) => /[a-z]/.test(value) },
  { label: "number", test: (value: string) => /[0-9]/.test(value) },
  { label: "symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) }
];

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signup } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
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

    const isPasswordValid = passwordRules.every((rule) => rule.test(password));
    if (name.trim().length < 2 || !email.includes("@") || !isPasswordValid) {
      setError("Enter a valid name, email, and stronger password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      toast({ title: "Account created", description: "Your workspace is ready.", variant: "success" });
      router.push("/dashboard");
    } catch {
      setError("Unable to create an account with those details.");
      toast({ title: "Signup failed", description: "The email may already be registered.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <div>
          <p className="text-sm font-medium text-brand-700">TeamFlow</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Create account</h1>
          <p className="mt-2 text-sm text-muted">Start managing team projects with protected access.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Name</span>
            <input
              className="mt-1 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              autoComplete="name"
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted">
            {passwordRules.map((rule) => (
              <span key={rule.label} className={rule.test(password) ? "text-green-700" : "text-muted"}>
                {rule.label}
              </span>
            ))}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already registered?{" "}
          <Link className="font-medium text-brand-700" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
