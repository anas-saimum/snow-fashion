"use client";

import { useState } from "react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  hasErrors,
  validateContact,
  type ContactField,
  type ContactValues,
  type Errors,
} from "@/lib/validation/forms";

const SUBJECTS = [
  { value: "order", label: "An existing order" },
  { value: "sizing", label: "Sizing or fit advice" },
  { value: "product", label: "A question about a product" },
  { value: "returns", label: "Returns or exchanges" },
  { value: "other", label: "Something else" },
];

const empty: ContactValues = { name: "", email: "", subject: "", message: "" };

/**
 * Contact form. The route handler validates and logs the message; no email
 * provider is connected, so the success copy says only that we received it.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(empty);
  const [errors, setErrors] = useState<Errors<ContactField>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [message, setMessage] = useState("");

  const set =
    (field: ContactField) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstField = Object.keys(nextErrors).find(
        (key) => nextErrors[key as ContactField],
      );
      if (firstField) {
        document.querySelector<HTMLElement>('[name="' + firstField + '"]')?.focus();
      }
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus("failed");
        setMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      setMessage(data.message ?? "Thank you — we have received your message.");
      setValues(empty);
    } catch {
      setStatus("failed");
      setMessage("We could not reach the server. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-stone bg-canvas p-8" role="status">
        <h3 className="text-h3">Message received</h3>
        <p className="mt-3 text-caption leading-relaxed text-ink-soft">{message}</p>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          required
          value={values.name}
          onChange={set("name")}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
      </div>

      <Select
        label="What is this about?"
        name="subject"
        required
        placeholder="Choose a subject"
        options={SUBJECTS}
        value={values.subject}
        onChange={set("subject")}
        error={errors.subject}
      />

      <Textarea
        label="Message"
        name="message"
        rows={6}
        required
        value={values.message}
        onChange={set("message")}
        error={errors.message}
        hint="Include an order number if your question is about an order."
      />

      <div aria-live="polite">
        {status === "failed" && message && (
          <p className="border border-error p-4 text-caption text-error">{message}</p>
        )}
      </div>

      <div>
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>

      <p className="text-micro leading-relaxed text-muted">
        We use your details only to answer your enquiry. See our{" "}
        <a href="/privacy" className="u-link text-ink">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
