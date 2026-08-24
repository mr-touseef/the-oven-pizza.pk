"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Branch, Order, OrderLine, OrderStatus } from "@prisma/client";
import { formatRs } from "@/lib/types";

type OrderWithLines = Order & { lines: OrderLine[] };

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-oven-flame-light/15 text-oven-flame-light",
  CONFIRMED: "bg-oven-teal/30 text-oven-cream",
  PREPARING: "bg-oven-flame/20 text-oven-flame-light",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

export default function OrdersDashboard({
  branch,
  initialOrders,
}: {
  branch: Branch;
  initialOrders: OrderWithLines[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [loggingOut, setLoggingOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [discount, setDiscount] = useState("");
  const [discountLoaded, setDiscountLoaded] = useState(false);

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const res = await fetch("/api/settings/discount");
        if (res.ok) {
          const data = await res.json();
          setDiscount(String(data.discountPercent || 0));
        }
      } catch (error) {
        console.error("Failed to fetch discount:", error);
      } finally {
        setDiscountLoaded(true);
      }
    }
    fetchDiscount();
  }, []);

  async function handleDiscountChange(value: string) {
    if (value === "") {
      setDiscount("");
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(100, Math.max(0, num));
    setDiscount(String(clamped));

    try {
      await fetch("/api/settings/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercent: clamped }),
      });
    } catch (error) {
      console.error("Failed to save discount:", error);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setOrders(previous);
    }
    setUpdatingId(null);
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col gap-4 border-b border-oven-cream/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Branch Admin</p>
          <h1 className="mt-1 font-display text-2xl text-oven-crust sm:text-3xl">{branch.name}</h1>
          <p className="mt-1 text-sm text-oven-cream/60">{branch.address}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-oven-cream/80">
            {branch.phone ? <span>{branch.phone}</span> : null}
            {branch.phone2 ? <span>{branch.phone2}</span> : null}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <label className="flex items-center gap-2 rounded-full border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2 text-sm text-oven-cream/80">
            <span className="whitespace-nowrap font-semibold">Discount (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0"
              className="w-16 rounded-md border border-oven-cream/15 bg-oven-charcoal/80 px-2 py-1 text-right font-mono text-oven-cream focus:border-oven-flame focus:outline-none"
            />
          </label>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-fit items-center gap-2 self-start rounded-full border border-oven-cream/15 px-5 py-2.5 text-sm font-semibold text-oven-cream/80 transition-colors hover:border-oven-flame hover:text-oven-flame-light disabled:opacity-60 sm:self-end"
          >
            {loggingOut ? "Signing out..." : "Log Out"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl text-oven-crust">
            Orders <span className="text-oven-cream/50">({orders.length})</span>
          </h2>
          <p className="text-xs text-oven-cream/50">Only orders placed for this branch are shown.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-10 text-center text-oven-cream/60">
            No orders for this branch yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-oven-cream">{order.customerName}</p>
                    <p className="font-mono text-sm text-oven-cream/60">{order.customerPhone}</p>
                    {order.customerEmail ? (
                      <p className="text-sm text-oven-cream/50">{order.customerEmail}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-oven-cream/40">
                      {new Date(order.createdAt).toLocaleString("en-PK")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-2.5 py-1.5 text-xs text-oven-cream focus:border-oven-flame focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-oven-cream/10 border-t border-oven-cream/10 pt-3">
                  {order.lines.map((line) => (
                    <li key={line.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                      <span className="text-oven-cream/80">
                        {line.quantity}x {line.name}
                        {line.sizeLabel ? ` (${line.sizeLabel})` : ""}
                      </span>
                      <span className="font-mono text-oven-cream/60">{formatRs(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                {order.notes ? (
                  <p className="mt-3 text-sm text-oven-cream/50">
                    <span className="font-semibold text-oven-cream/70">Notes: </span>
                    {order.notes}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-between border-t border-oven-cream/10 pt-3">
                  <span className="text-sm text-oven-cream/60">
                    Subtotal {formatRs(order.subtotal)}
                    {order.discountAmount > 0 ? ` - Discount ${formatRs(order.discountAmount)}` : ""}
                  </span>
                  <span className="font-mono text-base font-semibold text-oven-crust">
                    {formatRs(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
