"use client";

import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-oven-char/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-rise rounded-xl2 border border-oven-cream/15 bg-oven-teal-deep p-6 shadow-card-hover"
      >
        <p id="confirm-dialog-title" className="font-display text-lg text-oven-cream">
          {title}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-oven-cream/20 px-4 py-2 text-sm font-medium text-oven-cream/80 hover:bg-oven-cream/10"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-flame-gradient px-5 py-2 text-sm font-semibold text-oven-charcoal shadow-ember"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
