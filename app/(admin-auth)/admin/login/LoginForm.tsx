"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signInAction } from "@/app/admin/actions";
import { isEmail } from "@/lib/validation/forms";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const next: typeof fieldErrors = {};
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!isEmail(email)) next.email = "That does not look like an email address.";
    if (!password) next.password = "Enter your password.";

    setFieldErrors(next);
    if (next.email || next.password) return;

    startTransition(async () => {
      const result = await signInAction(email, password);

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
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        autoFocus
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
        }}
        error={fieldErrors.email}
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
