import CheckoutPageView from "@/components/CheckoutPageView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />
      <CheckoutPageView />
      <SiteFooter />
    </div>
  );
}
