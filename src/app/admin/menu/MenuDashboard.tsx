"use client";

import { useState } from "react";

type Price = { id: string; label: string; priceRs: number };
type Item = { id: string; name: string; prices: Price[] };
type Category = { id: string; name: string; items: Item[] };

export default function MenuDashboard({ categories }: { categories: Category[] }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    categories.forEach((cat) =>
      cat.items.forEach((item) =>
        item.prices.forEach((p) => {
          initial[p.id] = String(p.priceRs);
        })
      )
    );
    return initial;
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleSave(priceId: string) {
    const priceRs = Number(values[priceId]);
    if (!Number.isFinite(priceRs) || priceRs < 0) {
      setErrorId(priceId);
      return;
    }
    setSavingId(priceId);
    setErrorId(null);
    try {
      const res = await fetch(`/api/admin/menu/prices/${priceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceRs }),
      });
      if (!res.ok) throw new Error("Failed");
      setSavedId(priceId);
      setTimeout(() => setSavedId((cur) => (cur === priceId ? null : cur)), 1500);
    } catch {
      setErrorId(priceId);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-oven-crust">Menu Prices</h1>
      <p className="mt-1 text-sm text-oven-cream/60">
        Update prices below. Changes save instantly and appear on the live site right away.
      </p>

      <div className="mt-8 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id}>
            <h2 className="mb-3 text-lg font-semibold text-oven-cream">{cat.name}</h2>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/30 p-4"
                >
                  <p className="mb-2 font-medium text-oven-cream">{item.name}</p>
                  <div className="flex flex-wrap gap-3">
                    {item.prices.map((price) => (
                      <div key={price.id} className="flex items-center gap-2">
                        <span className="text-xs text-oven-cream/60">{price.label}</span>
                        <span className="text-xs text-oven-cream/40">Rs</span>
                        <input
                          type="number"
                          value={values[price.id] ?? ""}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [price.id]: e.target.value }))
                          }
                          className="w-24 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-1 text-sm text-oven-cream"
                        />
                        <button
                          onClick={() => handleSave(price.id)}
                          disabled={savingId === price.id}
                          className="rounded-lg bg-oven-crust px-3 py-1 text-xs font-semibold text-oven-charcoal disabled:opacity-50"
                        >
                          {savingId === price.id ? "Saving…" : "Save"}
                        </button>
                        {savedId === price.id && (
                          <span className="text-xs text-green-400">Saved ✓</span>
                        )}
                        {errorId === price.id && (
                          <span className="text-xs text-red-400">Error</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}