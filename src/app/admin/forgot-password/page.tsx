import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-8 shadow-card backdrop-blur-sm">
        <h1 className="font-display text-2xl text-oven-crust">Reset Password</h1>
        <p className="mt-1 text-sm text-oven-cream/60">
          Enter your branch username and the registered admin email. We&apos;ll send a one-time code to reset your password.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
