"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type ProductVariantItem = {
  id: string;
  name: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  isDefault: boolean;
};

type ProductSpecItem = {
  id: string;
  name: string;
  value: string;
};

type RelatedProductItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
};

type ProductDetailViewProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    badge: string | null;
    categoryName: string | null;
    shortDescription: string | null;
    description: string | null;
    price: number;
    originalPrice: number | null;
    inStock: boolean;
    imageUrls: string[];
    variants: ProductVariantItem[];
    specs: ProductSpecItem[];
  };
  relatedProducts: RelatedProductItem[];
  sitePhone: string;
};

type DetailTabId = "description" | "specs" | "policy";

const detailTabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "description", label: "Mô tả chi tiết" },
  { id: "specs", label: "Thông số sản phẩm" },
  { id: "policy", label: "Giao hàng & bảo hành" },
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const isContactPrice = (price: number, originalPrice: number | null) =>
  price <= 0 && (originalPrice === null || originalPrice <= 0);

const getVariantLabel = (variant: ProductVariantItem) => {
  const parts = [variant.name, variant.option1, variant.option2, variant.option3]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "Biến thể mặc định";
};

export default function ProductDetailView({ product, relatedProducts, sitePhone }: ProductDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("description");
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants.find((variant) => variant.isDefault)?.id ?? product.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.imageUrls[0] ?? "/products/p1.jpg");

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const galleryImages = useMemo(() => {
    const baseImages = product.imageUrls.length > 0 ? product.imageUrls : ["/products/p1.jpg"];
    const variantImage = selectedVariant?.imageUrl?.trim();
    if (!variantImage) {
      return baseImages;
    }
    if (baseImages.includes(variantImage)) {
      return baseImages;
    }
    return [variantImage, ...baseImages];
  }, [product.imageUrls, selectedVariant?.imageUrl]);

  const currentImage = galleryImages.includes(activeImage) ? activeImage : (galleryImages[0] ?? "/products/p1.jpg");

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const displayContactPrice = isContactPrice(displayPrice, displayOriginalPrice);
  const inStock = selectedVariant?.inStock ?? product.inStock;

  return (
    <>
      <section className="mx-auto w-full max-w-[1320px] px-4 pt-5 md:px-6 md:pt-7">
        <nav className="text-[13px] text-[#6b7280]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition hover:text-[#907217]">
                Trang chủ
              </Link>
            </li>
            <li>›</li>
            {product.categoryName ? (
              <>
                <li className="text-[#4a5565]">{product.categoryName}</li>
                <li>›</li>
              </>
            ) : null}
            <li className="font-medium text-[#2b3342]">{product.name}</li>
          </ol>
        </nav>
      </section>

      <main className="mx-auto mt-4 w-full max-w-[1320px] px-4 pb-14 md:px-6">
        <section className="rounded-2xl border border-[#e1e4ea] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid min-w-0 gap-3 lg:grid-cols-[88px_minmax(0,1fr)]">
              <div className="order-2 min-w-0 lg:order-1">
                <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:flex-col lg:overflow-visible">
                  {galleryImages.map((imageUrl, index) => {
                    const isActive = currentImage === imageUrl;
                    return (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(imageUrl)}
                        className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border transition lg:h-[84px] lg:w-[84px] ${
                          isActive
                            ? "border-[#b9931f] ring-2 ring-[#ead99f]"
                            : "border-[#d9dbe1] hover:border-[#b9931f]"
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="84px"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="order-1 min-w-0 overflow-hidden rounded-2xl border border-[#e4e7ed] bg-[#f6f7f9] lg:order-2">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 760px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                {product.badge ? (
                  <span className="inline-flex rounded-full bg-[#d82b2b] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    {product.badge}
                  </span>
                ) : null}
                <h1 className="text-[24px] font-bold leading-[1.25] text-[#1f2937] md:text-[30px]">
                  {product.name}
                </h1>
                {product.shortDescription ? (
                  <p className="text-[14px] leading-[1.65] text-[#4f5a6a] md:text-[15px]">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-[#f7f8fa] p-4">
                <p className="text-[13px] uppercase tracking-[0.08em] text-[#8a919d]">
                  {displayContactPrice ? "Thông tin giá" : "Giá bán"}
                </p>
                {displayContactPrice ? (
                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    <span className="text-[29px] font-bold leading-none text-[#c2271d] md:text-[34px]">
                      Liên Hệ
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    <span className="text-[29px] font-bold leading-none text-[#c2271d] md:text-[34px]">
                      {formatVnd(displayPrice)}
                    </span>
                    {displayOriginalPrice && displayOriginalPrice > displayPrice ? (
                      <span className="pb-1 text-[15px] font-medium text-[#8b919d] line-through">
                        {formatVnd(displayOriginalPrice)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {product.variants.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[14px] font-semibold text-[#2f3947]">Tùy chọn</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const isActive = selectedVariantId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                            isActive
                              ? "border-[#b9931f] bg-[#fff7dc] text-[#72590d]"
                              : "border-[#d4d8df] text-[#3b4554] hover:border-[#b9931f]"
                          }`}
                        >
                          {getVariantLabel(variant)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-2 text-[14px]">
                <span className="font-medium text-[#2f3947]">Tình trạng:</span>
                <span className={inStock ? "font-semibold text-[#16703c]" : "font-semibold text-[#b42318]"}>
                  {inStock ? "Còn hàng" : "Tạm hết hàng"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center overflow-hidden rounded-full border border-[#d1d6df] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-10 w-10 text-[20px] leading-none text-[#374152] transition hover:bg-[#f3f5f8]"
                  >
                    -
                  </button>
                  <span className="inline-flex h-10 min-w-10 items-center justify-center border-x border-[#d1d6df] px-3 text-[14px] font-semibold text-[#1f2937]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(9, prev + 1))}
                    className="h-10 w-10 text-[20px] leading-none text-[#374152] transition hover:bg-[#f3f5f8]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="h-10 rounded-full bg-[#1f242c] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#333a45]"
                >
                  Mua ngay
                </button>
                <a
                  href={`tel:${sitePhone}`}
                  className="inline-flex h-10 items-center rounded-full border border-[#d3b456] bg-[#f0df93] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#5f4a0a] transition hover:bg-[#ead57a]"
                >
                  Liên hệ tư vấn
                </a>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[#e4e7ed] bg-[#fafbfc] p-3 text-[13px] text-[#4b5565]">
                <p>• Miễn phí tư vấn thiết kế theo không gian thực tế.</p>
                <p>• Giao hàng và lắp đặt nội thành theo lịch hẹn.</p>
                <p>• Bảo hành chính hãng, hỗ trợ kỹ thuật sau bán.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#e1e4ea] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-wrap gap-2 border-b border-[#eceff3] pb-3">
            {detailTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    isActive
                      ? "bg-[#1e2430] text-white shadow-[0_6px_16px_rgba(15,23,42,0.22)]"
                      : "text-[#445062] hover:bg-[#f3f5f8]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="pt-5">
            {activeTab === "description" ? (
              <div className="space-y-3 text-[15px] leading-[1.75] text-[#374152]">
                {product.description ? (
                  product.description.split("\n").filter(Boolean).map((line, index) => <p key={index}>{line}</p>)
                ) : (
                  <p>
                    Sản phẩm được hoàn thiện theo tiêu chuẩn xuất khẩu với chất liệu bền bỉ, đường nét tinh gọn và tối
                    ưu trải nghiệm sử dụng trong không gian sống hiện đại.
                  </p>
                )}
              </div>
            ) : null}

            {activeTab === "specs" ? (
              product.specs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[#e3e7ee]">
                  <table className="min-w-[520px] w-full border-collapse text-left">
                    <tbody>
                      {product.specs.map((spec) => (
                        <tr key={spec.id} className="border-t border-[#e3e7ee] first:border-t-0">
                          <th className="w-[34%] bg-[#f8fafc] px-4 py-3 text-[14px] font-semibold text-[#2e3a4b]">
                            {spec.name}
                          </th>
                          <td className="px-4 py-3 text-[14px] leading-[1.65] text-[#475467]">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[14px] text-[#667085]">Thông số sản phẩm đang được cập nhật.</p>
              )
            ) : null}

            {activeTab === "policy" ? (
              <div className="space-y-2 text-[14px] leading-[1.7] text-[#3e4a5b]">
                <p>• Xác nhận đơn và lịch giao trong giờ hành chính.</p>
                <p>• Miễn phí lắp đặt nội thành với các đơn đủ điều kiện.</p>
                <p>• Đổi trả theo chính sách hiện hành tại thời điểm mua.</p>
                <p>• Bảo hành kỹ thuật theo quy định của từng dòng sản phẩm.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-[22px] font-bold text-[#1f2937]">Sản phẩm liên quan</h2>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:overflow-visible sm:pb-0 sm:snap-none sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/san-pham/${related.slug}`}
                  className="group w-[calc(50%-0.5rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#e7e8ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)] sm:w-auto sm:shrink"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f3f4f6]">
                    <Image
                      src={related.image}
                      alt={related.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    {related.badge ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#d82b2b] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.03em] text-white">
                        {related.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-2 p-4">
                    <h3 className="min-h-[2.75rem] text-[15px] font-semibold leading-[1.35] text-[#1f2937]">
                      {related.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {isContactPrice(related.price, related.originalPrice) ? (
                        <span className="text-[17px] font-bold text-[#bf1f15]">Liên Hệ</span>
                      ) : (
                        <>
                          <span className="text-[17px] font-bold text-[#bf1f15]">{formatVnd(related.price)}</span>
                          {related.originalPrice ? (
                            <span className="text-[13px] font-medium text-[#8b8f98] line-through">
                              {formatVnd(related.originalPrice)}
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e1e4ea] bg-white p-6 text-[14px] text-[#6b7280]">
              Chưa có sản phẩm liên quan trong cùng danh mục.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
