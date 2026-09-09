"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signInAction } from "@/app/admin/actions";
import { isEmail } from "@/lib/validation/forms";

interface LoginFormProps {
  nextPath?: string;
  /**
   * Supabase accounts are addressed by email; the environment-variable
   * admin has a free-form login ID. The form only changes its label and
   * validation — the action decides what to check the values against.
   */
  method: "supabase" | "local";
}

export function LoginForm({ nextPath, method }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [pending, startTransition] = useTransition();

  const byEmail = method === "supabase";
  const idLabel = byEmail ? "Email" : "Login ID";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const next: typeof fieldErrors = {};
    if (!identifier.trim()) {
      next.identifier = byEmail ? "Enter your email address." : "Enter your login ID.";
    } else if (byEmail && !isEmail(identifier)) {
      next.identifier = "That does not look like an email address.";
    }
    if (!password) next.password = "Enter your password.";

    setFieldErrors(next);
    if (next.identifier || next.password) return;

    startTransition(async () => {
      const result = await signInAction(identifier, password);

      if (!result.ok) {
        setError(result.message);
        setPassword("");
        return;
      }

      // The session cookie is set by the action; refresh so the server
      // components re-render with it, then move on.
      const destination =
        nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin";
      router.replace(destination);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-5">
      <Input
        label={idLabel}
        name={byEmail ? "email" : "username"}
        type={byEmail ? "email" : "text"}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        required
        value={identifier}
        onChange={(event) => {
          setIdentifier(event.target.value);
          if (fieldErrors.identifier)
            setFieldErrors((f) => ({ ...f, identifier: undefined }));
        }}
        error={fieldErrors.identifier}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (fieldErrors.password)
            setFieldErrors((f) => ({ ...f, password: undefined }));
        }}
        error={fieldErrors.password}
      />

      <div aria-live="polite">
        {error && (
          <p className="border border-error bg-paper p-3 text-caption text-error">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
