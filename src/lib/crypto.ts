import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";

// ─────────────────────────────────────────────────────────────────────────
// Framework-agnostic crypto helpers for branch admin auth. Kept separate
// from lib/auth.ts (which also imports next/headers) so this file can be
// safely imported from prisma/seed.ts, which runs outside of Next.js.
// ─────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "oven_admin_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    // Fall back to a fixed dev-only secret so local development doesn't
    // break, but this must be set in production (see .env.example).
    return "dev-only-insecure-secret-set-ADMIN_SESSION_SECRET";
  }
  return secret;
}

// ── Passwords ───────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const separatorIndex = stored.indexOf(":");
  if (separatorIndex === -1) return false;

  const salt = stored.slice(0, separatorIndex);
  const hashHex = stored.slice(separatorIndex + 1);
  if (!salt || !hashHex) return false;

  const hash = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hashHex, "hex");
  if (hash.length !== storedHash.length) return false;
  return timingSafeEqual(hash, storedHash);
}

// ── Session tokens ──────────────────────────────────────────────────────

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(branchId: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${branchId}.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): { branchId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [branchId, expiresAtStr, signature] = parts;
  if (!branchId || !expiresAtStr || !signature) return null;
  const payload = `${branchId}.${expiresAtStr}`;
  const expected = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  return { branchId };
}
