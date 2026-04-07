"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";
import R2ImageUploadField from "@/components/admin/R2ImageUploadField";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

type AdminVariant = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  inStock: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type AdminVariantResponse = {
  products?: AdminProduct[];
  variants?: AdminVariant[];
  error?: string;
};

type VariantFormState = {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  option1: string;
  option2: string;
  option3: string;
  imageUrl: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  inStock: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: string;
};

const emptyFormState: VariantFormState = {
  productId: "",
  name: "",
  sku: "",
  barcode: "",
  option1: "",
  option2: "",
  option3: "",
  imageUrl: "",
  price: "",
  originalPrice: "",
  stockQuantity: "0",
  inStock: true,
  isDefault: false,
  isActive: true,
  sortOrder: "0",
};

const toVariantFormState = (variant: AdminVariant): VariantFormState => ({
  productId: variant.productId,
  name: variant.name ?? "",
  sku: variant.sku ?? "",
  barcode: variant.barcode ?? "",
  option1: variant.option1 ?? "",
  option2: variant.option2 ?? "",
  option3: variant.option3 ?? "",
  imageUrl: variant.imageUrl ?? "",
  price: String(variant.price),
  originalPrice: variant.originalPrice !== null ? String(variant.originalPrice) : "",
  stockQuantity: String(variant.stockQuantity),
  inStock: variant.inStock,
  isDefault: variant.isDefault,
  isActive: variant.isActive,
  sortOrder: String(variant.sortOrder),
});

const parseErrorMessage = (responseBody: unknown, fallback: string) => {
  if (!responseBody || typeof responseBody !== "object" || Array.isArray(responseBody)) {
    return fallback;
  }

  const body = responseBody as { error?: unknown };
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }

  return fallback;
};

const getVariantLabel = (variant: AdminVariant) => {
  const options = [variant.option1, variant.option2, variant.option3].filter(
    (value): value is string => Boolean(value)
  );

  if (options.length > 0) {
    return options.join(" / ");
  }

  return variant.name ?? "Biến thể mặc định";
};

