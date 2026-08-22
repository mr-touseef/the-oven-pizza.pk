import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const priceRs = Number(body.priceRs);

  if (!Number.isFinite(priceRs) || priceRs < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const updated = await prisma.menuItemPrice.update({
    where: { id: params.id },
    data: { priceRs },
  });

  return NextResponse.json({ success: true, price: updated });
}