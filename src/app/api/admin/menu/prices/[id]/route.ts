import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    where: { id: id },
    data: { priceRs },
  });
  return NextResponse.json({ success: true, price: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const price = await prisma.menuItemPrice.findUnique({ where: { id: id } });
  if (!price) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const count = await prisma.menuItemPrice.count({ where: { menuItemId: price.menuItemId } });
  if (count <= 1) {
    return NextResponse.json({ error: "Item must have at least one price" }, { status: 400 });
  }

  await prisma.menuItemPrice.delete({ where: { id: id } });
  return NextResponse.json({ success: true });
}
