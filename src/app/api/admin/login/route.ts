import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Slow down brute-force attempts against a branch's password.
  if (isRateLimited(`admin-login:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Too many login attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as { username?: unknown; password?: unknown };

  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return NextResponse.json({ message: "Enter your username and password." }, { status: 400 });
  }

  const branch = await prisma.branch.findFirst({
    where: { adminUsername: username.trim(), isActive: true },
  });

  if (!branch || !verifyPassword(password, branch.passwordHash)) {
    return NextResponse.json({ message: "Incorrect username or password." }, { status: 401 });
  }

  const token = createSessionToken(branch.id);
  const response = NextResponse.json({
    message: "Logged in.",
    branch: { id: branch.id, name: branch.name, slug: branch.slug },
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60, // 12 hours, matches SESSION_TTL_MS in lib/auth.ts
  });

  return response;
}
