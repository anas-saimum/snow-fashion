import { afterEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  getLocalAuthConfig,
  SESSION_TTL_SECONDS,
  verifyCredentials,
  verifySessionToken,
  type LocalAuthConfig,
} from "@/lib/admin/local-auth";

const config: LocalAuthConfig = {
  loginId: "admin",
  password: "correct horse battery staple",
  secret: "test-secret",
};

describe("getLocalAuthConfig", () => {
  const saved = { ...process.env };

  afterEach(() => {
    for (const key of ["ADMIN_LOGIN_ID", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("is off unless both id and password are set", () => {
    delete process.env.ADMIN_LOGIN_ID;
    delete process.env.ADMIN_PASSWORD;
    expect(getLocalAuthConfig()).toBeNull();

    process.env.ADMIN_LOGIN_ID = "admin";
    expect(getLocalAuthConfig()).toBeNull();
  });

  it("treats blank values as missing", () => {
    process.env.ADMIN_LOGIN_ID = "admin";
    process.env.ADMIN_PASSWORD = "   ";
    expect(getLocalAuthConfig()).toBeNull();
  });

  it("derives a signing key from the credentials when no secret is given", () => {
    process.env.ADMIN_LOGIN_ID = " admin ";
    process.env.ADMIN_PASSWORD = "pw";
    delete process.env.ADMIN_SESSION_SECRET;

    const a = getLocalAuthConfig();
    expect(a).toEqual({ loginId: "admin", password: "pw", secret: expect.any(String) });

    process.env.ADMIN_PASSWORD = "other";
    expect(getLocalAuthConfig()?.secret).not.toBe(a?.secret);

    process.env.ADMIN_SESSION_SECRET = "explicit";
    expect(getLocalAuthConfig()?.secret).toBe("explicit");
  });
});

describe("verifyCredentials", () => {
  it("accepts the right pair", async () => {
    await expect(verifyCredentials(config, "admin", config.password)).resolves.toBe(true);
  });

  it("ignores case and whitespace in the login ID only", async () => {
    await expect(verifyCredentials(config, "  ADMIN ", config.password)).resolves.toBe(true);
    await expect(
      verifyCredentials(config, "admin", config.password.toUpperCase()),
    ).resolves.toBe(false);
  });

  it("rejects a wrong id, a wrong password, and empty input", async () => {
    await expect(verifyCredentials(config, "root", config.password)).resolves.toBe(false);
    await expect(verifyCredentials(config, "admin", "nope")).resolves.toBe(false);
    await expect(verifyCredentials(config, "", "")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  const now = 1_800_000_000_000;

  it("round-trip", async () => {
    const token = await createSessionToken(config, now);
    const session = await verifySessionToken(config, token, now + 1000);
    expect(session).toEqual({ sub: "admin", exp: now + SESSION_TTL_SECONDS * 1000 });
  });

  it("expires", async () => {
    const token = await createSessionToken(config, now);
    const late = now + SESSION_TTL_SECONDS * 1000;
    await expect(verifySessionToken(config, token, late)).resolves.toBeNull();
  });

  it("rejects tampering, forgery and garbage", async () => {
    const token = await createSessionToken(config, now);
    const [payload, signature] = token.split(".");

    // Change the payload, keep the signature.
    const forged = Buffer.from(
      JSON.stringify({ sub: "admin", exp: now + 10 * 365 * 24 * 3600 * 1000 }),
    ).toString("base64url");
    await expect(verifySessionToken(config, forged + "." + signature, now)).resolves.toBeNull();

    // Flip a character of the signature.
    const flipped = signature[0] === "A" ? "B" : "A";
    await expect(
      verifySessionToken(config, payload + "." + flipped + signature.slice(1), now),
    ).resolves.toBeNull();

    await expect(verifySessionToken(config, undefined, now)).resolves.toBeNull();
    await expect(verifySessionToken(config, "", now)).resolves.toBeNull();
    await expect(verifySessionToken(config, "no-dot", now)).resolves.toBeNull();
    await expect(verifySessionToken(config, ".sig", now)).resolves.toBeNull();
  });

  it("is invalidated by a different secret or a different login id", async () => {
    const token = await createSessionToken(config, now);

    await expect(
      verifySessionToken({ ...config, secret: "rotated" }, token, now),
    ).resolves.toBeNull();

    // Same secret, new login ID: old cookies must not carry over.
    await expect(
      verifySessionToken({ ...config, loginId: "owner" }, token, now),
    ).resolves.toBeNull();
  });
});
