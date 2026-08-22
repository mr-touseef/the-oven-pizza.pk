import { getBranches } from "@/lib/branches";
import CartView from "./CartView";

export default async function CartPage() {
  const branches = await getBranches();
  return <CartView branches={branches} />;
}
