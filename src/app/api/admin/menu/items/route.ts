import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { categoryId, name, description, badge, imageUrl, prices } = body;

  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!Array.isArray(prices) || prices.length === 0) {
    return NextResponse.json({ error: "At least one price is required" }, { status: 400 });
  }
  for (const p of prices) {
    if (!p.label || typeof p.label !== "string" || !p.label.trim()) {
      return NextResponse.json({ error: "Each price needs a label" }, { status: 400 });
    }
    const priceNum = Number(p.priceRs);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Each price must be a valid non-negative number" }, { status: 400 });
    }
  }

  const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const maxOrder = await prisma.menuItem.aggregate({
    where: { categoryId },
    _max: { displayOrder: true },
  });

  const item = await prisma.menuItem.create({
    data: {
      categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      badge: badge?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      prices: {
        create: prices.map((p: { label: string; priceRs: number }, idx: number) => ({
          label: p.label.trim(),
          priceRs: Number(p.priceRs),
          displayOrder: idx,
        })),
      },
    },
    include: { prices: { orderBy: { displayOrder: "asc" } } },
  });

  return NextResponse.json({ success: true, item });
}
