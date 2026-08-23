import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(`orders:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { message: "Please check the form for errors.", fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn to avoid the field.
  if (data.company) {
    return NextResponse.json({ message: "Order received." }, { status: 200 });
  }

  const menuItemIds = [...new Set(data.lines.filter((l) => l.kind === "menu").map((l) => l.itemId))];
  const dealIds = [...new Set(data.lines.filter((l) => l.kind === "deal").map((l) => l.itemId))];

  try {
    const [menuItems, deals, branch] = await Promise.all([
      menuItemIds.length
        ? prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
            include: { prices: true },
          })
        : Promise.resolve([]),
      dealIds.length
        ? prisma.deal.findMany({ where: { id: { in: dealIds } } })
        : Promise.resolve([]),
      data.branchId
        ? prisma.branch.findFirst({ where: { id: data.branchId, isActive: true } })
        : Promise.resolve(null),
    ]);

    if (data.branchId && !branch) {
      return NextResponse.json(
        { message: "Selected branch is not available. Please choose another." },
        { status: 400 }
      );
    }

    const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));
    const dealMap = new Map(deals.map((d) => [d.id, d]));

    type ResolvedLine = {
      kind: string;
      refId: string;
      name: string;
      sizeLabel: string | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    };

    const resolvedLines: ResolvedLine[] = [];

    for (const line of data.lines) {
      if (line.kind === "menu") {
        const item = menuItemMap.get(line.itemId);
        if (!item || !item.isAvailable) {
          return NextResponse.json(
            { message: `"${line.name}" is no longer available. Please remove it from your cart.` },
            { status: 400 }
          );
        }
        const price = line.sizeLabel
          ? item.prices.find((p) => p.label === line.sizeLabel)
          : item.prices.length === 1
            ? item.prices[0]
            : undefined;

        if (!price) {
          return NextResponse.json(
            { message: `"${item.name}" (${line.sizeLabel ?? "default size"}) is no longer available at that size.` },
            { status: 400 }
          );
        }

        resolvedLines.push({
          kind: "menu",
          refId: item.id,
          name: item.name,
          sizeLabel: line.sizeLabel ?? null,
          unitPrice: price.priceRs,
          quantity: line.quantity,
          lineTotal: price.priceRs * line.quantity,
        });
      } else {
        const deal = dealMap.get(line.itemId);
        if (!deal || !deal.isActive) {
          return NextResponse.json(
            { message: `"${line.name}" is no longer available. Please remove it from your cart.` },
            { status: 400 }
          );
        }
        resolvedLines.push({
          kind: "deal",
          refId: deal.id,
          name: deal.title,
          sizeLabel: null,
          unitPrice: deal.priceRs,
          quantity: line.quantity,
          lineTotal: deal.priceRs * line.quantity,
        });
      }
    }

    // Only a logged-in branch admin (seller) is allowed to apply a discount.
    // Regular customers can never influence this from the client — even if
    // they tamper with the request body, it's ignored here.
    const adminSession = await getAdminSession();
    const discountPercent = adminSession ? data.discountPercent : 0;

    const subtotal = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount;

    const order = await prisma.order.create({
      data: {
        branchId: branch?.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        notes: data.notes,
        subtotal,
        discountPercent,
        discountAmount,
        total,
        lines: { create: resolvedLines },
      },
      select: { id: true, subtotal: true, discountAmount: true, total: true },
    });

    return NextResponse.json(
      {
        message: "Order received — we'll call you shortly to confirm.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error creating order:", error.code);
    } else {
      console.error("Unexpected error creating order:", error);
    }
    return NextResponse.json(
      { message: "We couldn't place your order right now. Please call us directly instead." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed." }, { status: 405 });
}