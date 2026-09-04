/**
 * Small hand-rolled validators.
 *
 * A schema library would be the right call once these forms grow, but three
 * short forms do not justify shipping one to the browser. Each validator
 * returns a field -> message map; an empty map means valid.
 */

export type Errors<T extends string> = Partial<Record<T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
// Digits, spaces and the usual separators; 7-20 digits once stripped.
const PHONE_ALLOWED = /^[0-9+()\-.\s]+$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export function isPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_ALLOWED.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 20;
}

/* ------------------------------ newsletter ------------------------------- */

export type NewsletterField = "email";

export function validateNewsletter(email: string): Errors<NewsletterField> {
  const value = email.trim();
  if (!value) return { email: "Please enter your email address." };
  if (!isEmail(value)) return { email: "Please enter a valid email address." };
  return {};
}

/* -------------------------------- contact -------------------------------- */

export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactValues;

export function validateContact(values: ContactValues): Errors<ContactField> {
  const errors: Errors<ContactField> = {};

  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!isEmail(values.email)) errors.email = "Please enter a valid email address.";
  if (!values.subject.trim()) errors.subject = "Please choose a subject.";
  if (values.message.trim().length < 10)
    errors.message = "Please tell us a little more — at least 10 characters.";

  return errors;
}

/* ------------------------------- checkout -------------------------------- */

export interface CheckoutValues {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

export type CheckoutField = keyof CheckoutValues;

export const emptyCheckoutValues: CheckoutValues = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  notes: "",
};

export function validateCheckout(
  values: CheckoutValues,
): Errors<CheckoutField> {
  const errors: Errors<CheckoutField> = {};

  if (values.fullName.trim().length < 2)
    errors.fullName = "Please enter your full name.";

  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!isEmail(values.email))
    errors.email = "Please enter a valid email address.";

  if (!values.phone.trim()) errors.phone = "Please enter a phone number.";
  else if (!isPhone(values.phone))
    errors.phone = "Please enter a valid phone number.";

  if (!values.line1.trim()) errors.line1 = "Please enter your street address.";
  if (!values.city.trim()) errors.city = "Please enter your city.";
  if (!values.postalCode.trim())
    errors.postalCode = "Please enter your postal code.";
  else if (values.postalCode.trim().length < 3)
    errors.postalCode = "That postal code looks too short.";
  if (!values.country.trim()) errors.country = "Please select a country.";

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
