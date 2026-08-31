import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, priceRs, activeWindow, includedItems, isActive } = body;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  const priceNum = Number(priceRs);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Price must be a valid non-negative number" }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      priceRs: priceNum,
      activeWindow: typeof activeWindow === "string" && activeWindow.trim() ? activeWindow.trim() : null,
      includedItems: Array.isArray(includedItems)
        ? includedItems.filter((s: unknown) => typeof s === "string" && s.trim()).map((s: string) => s.trim())
        : [],
      isActive: isActive === undefined ? true : Boolean(isActive),
    },
  });

  return NextResponse.json({ success: true, deal });
}
