"use client";

import { useState, type FormEvent } from "react";
import { newsletterSchema } from "@/lib/validations";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = newsletterSchema.safeParse({ email, company });
    if (!parsed.success) {
      setStatus("error");
      setMessage(parsed.error.issues[0]?.message || "Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "You're on the list — stay tuned!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="footer-company">Company</label>
        <input
          id="footer-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full min-w-[220px] rounded-full border border-oven-cream/15 bg-oven-charcoal/60 px-4 py-2.5 text-sm text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame-light"
        />
        {message ? (
          <p
            role="status"
            aria-live="polite"
            className={`mt-1.5 text-xs ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="whitespace-nowrap rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Stay Tuned"}
      </button>
    </form>
  );
}
