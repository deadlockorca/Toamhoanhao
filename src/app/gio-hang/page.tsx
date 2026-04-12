import CartPageView from "@/components/CartPageView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />
      <CartPageView />
      <SiteFooter />
    </div>
  );
}
