"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- *
 * Form primitives. Every one wires label -> control -> error message with
 * real ids and aria-describedby, so screen readers announce the error text.
 * -------------------------------------------------------------------------- */

const controlBase =
  "w-full bg-paper border px-4 py-3 text-body text-ink placeholder:text-muted " +
  "transition-colors duration-150 rounded-none " +
  "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

const controlState = (invalid?: boolean) =>
  invalid
    ? "border-error"
    : "border-stone-dark hover:border-muted focus:border-ink";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  hint?: string;
  hintId?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

function FieldShell({
  label,
  htmlFor,
  error,
  errorId,
  hint,
  hintId,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="u-eyebrow text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-sale">
            {" *"}
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------- input --------------------------------- */

interface InputProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  required,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  const id = useId();
  const errorId = id + "-error";
  const hintId = id + "-hint";

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      errorId={errorId}
      hint={hint}
      hintId={hintId}
      required={required}
      className={wrapperClassName}
    >
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(controlBase, controlState(Boolean(error)), className)}
        {...props}
      />
    </FieldShell>
  );
}

/* -------------------------------- textarea -------------------------------- */

interface TextareaProps extends Omit<ComponentProps<"textarea">, "id"> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Textarea({
  label,
  error,
  hint,
  required,
  className,
  wrapperClassName,
  ...props
}: TextareaProps) {
  const id = useId();
  const errorId = id + "-error";
  const hintId = id + "-hint";

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      errorId={errorId}
      hint={hint}
      hintId={hintId}
      required={required}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(controlBase, controlState(Boolean(error)), "resize-y", className)}
        {...props}
      />
    </FieldShell>
  );
}

/* --------------------------------- select --------------------------------- */

interface SelectProps extends Omit<ComponentProps<"select">, "id"> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  required,
  className,
  wrapperClassName,
  options,
  placeholder,
  ...props
}: SelectProps) {
  const id = useId();
  const errorId = id + "-error";
  const hintId = id + "-hint";

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      errorId={errorId}
      hint={hint}
      hintId={hintId}
      required={required}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            controlBase,
            controlState(Boolean(error)),
            "appearance-none pr-10",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-ink stroke-[1.5]"
        >
          <path d="M1 1l5 5 5-5" strokeLinecap="square" />
        </svg>
      </div>
    </FieldShell>
  );
}

/* -------------------------------- checkbox -------------------------------- */

interface CheckboxProps extends Omit<ComponentProps<"input">, "id" | "type"> {
  label: ReactNode;
  count?: number;
  swatch?: string;
}

export function Checkbox({
  label,
  count,
  swatch,
  className,
  ...props
}: CheckboxProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="peer size-4 shrink-0 cursor-pointer appearance-none border border-stone-dark bg-paper
                   checked:border-ink checked:bg-ink
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        {...props}
      />
      <label
        htmlFor={id}
        className="flex flex-1 cursor-pointer items-center gap-2.5 text-caption text-ink-soft
                   peer-checked:text-ink peer-checked:font-medium"
      >
        {swatch && (
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full border border-stone-dark"
            style={{ backgroundColor: swatch }}
          />
        )}
        <span className="flex-1">{label}</span>
        {count !== undefined && (
          <span className="text-micro text-muted tabular-nums">{count}</span>
        )}
      </label>
    </div>
  );
}
