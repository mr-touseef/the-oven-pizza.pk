"use client";

import { useState, type FormEvent } from "react";
import { inquirySchema, type InquiryInput } from "@/lib/validations";

type FieldErrors = Partial<Record<keyof InquiryInput, string>>;

const initialState = {
  name: "",
  phone: "",
  email: "",
  type: "ORDER" as InquiryInput["type"],
  branch: "",
  message: "",
  company: "", // honeypot
};

export default function ContactForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof InquiryInput]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerMessage(null);

    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof InquiryInput;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setStatus("error");
      setServerMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("loading");
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, branch: values.branch }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.fieldErrors) {
          setErrors(data.fieldErrors);
        }
        setStatus("error");
        setServerMessage(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setServerMessage("Thanks — we've received your message and will call you back shortly.");
      setValues(initialState);
    } catch {
      setStatus("error");
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby="form-status">
      {/* Honeypot — hidden from real users, catches simple bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
            placeholder="Ali Raza"
          />
          {errors.name ? (
            <p id="name-error" className="mt-1.5 text-sm text-red-400">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
            placeholder="0300-1234567"
          />
          {errors.phone ? (
            <p id="phone-error" className="mt-1.5 text-sm text-red-400">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
            Email <span className="text-oven-cream/40">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
            placeholder="you@example.com"
          />
          {errors.email ? (
            <p id="email-error" className="mt-1.5 text-sm text-red-400">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
            This is about
          </label>
          <select
            id="type"
            name="type"
            value={values.type}
            onChange={(e) => update("type", e.target.value as InquiryInput["type"])}
            className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream focus:border-oven-flame-light"
          >
            <option value="ORDER">Placing an order</option>
            <option value="RESERVATION">Table reservation</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="GENERAL">General question</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="w-full resize-y rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
          placeholder="e.g. 1 Medium Crown Crust, 5pc Hot Wings, delivered to..."
        />
        {errors.message ? (
          <p id="message-error" className="mt-1.5 text-sm text-red-400">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-oven-cream/85">
            Nearest branch
          </label>
          <select
            id="branch"
            name="branch"
            value={values.branch}
            onChange={(e) => update("branch", e.target.value)}
            className="w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-3 text-oven-cream focus:border-oven-flame-light sm:w-64"
          >
            <option value="">Select a branch</option>
            <option value="Mian Channu">Mian Channu</option>
            <option value="Sahiwal">Sahiwal</option>
            <option value="Chichawatni">Chichawatni</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-flame-gradient px-7 py-3.5 text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-oven-charcoal/40 border-t-oven-charcoal"
                aria-hidden="true"
              />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
      </div>

      <div id="form-status" role="status" aria-live="polite">
        {serverMessage ? (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-400" : status === "error" ? "text-red-400" : "text-oven-cream/70"
            }`}
          >
            {serverMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}