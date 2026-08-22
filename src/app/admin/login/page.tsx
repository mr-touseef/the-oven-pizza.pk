import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  // Already logged in? Skip straight to the branch's own orders.
  const session = await getAdminSession();
  if (session) redirect("/admin/orders");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-8 shadow-card backdrop-blur-sm">
        <h1 className="font-display text-2xl text-oven-crust">Branch Login</h1>
       <p className="mt-1 text-sm text-oven-cream/60">
  Sign in with your branch&apos;s admin username and password to view your orders.
</p>
        <LoginForm />
      </div>
    </div>
  );
}
