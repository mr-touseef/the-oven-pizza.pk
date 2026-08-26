"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Branch } from "@prisma/client";
import { useCart } from "@/context/CartContext";
import { formatRs } from "@/lib/types";
import { orderSchema } from "@/lib/validations";
import { PushNotificationButton } from '@/components/PushNotificationButton';

type OrderType = "DELIVERY" | "PICKUP";

type CheckoutFieldErrors = Partial<Record<"customerName" | "customerPhone" | "customerEmail" | "branchId" | "notes" | "lines" | "orderType" | "deliveryAddress", string>>;

export default function CartView({ branches, isAdmin }: { branches: Branch[]; isAdmin: boolean }) {
  const { lines, subtotal, incrementLine, decrementLine, removeLine, clearCart } = useCart();

  const [discountInput, setDiscountInput] = useState("");
  const [discountLoaded, setDiscountLoaded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState("");

  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "error">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutFieldErrors>({});
  const [orderConfirmation, setOrderConfirmation] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const res = await fetch("/api/settings/discount");
        if (res.ok) {
          const data = await res.json();
          setDiscountInput(String(data.discountPercent || 0));
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
      setDiscountInput("");
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(100, Math.max(0, num));
    setDiscountInput(String(clamped));

    if (isAdmin) {
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
  }

  const discountPercent = useMemo(() => {
    const n = Number(discountInput);
    if (!discountInput.trim() || Number.isNaN(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }, [discountInput]);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  const now = new Date();
  const receiptDate = now.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  const receiptTime = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCheckoutMessage(null);

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      branchId: branchId || undefined,
      orderType,
      deliveryAddress,
      notes,
      discountPercent,
      company,
      lines: lines.map((l) => ({
        kind: l.kind,
        itemId: l.itemId,
        name: l.name,
        sizeLabel: l.sizeLabel,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
    };

    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: CheckoutFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CheckoutFieldErrors;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setCheckoutErrors(nextErrors);
      setCheckoutStatus("error");
      setCheckoutMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setCheckoutStatus("loading");
    setCheckoutErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.fieldErrors) setCheckoutErrors(data.fieldErrors);
        setCheckoutStatus("error");
        setCheckoutMessage(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setOrderConfirmation({ id: data.order.id, total: data.order.total });
      clearCart();
      setCheckoutStatus("idle");
    } catch {
      setCheckoutStatus("error");
      setCheckoutMessage("We couldn't reach the server. Check your connection and try again.");
    }
  }

  if (orderConfirmation) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <span className="section-eyebrow">Order placed</span>
        <h1 className="mt-6 font-display text-3xl text-oven-cream sm:text-4xl">
          Thanks - we have your order!
        </h1>
        <p className="mt-3 max-w-md text-oven-cream/70">
          Order <span className="font-mono text-oven-crust">#{orderConfirmation.id.slice(-8)}</span> for <span className="font-mono text-oven-crust">{formatRs(orderConfirmation.total)}</span> has been received. We will call you shortly to confirm.
        </p>
        <PushNotificationButton branchId={branchId || ''} orderId={orderConfirmation.id} />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/#pizzas" className="rounded-full bg-flame-gradient px-7 py-3.5 text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02]">
            Order Something Else
          </Link>
          <button type="button" onClick={() => setOrderConfirmation(null)} className="rounded-full border border-oven-cream/25 px-7 py-3.5 text-base font-semibold text-oven-cream hover:bg-oven-cream/10">
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <span className="section-eyebrow">Your cart</span>
        <h1 className="mt-6 font-display text-3xl text-oven-cream sm:text-4xl">Your cart is empty</h1>
        <p className="mt-3 max-w-md text-oven-cream/70">Browse the menu and add a few things - pizzas, burgers, shawarma, drinks or a student deal - and they will show up here.</p>
        <Link href="/#pizzas" className="mt-8 rounded-full bg-flame-gradient px-7 py-3.5 text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02]">
          Browse the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16 sm:py-20">
      <div className="no-print">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow">Your cart</span>
            <h1 className="mt-4 font-display text-3xl text-oven-cream sm:text-4xl">
              {lines.reduce((n, l) => n + l.quantity, 0)} item{lines.reduce((n, l) => n + l.quantity, 0) === 1 ? "" : "s"} in your cart
            </h1>
          </div>
          <button type="button" onClick={clearCart} className="text-sm font-medium text-oven-cream/50 underline-offset-4 hover:text-red-400 hover:underline">
            Clear cart
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/50 shadow-card">
          <ul className="divide-y divide-oven-cream/10">
            {lines.map((line) => (
              <li key={line.lineId} className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
                <div className="min-w-[10rem] flex-1">
                  <p className="font-display text-lg text-oven-cream">{line.name}</p>
                  <p className="mt-0.5 text-sm text-oven-cream/50">
                    {line.sizeLabel ? `${line.sizeLabel} - ` : ""}
                    {formatRs(line.unitPrice)} each{line.categoryName ? ` - ${line.categoryName}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => decrementLine(line.lineId)} aria-label={`Decrease quantity of ${line.name}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-oven-cream/20 text-oven-cream hover:border-oven-flame-light hover:text-oven-flame-light">
                    -
                  </button>
                  <span className="w-6 text-center font-mono text-oven-cream" aria-live="polite">
                    {line.quantity}
                  </span>
                  <button type="button" onClick={() => incrementLine(line.lineId)} aria-label={`Increase quantity of ${line.name}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-oven-cream/20 text-oven-cream hover:border-oven-flame-light hover:text-oven-flame-light">
                    +
                  </button>
                </div>

                <p className="w-24 shrink-0 text-right font-mono text-lg text-oven-crust">
                  {formatRs(line.unitPrice * line.quantity)}
                </p>

                <button type="button" onClick={() => removeLine(line.lineId)} aria-label={`Remove ${line.name} from cart`} className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-oven-cream/40 hover:bg-red-500/10 hover:text-red-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 ml-auto max-w-sm rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/50 p-6 shadow-card">
          <div className="flex items-center justify-between text-oven-cream/80">
            <span>Subtotal</span>
            <span className="font-mono">{formatRs(subtotal)}</span>
          </div>

          {isAdmin && (
            <div className="mt-4">
              <label htmlFor="discount" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                Discount (%) <span className="text-oven-cream/50">- admin only</span>
              </label>
              <input id="discount" type="number" inputMode="decimal" min={0} max={100} step="1" value={discountInput} onChange={(e) => handleDiscountChange(e.target.value)} placeholder="0" className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light" />
            </div>
          )}

          {discountPercent > 0 && (
            <div className="mt-3 space-y-2 rounded-lg bg-oven-flame/10 p-3 border border-oven-flame/25">
              <div className="flex items-center justify-between text-sm text-oven-flame-light">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-mono font-semibold">- {formatRs(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-emerald-400">
                <span>You save</span>
                <span className="font-mono font-semibold">{formatRs(discountAmount)}</span>
              </div>
            </div>
          )}

          <div className={`mt-4 flex items-center justify-between border-t border-oven-cream/10 pt-4 text-lg font-semibold ${discountPercent > 0 ? "text-emerald-400" : "text-oven-cream"}`}>
            <span>Total</span>
            <span className="font-mono">{formatRs(total)}</span>
          </div>

          {isAdmin && (
            <button type="button" onClick={() => window.print()} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-flame-gradient px-6 py-3 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.01]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              Print Receipt
            </button>
          )}
        </div>

        <div className="mt-8 ml-auto max-w-sm rounded-xl2 border border-oven-flame/25 bg-oven-teal-deep/50 p-6 shadow-card">
          <h2 className="font-display text-xl text-oven-crust">Place Order</h2>
          <p className="mt-1 text-sm text-oven-cream/60">We will call you to confirm before preparing your order.</p>

          <form onSubmit={handlePlaceOrder} noValidate className="mt-5 space-y-4">
            <div className="hidden" aria-hidden="true">
              <label htmlFor="checkout-company">Company</label>
              <input id="checkout-company" type="text" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-oven-cream/85">Order type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    orderType === "DELIVERY"
                      ? "border-oven-flame bg-oven-flame/15 text-oven-flame-light"
                      : "border-oven-cream/15 text-oven-cream/70 hover:border-oven-cream/30"
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("PICKUP")}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    orderType === "PICKUP"
                      ? "border-oven-flame bg-oven-flame/15 text-oven-flame-light"
                      : "border-oven-cream/15 text-oven-cream/70 hover:border-oven-cream/30"
                  }`}
                >
                  Pickup
                </button>
              </div>
              {checkoutErrors.orderType ? <p className="mt-1.5 text-sm text-red-400">{checkoutErrors.orderType}</p> : null}
            </div>

            <p className="mt-2 text-xs text-oven-cream/50">
              {orderType === "DELIVERY"
                ? "Delivery usually takes 30–45 minutes, depending on your area and how busy the branch is."
                : "Pickup orders are usually ready in 20–30 minutes."}
            </p>

            {orderType === "DELIVERY" ? (
              <div>
                <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                  Delivery address
                </label>
                <textarea
                  id="checkout-address"
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  aria-invalid={Boolean(checkoutErrors.deliveryAddress)}
                  className="w-full resize-y rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
                  placeholder="House #, street, area, nearest landmark"
                />
                {checkoutErrors.deliveryAddress ? <p className="mt-1.5 text-sm text-red-400">{checkoutErrors.deliveryAddress}</p> : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                Full name
              </label>
              <input id="checkout-name" type="text" autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} aria-invalid={Boolean(checkoutErrors.customerName)} className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light" placeholder="Ali Raza" />
              {checkoutErrors.customerName ? <p className="mt-1.5 text-sm text-red-400">{checkoutErrors.customerName}</p> : null}
            </div>

            <div>
              <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                Phone number
              </label>
              <input id="checkout-phone" type="tel" autoComplete="tel" inputMode="numeric" maxLength={11} value={customerPhone} onChange={(e) => { const digits = e.target.value.replace(/\D/g, ''); if (digits.length <= 11) setCustomerPhone(digits); }} aria-invalid={Boolean(checkoutErrors.customerPhone)} className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light" placeholder="0300-1234567" />
              {checkoutErrors.customerPhone ? <p className="mt-1.5 text-sm text-red-400">{checkoutErrors.customerPhone}</p> : null}
            </div>

            <div>
              <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                Email <span className="text-oven-cream/40">(optional)</span>
              </label>
              <input id="checkout-email" type="email" autoComplete="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} aria-invalid={Boolean(checkoutErrors.customerEmail)} className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light" placeholder="you@example.com" />
              {checkoutErrors.customerEmail ? <p className="mt-1.5 text-sm text-red-400">{checkoutErrors.customerEmail}</p> : null}
            </div>

            {branches.length > 0 ? (
              <div>
                <label htmlFor="checkout-branch" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                  Branch <span className="text-oven-cream/40">(optional)</span>
                </label>
                <select id="checkout-branch" value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream focus:border-oven-flame-light">
                  <option value="">No preference - call to confirm</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="checkout-notes" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
                Notes <span className="text-oven-cream/40">(optional)</span>
              </label>
              <textarea id="checkout-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full resize-y rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light" placeholder="Gate code, extra spicy, no onions..." />
            </div>

            <button type="submit" disabled={checkoutStatus === "loading"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-flame-gradient px-6 py-3 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
              {checkoutStatus === "loading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-oven-charcoal/40 border-t-oven-charcoal" aria-hidden="true" />
                  Placing order...
                </>
              ) : (
                `Place Order - ${formatRs(total)}`
              )}
            </button>

            <div role="status" aria-live="polite">
              {checkoutMessage ? <p className={`text-sm ${checkoutStatus === "error" ? "text-red-400" : "text-oven-cream/70"}`}>{checkoutMessage}</p> : null}
            </div>
          </form>
        </div>
      </div>

      <div className="receipt-print hidden">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <p style={{ fontWeight: 700, fontSize: "18px" }}>THE OVEN PIZZA</p>
          <p style={{ fontSize: "12px" }}>Zahid Iqbal Chowk, Chichawatni</p>
          <p style={{ fontSize: "12px" }}>
            {receiptDate} - {receiptTime}
          </p>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #111" }}>
              <th style={{ textAlign: "left", padding: "4px 0" }}>Item</th>
              <th style={{ textAlign: "center", padding: "4px 0" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "4px 0" }}>Price</th>
              <th style={{ textAlign: "right", padding: "4px 0" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.lineId} style={{ borderBottom: "1px dotted #999" }}>
                <td style={{ padding: "4px 0" }}>
                  {line.name}
                  {line.sizeLabel ? ` (${line.sizeLabel})` : ""}
                </td>
                <td style={{ textAlign: "center", padding: "4px 0" }}>{line.quantity}</td>
                <td style={{ textAlign: "right", padding: "4px 0" }}>{formatRs(line.unitPrice)}</td>
                <td style={{ textAlign: "right", padding: "4px 0" }}>
                  {formatRs(line.unitPrice * line.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "16px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{formatRs(subtotal)}</span>
          </div>
          {discountPercent > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80" }}>
                <span>Discount ({discountPercent}%)</span>
                <span>- {formatRs(discountAmount)}</span>
              </div>
            </>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #111", marginTop: "8px", paddingTop: "8px", fontWeight: 700, fontSize: "15px" }}>
            <span>Total</span>
            <span>{formatRs(total)}</span>
          </div>
        </div>

        {branchId && (
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <PushNotificationButton branchId={branchId} />
          </div>
        )}
        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "12px" }}>
          Thank you for ordering from The Oven Pizza!
        </p>
      </div>
    </div>
  );
}
