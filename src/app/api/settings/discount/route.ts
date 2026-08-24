import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const SETTINGS_ID = "singleton";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    return NextResponse.json({ discountPercent: settings?.discountPercent ?? 0 });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json({ discountPercent: 0 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const { discountPercent } = (body ?? {}) as { discountPercent?: unknown };
  if (typeof discountPercent !== "number" || !Number.isFinite(discountPercent)) {
    return NextResponse.json({ message: "Invalid discount." }, { status: 400 });
  }

  const clamped = Math.min(100, Math.max(0, Math.round(discountPercent)));

  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { discountPercent: clamped },
      create: { id: SETTINGS_ID, discountPercent: clamped },
    });

    return NextResponse.json({ discountPercent: settings.discountPercent });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error saving discount:", error.code);
    } else {
      console.error("Unexpected error saving discount:", error);
    }
    return NextResponse.json({ message: "Couldn't save discount." }, { status: 500 });
  }
}
