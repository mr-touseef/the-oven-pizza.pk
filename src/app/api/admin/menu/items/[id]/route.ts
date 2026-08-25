import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: Record<string, string | boolean | null> = {};

  if (typeof body.name === "string") {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    data.name = body.name.trim();
  }
  if (typeof body.description === "string" || body.description === null) {
    data.description = body.description?.trim() || null;
  }
  if (typeof body.badge === "string" || body.badge === null) {
    data.badge = body.badge?.trim() || null;
  }
  if (typeof body.imageUrl === "string" || body.imageUrl === null) {
    data.imageUrl = body.imageUrl?.trim() || null;
  }
  if (typeof body.isAvailable === "boolean") {
    data.isAvailable = body.isAvailable;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.menuItem.update({
    where: { id: params.id },
    data,
    include: { prices: { orderBy: { displayOrder: "asc" } } },
  });

  return NextResponse.json({ success: true, item: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.menuItem.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
