import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, description, priceRs, activeWindow, includedItems, isActive } = body;

  const data: Record<string, unknown> = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    data.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
    }
    data.description = description.trim();
  }
  if (priceRs !== undefined) {
    const priceNum = Number(priceRs);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Price must be a valid non-negative number" }, { status: 400 });
    }
    data.priceRs = priceNum;
  }
  if (activeWindow !== undefined) {
    data.activeWindow = typeof activeWindow === "string" && activeWindow.trim() ? activeWindow.trim() : null;
  }
  if (includedItems !== undefined) {
    data.includedItems = Array.isArray(includedItems)
      ? includedItems.filter((s: unknown) => typeof s === "string" && s.trim()).map((s: string) => s.trim())
      : [];
  }
  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  }

  const deal = await prisma.deal.update({ where: { id }, data });

  return NextResponse.json({ success: true, deal });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.deal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
