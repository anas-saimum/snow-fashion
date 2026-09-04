"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { validateNewsletter } from "@/lib/validation/forms";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * Newsletter signup.
 *
 * The route handler validates and logs the address; no email provider is
 * connected yet, so the success copy says only that we received it. Do not
 * change this to claim a subscription until a provider is wired up.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateNewsletter(email);
    if (errors.email) {
      setError(errors.email);
      setStatus("error");
      return;
    }

    setError(undefined);
    setStatus("submitting");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("done");
      setMessage(data.message ?? "Thanks — we have your email address.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please try again.");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="bg-paper">
      <div className="u-container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="u-eyebrow">Newsletter</p>

          <h2 id="newsletter-heading" className="mt-3 text-h2">
            Stay in Style
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-caption leading-relaxed text-muted sm:text-body">
            Be the first to discover new collections, exclusive offers, and
            fashion inspiration.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1 text-left">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(undefined);
                    if (status !== "idle") setStatus("idle");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    error
                      ? "newsletter-error"
                      : status === "done"
                        ? "newsletter-status"
                        : undefined
                  }
                  className={
                    "h-13 w-full border bg-paper px-4 text-body text-ink placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink " +
                    (error ? "border-error" : "border-stone-dark focus:border-ink")
                  }
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="h-13 sm:w-auto"
              >
                {status === "submitting" ? "Sending…" : "Subscribe"}
              </Button>
            </div>

            <div aria-live="polite" className="min-h-6 pt-3">
              {error && (
                <p id="newsletter-error" className="text-caption text-error">
                  {error}
                </p>
              )}
              {!error && status === "done" && (
                <p id="newsletter-status" className="text-caption text-success">
                  {message}
                </p>
              )}
              {!error && status === "error" && message && (
                <p className="text-caption text-error">{message}</p>
              )}
            </div>
          </form>

          <p className="text-micro text-muted">
            By subscribing you agree to our{" "}
            <a href="/privacy" className="u-link text-ink">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
