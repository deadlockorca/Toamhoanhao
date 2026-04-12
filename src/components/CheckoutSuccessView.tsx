"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessView() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order")?.trim() || null;
  const lookupHref = orderNumber
    ? `/tra-cuu-don-hang?order=${encodeURIComponent(orderNumber)}`
    : "/tra-cuu-don-hang";

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-8 md:px-6 md:pt-10">
      <section className="mx-auto max-w-[760px] rounded-2xl border border-[#dbe3ef] bg-white px-6 py-10 text-center shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:px-10 md:py-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9a7f1a]">Đặt hàng thành công</p>
        <h1 className="mt-2 text-[32px] font-bold text-[#1f2937] md:text-[38px]">Cảm ơn bạn đã đặt hàng</h1>
        <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-[1.65] text-[#4f5a6a]">
          Đội ngũ Tổ Ấm Hoàn Hảo đã nhận được đơn của bạn và sẽ liên hệ xác nhận trong thời gian sớm nhất.
        </p>

        {orderNumber ? (
          <div className="mx-auto mt-6 inline-flex items-center justify-center rounded-full border border-[#e5d499] bg-[#fff8df] px-5 py-2 text-[14px] font-semibold text-[#7d6211]">
            Mã đơn hàng: {orderNumber}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href={lookupHref}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
          >
            Tra cứu đơn hàng
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f242c] px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45]"
          >
            Về trang chủ
          </Link>
          <Link
            href="/san-pham-moi"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d6e0] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#334155] transition hover:bg-[#f8fafc]"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}