export default function AdminVariantsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [variants, setVariants] = useState<AdminVariant[]>([]);
  const [form, setForm] = useState<VariantFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/variants", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminVariantResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu biến thể."));
      }

      setProducts(Array.isArray(payload.products) ? payload.products : []);
      setVariants(Array.isArray(payload.variants) ? payload.variants : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải dữ liệu biến thể.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm(emptyFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const endpoint = editingId ? `/api/admin/variants/${editingId}` : "/api/admin/variants";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: form.productId,
          name: form.name,
          sku: form.sku,
          barcode: form.barcode,
          option1: form.option1,
          option2: form.option2,
          option3: form.option3,
          imageUrl: form.imageUrl,
          price: form.price,
          originalPrice: form.originalPrice,
          stockQuantity: form.stockQuantity,
          inStock: form.inStock,
          isDefault: form.isDefault,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể lưu biến thể."));
      }

      setSuccessMessage(editingId ? "Đã cập nhật biến thể." : "Đã thêm biến thể.");
      resetForm();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu biến thể.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (variant: AdminVariant) => {
    if (!window.confirm(`Xóa biến thể "${getVariantLabel(variant)}" của ${variant.productName}?`)) {
      return;
    }

    setDeletingId(variant.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể xóa biến thể."));
      }

      if (editingId === variant.id) {
        resetForm();
      }

      setSuccessMessage("Đã xóa biến thể.");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa biến thể.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">Quản lý biến thể</h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Dùng biến thể để quản lý màu sắc, kích thước, SKU riêng và tồn kho chính xác cho từng sản phẩm.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">
            {editingId ? "Sửa biến thể" : "Thêm biến thể mới"}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Sản phẩm *</span>
                <select
                  required
                  value={form.productId}
                  onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tên biến thể</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Ví dụ: Màu Kem"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">SKU</span>
                <input
                  value={form.sku}
                  onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="SOFA-MANHATTAN-CREAM"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Barcode</span>
                <input
                  value={form.barcode}
                  onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="893xxxxxxxxx"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Option 1</span>
                <input
                  value={form.option1}
                  onChange={(event) => setForm((prev) => ({ ...prev, option1: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Màu kem"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Option 2</span>
                <input
                  value={form.option2}
                  onChange={(event) => setForm((prev) => ({ ...prev, option2: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="2 chỗ"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Option 3</span>
                <input
                  value={form.option3}
                  onChange={(event) => setForm((prev) => ({ ...prev, option3: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Vải bố"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Giá bán *</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="10990000"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Giá gốc</span>
                <input
                  inputMode="numeric"
                  value={form.originalPrice}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, originalPrice: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="12490000"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tồn kho</span>
                <input
                  inputMode="numeric"
                  value={form.stockQuantity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Thứ tự hiển thị</span>
                <input
                  inputMode="numeric"
                  value={form.sortOrder}
                  onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="space-y-1 block">
                <span className="text-[13px] font-medium text-[#363c47]">Ảnh biến thể (URL)</span>
                <input
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="/products/p1.jpg"
                />
              </label>
              <R2ImageUploadField
                value={form.imageUrl}
                folder="variants"
                onUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-[14px] text-[#2e3440]">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(event) => setForm((prev) => ({ ...prev, inStock: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#cdd1d8]"
                />
                Còn hàng
              </label>

              <label className="inline-flex items-center gap-2 text-[14px] text-[#2e3440]">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#cdd1d8]"
                />
                Biến thể mặc định
              </label>

              <label className="inline-flex items-center gap-2 text-[14px] text-[#2e3440]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#cdd1d8]"
                />
                Đang hoạt động
              </label>
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-[#f0a7a7] bg-[#fff0f0] px-3 py-2 text-[14px] text-[#b11f1f]">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="rounded-xl border border-[#b8e4c3] bg-[#f0fff5] px-3 py-2 text-[14px] text-[#1e7b3f]">
                {successMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#1f2329] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#323843] disabled:cursor-not-allowed disabled:bg-[#9199a8]"
              >
                {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật biến thể" : "Thêm biến thể"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#cfd3da] px-4 py-2.5 text-[14px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách biến thể</h2>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                void loadData();
              }}
              className="rounded-xl border border-[#cfd3da] px-4 py-2 text-[14px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
            >
              Tải lại dữ liệu
            </button>
          </div>

          {isLoading ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách biến thể...</p>
          ) : variants.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có biến thể nào trong database.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[1050px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Sản phẩm</th>
                    <th className="px-3 py-2.5 font-semibold">Biến thể</th>
                    <th className="px-3 py-2.5 font-semibold">Giá</th>
                    <th className="px-3 py-2.5 font-semibold">Kho</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-[#ececf1] align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-[#1f2329]">{variant.productName}</p>
                        <p className="mt-1 text-[12px] text-[#6a7280]">/{variant.productSlug}</p>
                      </td>
                      <td className="px-3 py-3 text-[#323843]">
                        <p className="font-medium">{getVariantLabel(variant)}</p>
                        {variant.sku && <p className="mt-1 text-[12px] text-[#6a7280]">SKU: {variant.sku}</p>}
                      </td>
                      <td className="px-3 py-3 text-[#323843]">
                        {currencyFormatter.format(variant.price)}
                        {variant.originalPrice !== null && (
                          <span className="ml-2 text-[12px] text-[#8f97a4] line-through">
                            {currencyFormatter.format(variant.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#323843]">{variant.stockQuantity}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1 text-[12px]">
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 ${
                              variant.inStock
                                ? "bg-[#e7f8ed] text-[#1f7a42]"
                                : "bg-[#fff1f1] text-[#b03131]"
                            }`}
                          >
                            {variant.inStock ? "Còn hàng" : "Hết hàng"}
                          </span>
                          {variant.isDefault && (
                            <span className="inline-flex w-fit rounded-full bg-[#f5edff] px-2 py-0.5 text-[#6a39b5]">
                              Mặc định
                            </span>
                          )}
                          {!variant.isActive && (
                            <span className="inline-flex w-fit rounded-full bg-[#eceff5] px-2 py-0.5 text-[#4e5766]">
                              Đang ẩn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(variant.id);
                              setForm(toVariantFormState(variant));
                              setSuccessMessage(null);
                              setErrorMessage(null);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === variant.id}
                            onClick={() => {
                              void handleDelete(variant);
                            }}
                            className="rounded-lg border border-[#efb1b1] px-3 py-1.5 text-[13px] font-medium text-[#b03131] transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === variant.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
