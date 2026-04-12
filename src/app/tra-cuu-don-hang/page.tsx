import OrderLookupView from "@/components/OrderLookupView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function OrderLookupPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />
      <OrderLookupView />
      <SiteFooter />
    </div>
  );
}
