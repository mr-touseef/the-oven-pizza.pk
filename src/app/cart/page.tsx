import { getBranches } from "@/lib/branches";
import { getAdminSession } from "@/lib/auth";
import CartView from "./CartView";
import { PushNotificationButton } from '@/components/PushNotificationButton';

export default async function CartPage() {
  const [branches, session] = await Promise.all([getBranches(), getAdminSession()]);
  return <CartView branches={branches} isAdmin={Boolean(session)} />;
}