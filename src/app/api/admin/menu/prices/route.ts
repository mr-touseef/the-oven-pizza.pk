import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { menuItemId, label, priceRs } = body;

  if (!menuItemId || typeof menuItemId !== "string") {
    return NextResponse.json({ error: "menuItemId is required" }, { status: 400 });
  }
  if (!label || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }
  const priceNum = Number(priceRs);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const maxOrder = await prisma.menuItemPrice.aggregate({
    where: { menuItemId },
    _max: { displayOrder: true },
  });

  const price = await prisma.menuItemPrice.create({
    data: {
      menuItemId,
      label: label.trim(),
      priceRs: priceNum,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ success: true, price });
}
