"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "request" | "reset" | "done";

const inputClass =
  "w-full rounded-lg border border-oven-cream/15 bg-oven-charcoal/60 px-3.5 py-2.5 text-oven-cream placeholder:text-oven-cream/30 focus:border-oven-flame focus:outline-none focus:ring-1 focus:ring-oven-flame";
const labelClass = "mb-1.5 block text-sm font-medium text-oven-cream/85";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setInfo(data.message ?? "If your details are correct, you will receive an OTP by email.");
      setStep("reset");
      setSubmitting(false);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setStep("done");
      setSubmitting(false);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-oven-cream/85">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/admin/login"
          className="block w-full rounded-full bg-flame-gradient px-5 py-2.5 text-center text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02]"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
        {info ? <p className="text-sm text-oven-cream/60">{info}</p> : null}

        <div>
          <label htmlFor="otp" className={labelClass}>
            One-time code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={inputClass}
            placeholder="6-digit code"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className={labelClass}>
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Re-enter new password"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>

        <button
          type="button"
          onClick={() => setStep("request")}
          className="w-full text-center text-xs font-medium text-oven-cream/60 hover:underline"
        >
          Didn&apos;t get a code? Go back
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className={labelClass}>
          Branch username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
          placeholder="e.g. mian-channu"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Admin email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending code..." : "Send Code"}
      </button>

      <Link
        href="/admin/login"
        className="block w-full text-center text-xs font-medium text-oven-cream/60 hover:underline"
      >
        Back to Sign In
      </Link>
    </form>
  );
}
