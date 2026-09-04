import { describe, expect, it } from "vitest";
import {
  emptyCheckoutValues,
  hasErrors,
  isEmail,
  isPhone,
  validateCheckout,
  validateContact,
  validateNewsletter,
} from "@/lib/validation/forms";

describe("isEmail", () => {
  it("accepts ordinary addresses", () => {
    for (const value of ["a@b.co", "first.last+tag@example.com", " x@y.io "]) {
      expect(isEmail(value)).toBe(true);
    }
  });

  it("rejects malformed addresses", () => {
    for (const value of ["", "a@b", "a b@c.com", "@example.com", "no-at.com"]) {
      expect(isEmail(value)).toBe(false);
    }
  });
});

describe("isPhone", () => {
  it("accepts common formats", () => {
    for (const value of ["+1 (555) 014-2200", "5550142200", "+44 20 7946 0958"]) {
      expect(isPhone(value)).toBe(true);
    }
  });

  it("rejects letters and too-short numbers", () => {
    expect(isPhone("call me")).toBe(false);
    expect(isPhone("12345")).toBe(false);
  });
});

describe("validateNewsletter", () => {
  it("requires an address", () => {
    expect(validateNewsletter("").email).toBeTruthy();
  });

  it("requires a valid address", () => {
    expect(validateNewsletter("nope").email).toBeTruthy();
  });

  it("passes a good address", () => {
    expect(validateNewsletter("hello@example.com")).toEqual({});
  });
});

describe("validateContact", () => {
  it("flags every empty required field", () => {
    const errors = validateContact({ name: "", email: "", subject: "", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "subject"]);
  });

  it("requires a message of substance", () => {
    const errors = validateContact({
      name: "A",
      email: "a@b.co",
      subject: "order",
      message: "hi",
    });
    expect(errors.message).toBeTruthy();
  });

  it("passes a complete submission", () => {
    expect(
      validateContact({
        name: "Ada",
        email: "ada@example.com",
        subject: "sizing",
        message: "Could you advise on the fit of the Margot dress?",
      }),
    ).toEqual({});
  });
});

describe("validateCheckout", () => {
  it("flags all required fields on an empty form", () => {
    const errors = validateCheckout(emptyCheckoutValues);
    expect(Object.keys(errors).sort()).toEqual(
      ["city", "country", "email", "fullName", "line1", "phone", "postalCode"].sort(),
    );
    expect(hasErrors(errors)).toBe(true);
  });

  it("does not require the optional fields", () => {
    const errors = validateCheckout({
      ...emptyCheckoutValues,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+1 555 014 2200",
      line1: "24 Atelier Lane",
      city: "New York",
      postalCode: "10013",
      country: "United States",
    });
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("rejects a one-character name and a stub postal code", () => {
    const errors = validateCheckout({
      ...emptyCheckoutValues,
      fullName: "A",
      email: "ada@example.com",
      phone: "5550142200",
      line1: "Somewhere",
      city: "Town",
      postalCode: "1",
      country: "United States",
    });
    expect(errors.fullName).toBeTruthy();
    expect(errors.postalCode).toBeTruthy();
  });
});
