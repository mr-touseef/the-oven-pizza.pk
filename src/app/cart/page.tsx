import { getBranches } from "@/lib/branches";
import { getAdminSession } from "@/lib/auth";
import CartView from "./CartView";

export default async function CartPage() {
  const [branches, session] = await Promise.all([getBranches(), getAdminSession()]);
  return <CartView branches={branches} isAdmin={Boolean(session)} adminBranchName={session?.branch.name ?? null} />;
}
