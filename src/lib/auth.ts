import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySessionToken } from "./crypto";

export { SESSION_COOKIE, hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "./crypto";

// ─────────────────────────────────────────────────────────────────────────
// Branch admin auth.
//
// Each branch has its own login (Branch.adminUsername / Branch.passwordHash),
// so a branch can only ever see and manage its own orders — there is no
// shared "super admin" account. Sessions are a signed, httpOnly cookie
// (branchId + expiry, HMAC-SHA256, see lib/crypto.ts) — no external auth
// dependency required.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Reads and verifies the admin session cookie for the current request, then
 * loads the branch it belongs to. Returns null if there is no valid session
 * or the branch is no longer active — callers should redirect to
 * /admin/login in that case.
 */
export async function getAdminSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;

  const branch = await prisma.branch.findFirst({
    where: { id: session.branchId, isActive: true },
  });
  if (!branch) return null;

  return { branch };
}
