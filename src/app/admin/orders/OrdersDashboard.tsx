"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Branch, Order, OrderLine, OrderStatus } from "@prisma/client";
import { formatRs } from "@/lib/types";
import { PushNotificationButton } from "@/components/PushNotificationButton";

type OrderWithLines = Order & { lines: OrderLine[] };

type HistoryOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  customerName: string;
};

type HistoryData = {
  since: string;
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  orders: HistoryOrder[];
};

type SalesData = {
  from: string;
  to: string;
  totalSales: number;
  orderCount: number;
};

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-oven-flame-light/15 text-oven-flame-light",
  CONFIRMED: "bg-oven-teal/30 text-oven-cream",
  PREPARING: "bg-oven-flame/20 text-oven-flame-light",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

function printReceipt(order: OrderWithLines, branch: Branch) {
  const receiptWindow = window.open("", "_blank", "width=380,height=600");
  if (!receiptWindow) return;

  const linesHtml = order.lines
    .map(
      (l) =>
        `<div style="display:flex;justify-content:space-between;font-size:12px;margin:3px 0;"><span>${l.quantity}x ${l.name}${l.sizeLabel ? ` (${l.sizeLabel})` : ""}</span><span>${formatRs(l.lineTotal)}</span></div>`
    )
    .join("");

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${order.customerName}</title>
        <style>
          body { font-family: monospace; padding: 16px; width: 280px; color: #000; }
          h2 { text-align: center; margin: 0 0 4px 0; font-size: 16px; }
          p { margin: 2px 0; font-size: 12px; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          .total { font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; margin-top: 4px; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2>${branch.name}</h2>
        <p class="center">${branch.address}</p>
        <hr />
        <p>Order #${order.id.slice(-6).toUpperCase()}</p>
        <p>${new Date(order.createdAt).toLocaleString("en-PK")}</p>
        <p>Customer: ${order.customerName}</p>
        <p>Phone: ${order.customerPhone}</p>
        ${order.isAdminOrder ? "<p>(Admin-placed order)</p>" : ""}
        <hr />
        ${linesHtml}
        <hr />
        <p>Subtotal: ${formatRs(order.subtotal)}</p>
        ${order.discountAmount > 0 ? `<p>Discount: -${formatRs(order.discountAmount)}</p>` : ""}
        <div class="total"><span>Total</span><span>${formatRs(order.total)}</span></div>
        <hr />
        <p class="center">Thank you for your order!</p>
      </body>
    </html>
  `);
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
}

function todayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OrdersDashboard({
  branch,
  initialOrders,
}: {
  branch: Branch;
  initialOrders: OrderWithLines[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "history" | "sales">("orders");
  const [orders, setOrders] = useState(initialOrders);
  const [loggingOut, setLoggingOut] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (dateFilter) {
      const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
      if (orderDate !== dateFilter) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const knownOrderIds = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));
  const [discount, setDiscount] = useState("");
  const [discountLoaded, setDiscountLoaded] = useState(false);
  const [discountSaving, setDiscountSaving] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryData | null>(null);
  const [historyStatus, setHistoryStatus] = useState<"idle" | "loading" | "error">("idle");

  const [todaySales, setTodaySales] = useState<SalesData | null>(null);
  const [todaySalesStatus, setTodaySalesStatus] = useState<"idle" | "loading" | "error">("idle");

  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState("");
  const [rangeSales, setRangeSales] = useState<SalesData | null>(null);
  const [rangeStatus, setRangeStatus] = useState<"idle" | "loading" | "error">("idle");
  const [rangeError, setRangeError] = useState<string | null>(null);

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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;
        const data = await res.json();
        const freshOrders: OrderWithLines[] = data.orders ?? [];

        const newOnes = freshOrders.filter((o) => !knownOrderIds.current.has(o.id));
        if (newOnes.length > 0) {
          newOnes.forEach((o) => knownOrderIds.current.add(o.id));
          setOrders(freshOrders);
          const latest = newOnes[0];
          if (!latest) return;
          setToast(`New order from ${latest.customerName} - ${formatRs(latest.total)}`);
          setTimeout(() => setToast(null), 6000);
        }
      } catch (error) {
        console.error("Failed to poll orders:", error);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== "history" || history || historyStatus === "loading") return;

    async function fetchHistory() {
      setHistoryStatus("loading");
      try {
        const res = await fetch("/api/admin/history");
        if (!res.ok) {
          setHistoryStatus("error");
          return;
        }
        const data = await res.json();
        setHistory(data);
        setHistoryStatus("idle");
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setHistoryStatus("error");
      }
    }
    fetchHistory();
  }, [activeTab, history, historyStatus]);

  useEffect(() => {
    if (activeTab !== "sales" || todaySales || todaySalesStatus === "loading") return;

    async function fetchTodaySales() {
      setTodaySalesStatus("loading");
      try {
        const today = todayIso();
        const res = await fetch(`/api/admin/sales?from=${today}&to=${today}`);
        if (!res.ok) {
          setTodaySalesStatus("error");
          return;
        }
        const data = await res.json();
        setTodaySales(data);
        setTodaySalesStatus("idle");
      } catch (error) {
        console.error("Failed to fetch today's sales:", error);
        setTodaySalesStatus("error");
      }
    }
    fetchTodaySales();
  }, [activeTab, todaySales, todaySalesStatus]);

  async function handleCalculateRange() {
    if (!fromDate) {
      setRangeError("Pick a start date.");
      return;
    }
    setRangeError(null);
    setRangeStatus("loading");
    try {
      const params = new URLSearchParams({ from: fromDate });
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/sales?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setRangeError(data?.message || "Couldn&apos;t calculate sales.");
        setRangeStatus("error");
        return;
      }
      setRangeSales(data);
      setRangeStatus("idle");
    } catch (error) {
      console.error("Failed to fetch range sales:", error);
      setRangeError("Couldn&apos;t reach the server.");
      setRangeStatus("error");
    }
  }

  async function handleDiscountChange(value: string) {
    if (value === "") {
      setDiscount("");
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(100, Math.max(0, num));
    setDiscount(String(clamped));
    setDiscountError(null);
    setDiscountSaving(true);

    try {
      const res = await fetch("/api/settings/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercent: clamped }),
      });
      if (!res.ok) {
        setDiscountError("Couldn&apos;t save discount.");
      }
    } catch (error) {
      console.error("Failed to save discount:", error);
      setDiscountError("Couldn&apos;t save discount.");
    } finally {
      setDiscountSaving(false);
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
      {toast ? (
        <div className="fixed right-4 top-4 z-50 max-w-xs rounded-xl2 border border-oven-flame/40 bg-oven-charcoal px-5 py-4 text-sm text-oven-cream shadow-ember">
          {toast}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 border-b border-oven-cream/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Branch Admin</p>
          <h1 className="mt-1 font-display text-2xl text-oven-crust sm:text-3xl">{branch.name}</h1>
          <p className="mt-1 text-sm text-oven-cream/60">{branch.address}</p>
          <div className="mt-3">
            <PushNotificationButton branchId={branch.id} role="ADMIN" />
          </div>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-oven-cream/80">
            {branch.phone ? <span>{branch.phone}</span> : null}
            {branch.phone2 ? <span>{branch.phone2}</span> : null}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <label className="flex items-center gap-2 rounded-full border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2 text-sm text-oven-cream/80">
            <span className="whitespace-nowrap font-semibold">Discount (%)</span>
            {discountLoaded ? (
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0"
                className="w-16 rounded-md border border-oven-cream/15 bg-oven-charcoal/80 px-2 py-1 text-right font-mono text-oven-cream focus:border-oven-flame focus:outline-none"
              />
            ) : (
              <span className="h-6 w-16 animate-pulse rounded-md bg-oven-charcoal/60" />
            )}
          </label>
          {discountError ? <p className="text-xs text-red-400">{discountError}</p> : null}
          {discountSaving ? <p className="text-xs text-oven-cream/40">Saving...</p> : null}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-fit items-center gap-2 self-start rounded-full border border-oven-cream/15 px-5 py-2.5 text-sm font-semibold text-oven-cream/80 transition-colors hover:border-oven-flame hover:text-oven-flame-light disabled:opacity-60 sm:self-end"
          >
            {loggingOut ? "Signing out..." : "Log Out"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-oven-cream/10">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "orders"
              ? "border-b-2 border-oven-flame text-oven-crust"
              : "text-oven-cream/50 hover:text-oven-cream/80"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-oven-flame text-oven-crust"
              : "text-oven-cream/50 hover:text-oven-cream/80"
          }`}
        >
          History (60 days)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "sales"
              ? "border-b-2 border-oven-flame text-oven-crust"
              : "text-oven-cream/50 hover:text-oven-cream/80"
          }`}
        >
          Sales
        </button>
      </div>

      {activeTab === "orders" ? (
        <div className="mt-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl text-oven-crust">
              Orders <span className="text-oven-cream/50">({filteredOrders.length})</span>
            </h2>
            <p className="text-xs text-oven-cream/50">Only orders placed for this branch are shown.</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | "ALL"); setCurrentPage(1); }}
              className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-2 text-sm text-oven-cream focus:border-oven-flame focus:outline-none"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-2 text-sm text-oven-cream focus:border-oven-flame focus:outline-none"
            />
            {(statusFilter !== "ALL" || dateFilter) ? (
              <button
                type="button"
                onClick={() => { setStatusFilter("ALL"); setDateFilter(""); setCurrentPage(1); }}
                className="text-xs text-oven-cream/50 underline hover:text-oven-cream"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-10 text-center text-oven-cream/60">
              No orders for this branch yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {paginatedOrders.map((order) => (
                <li key={order.id} className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-oven-cream">{order.customerName}</p>
                        {order.isAdminOrder ? (
                          <span className="mt-1 inline-block rounded-full bg-oven-flame/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-oven-flame-light">
                            Admin Order
                          </span>
                        ) : null}
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

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => printReceipt(order, branch)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-1.5 text-xs font-semibold text-oven-cream/80 transition-colors hover:border-oven-flame hover:text-oven-flame-light"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Print Receipt
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {filteredOrders.length > ORDERS_PER_PAGE ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-1.5 text-xs text-oven-cream disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-oven-cream/60">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-1.5 text-xs text-oven-cream disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <div className="mt-8">
          {historyStatus === "loading" ? (
            <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-10 text-center text-oven-cream/60">
              Loading history...
            </div>
          ) : historyStatus === "error" ? (
            <div className="rounded-xl2 border border-red-500/25 bg-red-500/5 p-10 text-center text-red-300">
              Couldn&apos;t load history. Try switching tabs again.
            </div>
          ) : history ? (
            <>
              <p className="mb-4 text-xs text-oven-cream/50">
                Since {new Date(history.since).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Total Orders</p>
                  <p className="mt-2 font-display text-3xl text-oven-crust">{history.total}</p>
                </div>
                <div className="rounded-xl2 border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/70">Accepted</p>
                  <p className="mt-2 font-display text-3xl text-emerald-300">{history.accepted}</p>
                </div>
                <div className="rounded-xl2 border border-red-500/20 bg-red-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-300/70">Rejected</p>
                  <p className="mt-2 font-display text-3xl text-red-300">{history.rejected}</p>
                </div>
                <div className="rounded-xl2 border border-oven-flame-light/20 bg-oven-flame/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-oven-flame-light/80">Pending</p>
                  <p className="mt-2 font-display text-3xl text-oven-flame-light">{history.pending}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="mb-4 font-display text-xl text-oven-crust">
                  All orders <span className="text-oven-cream/50">({history.orders.length})</span>
                </h2>

                {history.orders.length === 0 ? (
                  <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-10 text-center text-oven-cream/60">
                    No orders in the last 30 days.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-oven-cream/10 text-left text-xs uppercase tracking-wide text-oven-cream/50">
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Customer</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-oven-cream/10">
                        {history.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="px-4 py-3 text-oven-cream/70">
                              {new Date(o.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                            </td>
                            <td className="px-4 py-3 text-oven-cream">{o.customerName}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-oven-crust">{formatRs(o.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {activeTab === "sales" ? (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="mb-4 font-display text-xl text-oven-crust">Today&apos;s Sales</h2>
            {todaySalesStatus === "loading" ? (
              <div className="h-24 w-full max-w-xs animate-pulse rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40" />
            ) : todaySalesStatus === "error" ? (
              <div className="rounded-xl2 border border-red-500/25 bg-red-500/5 p-6 text-center text-red-300">
                Couldn&apos;t load today&apos;s sales.
              </div>
            ) : todaySales ? (
              <div className="grid max-w-md grid-cols-2 gap-4">
                <div className="rounded-xl2 border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/70">Total Sales</p>
                  <p className="mt-2 font-display text-3xl text-emerald-300">{formatRs(todaySales.totalSales)}</p>
                </div>
                <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Accepted Orders</p>
                  <p className="mt-2 font-display text-3xl text-oven-crust">{todaySales.orderCount}</p>
                </div>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-oven-cream/40">Only counts orders that are Confirmed, Preparing, or Completed.</p>
          </div>

          <div className="border-t border-oven-cream/10 pt-8">
            <h2 className="mb-1 font-display text-xl text-oven-crust">Custom Range</h2>
            <p className="mb-4 text-xs text-oven-cream/50">
              Pick a start date to see total accepted sales from that date onward. Add an end date to narrow it further.
            </p>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="sales-from" className="mb-1.5 block text-xs font-medium text-oven-cream/70">
                  From
                </label>
                <input
                  id="sales-from"
                  type="date"
                  value={fromDate}
                  max={todayIso()}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-2 text-sm text-oven-cream focus:border-oven-flame-light"
                />
              </div>
              <div>
                <label htmlFor="sales-to" className="mb-1.5 block text-xs font-medium text-oven-cream/70">
                  To <span className="text-oven-cream/40">(optional - defaults to today)</span>
                </label>
                <input
                  id="sales-to"
                  type="date"
                  value={toDate}
                  max={todayIso()}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3 py-2 text-sm text-oven-cream focus:border-oven-flame-light"
                />
              </div>
              <button
                type="button"
                onClick={handleCalculateRange}
                disabled={rangeStatus === "loading"}
                className="rounded-full bg-flame-gradient px-6 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rangeStatus === "loading" ? "Calculating..." : "Calculate"}
              </button>
            </div>

            {rangeError ? <p className="mt-3 text-sm text-red-400">{rangeError}</p> : null}

            {rangeSales ? (
              <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
                <div className="rounded-xl2 border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/70">Total Sales</p>
                  <p className="mt-2 font-display text-3xl text-emerald-300">{formatRs(rangeSales.totalSales)}</p>
                </div>
                <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-oven-cream/50">Accepted Orders</p>
                  <p className="mt-2 font-display text-3xl text-oven-crust">{rangeSales.orderCount}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
