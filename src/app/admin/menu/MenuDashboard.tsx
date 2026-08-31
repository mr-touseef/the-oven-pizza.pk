"use client";

import { useState } from "react";

type Price = { id: string; label: string; priceRs: number };
type Item = {
  id: string;
  name: string;
  description: string | null;
  badge: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  prices: Price[];
};
type Category = { id: string; name: string; items: Item[] };

type Deal = {
  id: string;
  title: string;
  description: string;
  priceRs: number;
  activeWindow: string | null;
  includedItems: string[];
  isActive: boolean;
};

type NewPriceRow = { label: string; priceRs: string };

export default function MenuDashboard({
  categories: initialCategories,
  deals: initialDeals,
}: {
  categories: Category[];
  deals: Deal[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);

  // ── Deals state ──────────────────────────────────────────────
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealEditFields, setDealEditFields] = useState<{
    title: string;
    description: string;
    priceRs: string;
    activeWindow: string;
    includedItems: string;
  }>({ title: "", description: "", priceRs: "", activeWindow: "", includedItems: "" });
  const [dealEditSaving, setDealEditSaving] = useState(false);
  const [dealEditError, setDealEditError] = useState<string | null>(null);
  const [dealTogglingId, setDealTogglingId] = useState<string | null>(null);
  const [dealDeletingId, setDealDeletingId] = useState<string | null>(null);

  const [showNewDealForm, setShowNewDealForm] = useState(false);
  const [newDeal, setNewDeal] = useState<{
    title: string;
    description: string;
    priceRs: string;
    activeWindow: string;
    includedItems: string;
  }>({ title: "", description: "", priceRs: "", activeWindow: "", includedItems: "" });
  const [newDealCreating, setNewDealCreating] = useState(false);
  const [newDealError, setNewDealError] = useState<string | null>(null);

  function startEditDeal(deal: Deal) {
    setEditingDealId(deal.id);
    setDealEditFields({
      title: deal.title,
      description: deal.description,
      priceRs: String(deal.priceRs),
      activeWindow: deal.activeWindow || "",
      includedItems: deal.includedItems.join(", "),
    });
    setDealEditError(null);
  }

  function cancelEditDeal() {
    setEditingDealId(null);
    setDealEditError(null);
  }

  async function saveDealEdit(dealId: string) {
    if (!dealEditFields.title.trim()) {
      setDealEditError("Title is required");
      return;
    }
    if (!dealEditFields.description.trim()) {
      setDealEditError("Description is required");
      return;
    }
    const priceNum = Number(dealEditFields.priceRs);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setDealEditError("Enter a valid price");
      return;
    }
    setDealEditSaving(true);
    setDealEditError(null);
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dealEditFields.title,
          description: dealEditFields.description,
          priceRs: priceNum,
          activeWindow: dealEditFields.activeWindow || null,
          includedItems: dealEditFields.includedItems
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDealEditError(data?.error || "Failed to save");
        return;
      }
      setDeals((prev) => prev.map((d) => (d.id === dealId ? data.deal : d)));
      setEditingDealId(null);
    } catch {
      setDealEditError("Could not reach the server. Try again.");
    } finally {
      setDealEditSaving(false);
    }
  }

  async function toggleDealActive(deal: Deal) {
    setDealTogglingId(deal.id);
    try {
      const res = await fetch(`/api/admin/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !deal.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === deal.id ? data.deal : d)));
    } catch {
      alert("Could not update deal. Please try again.");
    } finally {
      setDealTogglingId(null);
    }
  }

  async function handleDeleteDeal(deal: Deal) {
    if (!confirm(`Delete "${deal.title}"? This cannot be undone.`)) return;
    setDealDeletingId(deal.id);
    try {
      const res = await fetch(`/api/admin/deals/${deal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    } catch {
      alert("Could not delete deal. Please try again.");
    } finally {
      setDealDeletingId(null);
    }
  }

  function openNewDealForm() {
    setShowNewDealForm(true);
    setNewDeal({ title: "", description: "", priceRs: "", activeWindow: "", includedItems: "" });
    setNewDealError(null);
  }

  async function submitNewDeal() {
    if (!newDeal.title.trim()) {
      setNewDealError("Title is required");
      return;
    }
    if (!newDeal.description.trim()) {
      setNewDealError("Description is required");
      return;
    }
    const priceNum = Number(newDeal.priceRs);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setNewDealError("Enter a valid price");
      return;
    }
    setNewDealCreating(true);
    setNewDealError(null);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDeal.title,
          description: newDeal.description,
          priceRs: priceNum,
          activeWindow: newDeal.activeWindow || null,
          includedItems: newDeal.includedItems
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewDealError(data?.error || "Failed to create deal");
        return;
      }
      setDeals((prev) => [...prev, data.deal]);
      setShowNewDealForm(false);
    } catch {
      setNewDealError("Could not reach the server. Try again.");
    } finally {
      setNewDealCreating(false);
    }
  }

  // ── Existing: save a price value ──────────────────────────────
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialCategories.forEach((cat) =>
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

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ name: string; description: string; badge: string; imageUrl: string }>({
    name: "",
    description: "",
    badge: "",
    imageUrl: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [openNewItemCat, setOpenNewItemCat] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{ name: string; description: string; badge: string; imageUrl: string }>({
    name: "",
    description: "",
    badge: "",
    imageUrl: "",
  });
  const [newPrices, setNewPrices] = useState<NewPriceRow[]>([{ label: "Regular", priceRs: "" }]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [addingPriceItemId, setAddingPriceItemId] = useState<string | null>(null);
  const [newPriceLabel, setNewPriceLabel] = useState("");
  const [newPriceValue, setNewPriceValue] = useState("");
  const [addPriceError, setAddPriceError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  async function handleToggleAvailability(item: Item) {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/admin/menu/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) => (it.id === item.id ? { ...it, isAvailable: data.item.isAvailable } : it)),
        }))
      );
    } catch {
      alert("Could not update availability. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  function startEdit(item: Item) {
    setEditingItemId(item.id);
    setEditFields({
      name: item.name,
      description: item.description || "",
      badge: item.badge || "",
      imageUrl: item.imageUrl || "",
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingItemId(null);
    setEditError(null);
  }

  async function saveEdit(itemId: string) {
    if (!editFields.name.trim()) {
      setEditError("Name cannot be empty");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFields.name,
          description: editFields.description || null,
          badge: editFields.badge || null,
          imageUrl: editFields.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data?.error || "Failed to save");
        return;
      }
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) => (it.id === itemId ? { ...it, ...data.item } : it)),
        }))
      );
      setEditingItemId(null);
    } catch {
      setEditError("Could not reach the server. Try again.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteItem(item: Item) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/menu/items/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.filter((it) => it.id !== item.id),
        }))
      );
    } catch {
      alert("Could not delete item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function startAddPrice(itemId: string) {
    setAddingPriceItemId(itemId);
    setNewPriceLabel("");
    setNewPriceValue("");
    setAddPriceError(null);
  }

  async function submitAddPrice(itemId: string) {
    if (!newPriceLabel.trim()) {
      setAddPriceError("Label is required");
      return;
    }
    const priceNum = Number(newPriceValue);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setAddPriceError("Enter a valid price");
      return;
    }
    try {
      const res = await fetch("/api/admin/menu/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId: itemId, label: newPriceLabel, priceRs: priceNum }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddPriceError(data?.error || "Failed to add price");
        return;
      }
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) => (it.id === itemId ? { ...it, prices: [...it.prices, data.price] } : it)),
        }))
      );
      setValues((prev) => ({ ...prev, [data.price.id]: String(data.price.priceRs) }));
      setAddingPriceItemId(null);
    } catch {
      setAddPriceError("Could not reach the server. Try again.");
    }
  }

  async function handleDeletePrice(itemId: string, priceId: string) {
    if (!confirm("Remove this price option?")) return;
    try {
      const res = await fetch(`/api/admin/menu/prices/${priceId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Could not remove this price.");
        return;
      }
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) =>
            it.id === itemId ? { ...it, prices: it.prices.filter((p) => p.id !== priceId) } : it
          ),
        }))
      );
    } catch {
      alert("Could not reach the server. Try again.");
    }
  }

  function openNewItemForm(catId: string) {
    setOpenNewItemCat(catId);
    setNewItem({ name: "", description: "", badge: "", imageUrl: "" });
    setNewPrices([{ label: "Regular", priceRs: "" }]);
    setCreateError(null);
  }

  function addNewPriceRow() {
    setNewPrices((prev) => [...prev, { label: "", priceRs: "" }]);
  }

  function removeNewPriceRow(idx: number) {
    setNewPrices((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateNewPriceRow(idx: number, field: "label" | "priceRs", value: string) {
    setNewPrices((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  async function submitNewItem(catId: string) {
    if (!newItem.name.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (newPrices.length === 0) {
      setCreateError("Add at least one price");
      return;
    }
    for (const row of newPrices) {
      if (!row.label.trim()) {
        setCreateError("Every price needs a label");
        return;
      }
      const n = Number(row.priceRs);
      if (!Number.isFinite(n) || n < 0) {
        setCreateError("Every price needs a valid amount");
        return;
      }
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: catId,
          name: newItem.name,
          description: newItem.description || null,
          badge: newItem.badge || null,
          imageUrl: newItem.imageUrl || null,
          prices: newPrices.map((r) => ({ label: r.label, priceRs: Number(r.priceRs) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data?.error || "Failed to create item");
        return;
      }
      setCategories((prev) =>
        prev.map((cat) => (cat.id === catId ? { ...cat, items: [...cat.items, data.item] } : cat))
      );
      data.item.prices.forEach((p: Price) => {
        setValues((prev) => ({ ...prev, [p.id]: String(p.priceRs) }));
      });
      setOpenNewItemCat(null);
    } catch {
      setCreateError("Could not reach the server. Try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-oven-crust">Menu Management</h1>
      <p className="mt-1 text-sm text-oven-cream/60">
        Add, edit, or remove items, prices, and deals. Changes save instantly and appear on the live site right away.
      </p>

      <div className="mt-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-oven-cream">Deals</h2>
            <button
              onClick={() => (showNewDealForm ? setShowNewDealForm(false) : openNewDealForm())}
              className="rounded-lg border border-oven-crust/40 px-3 py-1 text-xs font-semibold text-oven-crust hover:bg-oven-crust/10"
            >
              {showNewDealForm ? "Cancel" : "+ Add Deal"}
            </button>
          </div>

          {showNewDealForm && (
            <div className="mb-4 rounded-xl2 border border-oven-crust/30 bg-oven-teal-deep/40 p-4">
              <p className="mb-3 text-sm font-semibold text-oven-cream">New deal</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title (e.g. Student Deal)"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newDeal.description}
                  onChange={(e) => setNewDeal((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Price (Rs)"
                    value={newDeal.priceRs}
                    onChange={(e) => setNewDeal((p) => ({ ...p, priceRs: e.target.value }))}
                    className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                  />
                  <input
                    type="text"
                    placeholder="Active window (e.g. 10AM to 5PM)"
                    value={newDeal.activeWindow}
                    onChange={(e) => setNewDeal((p) => ({ ...p, activeWindow: e.target.value }))}
                    className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                  />
                </div>
                <input
                  type="text"
                  placeholder="What's included, comma separated (e.g. 1 Medium Pizza, 5pc Wings)"
                  value={newDeal.includedItems}
                  onChange={(e) => setNewDeal((p) => ({ ...p, includedItems: e.target.value }))}
                  className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                />

                {newDealError && <p className="text-xs text-red-400">{newDealError}</p>}

                <button
                  onClick={submitNewDeal}
                  disabled={newDealCreating}
                  className="mt-2 rounded-lg bg-oven-crust px-4 py-2 text-xs font-semibold text-oven-charcoal disabled:opacity-50"
                >
                  {newDealCreating ? "Creating..." : "Create Deal"}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className={`rounded-xl2 border p-4 ${
                  deal.isActive ? "border-oven-cream/10 bg-oven-teal-deep/30" : "border-red-500/20 bg-red-950/10"
                }`}
              >
                {editingDealId === deal.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={dealEditFields.title}
                      onChange={(e) => setDealEditFields((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={dealEditFields.description}
                      onChange={(e) => setDealEditFields((p) => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Price (Rs)"
                        value={dealEditFields.priceRs}
                        onChange={(e) => setDealEditFields((p) => ({ ...p, priceRs: e.target.value }))}
                        className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-2 text-sm text-oven-cream"
                      />
                      <input
                        type="text"
                        placeholder="Active window"
                        value={dealEditFields.activeWindow}
                        onChange={(e) => setDealEditFields((p) => ({ ...p, activeWindow: e.target.value }))}
                        className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-2 text-sm text-oven-cream"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="What's included, comma separated"
                      value={dealEditFields.includedItems}
                      onChange={(e) => setDealEditFields((p) => ({ ...p, includedItems: e.target.value }))}
                      className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                    />
                    {dealEditError && <p className="text-xs text-red-400">{dealEditError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveDealEdit(deal.id)}
                        disabled={dealEditSaving}
                        className="rounded-lg bg-oven-crust px-3 py-1 text-xs font-semibold text-oven-charcoal disabled:opacity-50"
                      >
                        {dealEditSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEditDeal}
                        className="rounded-lg border border-oven-cream/20 px-3 py-1 text-xs text-oven-cream/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-oven-cream">
                          {deal.title}
                          <span className="ml-2 font-mono text-sm text-oven-crust">Rs {deal.priceRs}</span>
                          {!deal.isActive && (
                            <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                              Inactive
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-oven-cream/50">{deal.description}</p>
                        {deal.activeWindow && (
                          <p className="text-xs text-oven-cream/40">Available: {deal.activeWindow}</p>
                        )}
                        {deal.includedItems.length > 0 && (
                          <p className="text-xs text-oven-cream/40">Includes: {deal.includedItems.join(", ")}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleDealActive(deal)}
                          disabled={dealTogglingId === deal.id}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                            deal.isActive
                              ? "border border-oven-cream/20 text-oven-cream/70 hover:bg-oven-cream/10"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {dealTogglingId === deal.id ? "..." : deal.isActive ? "Mark Inactive" : "Mark Active"}
                        </button>
                        <button
                          onClick={() => startEditDeal(deal)}
                          className="rounded-lg border border-oven-cream/20 px-3 py-1 text-xs text-oven-cream/70 hover:bg-oven-cream/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal)}
                          disabled={dealDeletingId === deal.id}
                          className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {dealDeletingId === deal.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {deals.length === 0 && <p className="text-sm text-oven-cream/40">No deals yet.</p>}
          </div>
        </section>
      </div>

      <div className="mt-10 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-oven-cream">{cat.name}</h2>
              <button
                onClick={() => (openNewItemCat === cat.id ? setOpenNewItemCat(null) : openNewItemForm(cat.id))}
                className="rounded-lg border border-oven-crust/40 px-3 py-1 text-xs font-semibold text-oven-crust hover:bg-oven-crust/10"
              >
                {openNewItemCat === cat.id ? "Cancel" : "+ Add Item"}
              </button>
            </div>

            {openNewItemCat === cat.id && (
              <div className="mb-4 rounded-xl2 border border-oven-crust/30 bg-oven-teal-deep/40 p-4">
                <p className="mb-3 text-sm font-semibold text-oven-cream">New item in {cat.name}</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newItem.description}
                    onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Badge (optional, e.g. New)"
                      value={newItem.badge}
                      onChange={(e) => setNewItem((p) => ({ ...p, badge: e.target.value }))}
                      className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                    />
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={newItem.imageUrl}
                      onChange={(e) => setNewItem((p) => ({ ...p, imageUrl: e.target.value }))}
                      className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                    />
                  </div>

                  <div className="mt-2">
                    <p className="mb-1 text-xs font-medium text-oven-cream/70">Prices</p>
                    <div className="space-y-2">
                      {newPrices.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Label (e.g. Large)"
                            value={row.label}
                            onChange={(e) => updateNewPriceRow(idx, "label", e.target.value)}
                            className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-1 text-sm text-oven-cream"
                          />
                          <input
                            type="number"
                            placeholder="Rs"
                            value={row.priceRs}
                            onChange={(e) => updateNewPriceRow(idx, "priceRs", e.target.value)}
                            className="w-28 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-1 text-sm text-oven-cream"
                          />
                          {newPrices.length > 1 && (
                            <button
                              onClick={() => removeNewPriceRow(idx)}
                              className="text-xs text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={addNewPriceRow} className="mt-2 text-xs text-oven-crust hover:underline">
                      + Add another price
                    </button>
                  </div>

                  {createError && <p className="text-xs text-red-400">{createError}</p>}

                  <button
                    onClick={() => submitNewItem(cat.id)}
                    disabled={creating}
                    className="mt-2 rounded-lg bg-oven-crust px-4 py-2 text-xs font-semibold text-oven-charcoal disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Item"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl2 border p-4 ${
                    item.isAvailable ? "border-oven-cream/10 bg-oven-teal-deep/30" : "border-red-500/20 bg-red-950/10"
                  }`}
                >
                  {editingItemId === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFields.name}
                        onChange={(e) => setEditFields((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={editFields.description}
                        onChange={(e) => setEditFields((p) => ({ ...p, description: e.target.value }))}
                        className="w-full rounded-lg border border-oven-cream/20 bg-oven-charcoal px-3 py-2 text-sm text-oven-cream"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Badge"
                          value={editFields.badge}
                          onChange={(e) => setEditFields((p) => ({ ...p, badge: e.target.value }))}
                          className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-2 text-sm text-oven-cream"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={editFields.imageUrl}
                          onChange={(e) => setEditFields((p) => ({ ...p, imageUrl: e.target.value }))}
                          className="w-1/2 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-2 text-sm text-oven-cream"
                        />
                      </div>
                      {editError && <p className="text-xs text-red-400">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={editSaving}
                          className="rounded-lg bg-oven-crust px-3 py-1 text-xs font-semibold text-oven-charcoal disabled:opacity-50"
                        >
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border border-oven-cream/20 px-3 py-1 text-xs text-oven-cream/70"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-oven-cream">
                            {item.name}
                            {item.badge && (
                              <span className="ml-2 rounded-full bg-oven-crust/20 px-2 py-0.5 text-[10px] font-semibold text-oven-crust">
                                {item.badge}
                              </span>
                            )}
                            {!item.isAvailable && (
                              <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                                Unavailable
                              </span>
                            )}
                          </p>
                          {item.description && <p className="text-xs text-oven-cream/50">{item.description}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            disabled={togglingId === item.id}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                              item.isAvailable
                                ? "border border-oven-cream/20 text-oven-cream/70 hover:bg-oven-cream/10"
                                : "bg-emerald-600 text-white hover:bg-emerald-500"
                            }`}
                          >
                            {togglingId === item.id ? "..." : item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-oven-cream/20 px-3 py-1 text-xs text-oven-cream/70 hover:bg-oven-cream/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            disabled={deletingId === item.id}
                            className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === item.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
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
                              {savingId === price.id ? "Saving..." : "Save"}
                            </button>
                            {savedId === price.id && <span className="text-xs text-green-400">Saved ✓</span>}
                            {errorId === price.id && <span className="text-xs text-red-400">Error</span>}
                            <button
                              onClick={() => handleDeletePrice(item.id, price.id)}
                              className="text-xs text-red-400/70 hover:text-red-400 hover:underline"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {addingPriceItemId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Label"
                              value={newPriceLabel}
                              onChange={(e) => setNewPriceLabel(e.target.value)}
                              className="w-20 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-1 text-sm text-oven-cream"
                            />
                            <input
                              type="number"
                              placeholder="Rs"
                              value={newPriceValue}
                              onChange={(e) => setNewPriceValue(e.target.value)}
                              className="w-20 rounded-lg border border-oven-cream/20 bg-oven-charcoal px-2 py-1 text-sm text-oven-cream"
                            />
                            <button
                              onClick={() => submitAddPrice(item.id)}
                              className="rounded-lg bg-oven-crust px-2 py-1 text-xs font-semibold text-oven-charcoal"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setAddingPriceItemId(null)}
                              className="text-xs text-oven-cream/50 hover:underline"
                            >
                              Cancel
                            </button>
                            {addPriceError && <span className="text-xs text-red-400">{addPriceError}</span>}
                          </div>
                        ) : (
                          <button
                            onClick={() => startAddPrice(item.id)}
                            className="text-xs text-oven-crust hover:underline"
                          >
                            + Add size/price
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {cat.items.length === 0 && (
                <p className="text-sm text-oven-cream/40">No items in this category yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
