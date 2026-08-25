"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      <div className="flex flex-col gap-4 border-b border-oven-cream/10 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Branch Admin</p>
          <h1 className="mt-1 font-display text-2xl text-oven-crust">{branch.name}</h1>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl text-oven-crust mb-4">Orders ({orders.length})</h2>

        {orders.length === 0 ? (
          <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-10 text-center text-oven-cream/60">
            No orders.
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-oven-cream">{order.customerName}</p>
                    <p className="text-xs text-oven-cream/40 mt-1">
                      {new Date(order.createdAt).toLocaleString("en-PK")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-2.5 py-1.5 text-xs text-oven-cream"
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
                    <li key={line.id} className="flex justify-between py-1.5 text-sm">
                      <span>{line.quantity}x {line.name}</span>
                      <span>{formatRs(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex justify-between border-t border-oven-cream/10 pt-3 font-semibold">
                  <span>Total</span>
                  <span className="text-oven-crust">{formatRs(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
