"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";
import R2ImageUploadField from "@/components/admin/R2ImageUploadField";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
};

type AdminCollectionItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  productPrice: number;
  sortOrder: number;
};

type AdminCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
  items: AdminCollectionItem[];
  createdAt: string;
  updatedAt: string;
};

type AdminCollectionResponse = {
  collections?: AdminCollection[];
  products?: AdminProduct[];
  error?: string;
};

type CollectionFormState = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: string;
  productIds: string[];
};

const emptyFormState: CollectionFormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  isActive: true,
  sortOrder: "0",
  productIds: [],
};

const toCollectionFormState = (collection: AdminCollection): CollectionFormState => ({
  name: collection.name,
  slug: collection.slug,
  description: collection.description ?? "",
  imageUrl: collection.imageUrl ?? "",
  isActive: collection.isActive,
  sortOrder: String(collection.sortOrder),
  productIds: collection.items.map((item) => item.productId),
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

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<CollectionFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/collections", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminCollectionResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu bộ sưu tập."));
      }

      setCollections(Array.isArray(payload.collections) ? payload.collections : []);
      setProducts(Array.isArray(payload.products) ? payload.products : []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị bộ sưu tập.";
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
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint = editingId
        ? `/api/admin/collections/${editingId}`
        : "/api/admin/collections";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          imageUrl: form.imageUrl,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
          productIds: form.productIds,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể lưu bộ sưu tập."));
      }

      setSuccessMessage(editingId ? "Đã cập nhật bộ sưu tập." : "Đã tạo bộ sưu tập mới.");
      resetForm();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu bộ sưu tập.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (collection: AdminCollection) => {
    if (!window.confirm(`Xóa bộ sưu tập "${collection.name}"?`)) {
      return;
    }

    setDeletingId(collection.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/collections/${collection.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể xóa bộ sưu tập."));
      }

      if (editingId === collection.id) {
        resetForm();
      }

      setSuccessMessage("Đã xóa bộ sưu tập.");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa bộ sưu tập.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">
            Quản lý bộ sưu tập
          </h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Dùng bộ sưu tập để gom nhóm sản phẩm như sản phẩm mới, bán chạy, giảm giá hoặc chủ đề theo
            chiến dịch.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">
            {editingId ? "Sửa bộ sưu tập" : "Thêm bộ sưu tập mới"}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tên bộ sưu tập *</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Ví dụ: Nội thất phòng khách"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Slug (để trống sẽ tự tạo)</span>
                <input
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="noi-that-phong-khach"
                />
              </label>

              <div className="space-y-1 md:col-span-2">
                <label className="space-y-1 block">
                  <span className="text-[13px] font-medium text-[#363c47]">Ảnh đại diện (URL)</span>
                  <input
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                    placeholder="https://.../collections/collection-phong-khach.jpg"
                  />
                </label>
                <R2ImageUploadField
                  value={form.imageUrl}
                  folder="collections"
                  onUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                />
              </div>

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

            <label className="space-y-1 block">
              <span className="text-[13px] font-medium text-[#363c47]">Mô tả ngắn</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Mô tả ngắn cho bộ sưu tập..."
              />
            </label>

            <label className="space-y-1 block">
              <span className="text-[13px] font-medium text-[#363c47]">
                Sản phẩm trong bộ sưu tập (giữ Ctrl/Cmd để chọn nhiều)
              </span>
              <select
                multiple
                value={form.productIds}
                onChange={(event) => {
                  const selectedValues = Array.from(event.target.selectedOptions).map(
                    (option) => option.value
                  );
                  setForm((prev) => ({ ...prev, productIds: selectedValues }));
                }}
                className="h-[180px] w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
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
                {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật bộ sưu tập" : "Thêm bộ sưu tập"}
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
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách bộ sưu tập</h2>
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
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách bộ sưu tập...</p>
          ) : collections.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có bộ sưu tập nào trong database.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[980px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Tên bộ sưu tập</th>
                    <th className="px-3 py-2.5 font-semibold">Slug</th>
                    <th className="px-3 py-2.5 font-semibold">Số sản phẩm</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id} className="border-t border-[#ececf1] align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-[#1f2329]">{collection.name}</p>
                        {collection.description && (
                          <p className="mt-1 text-[12px] text-[#6a7280]">{collection.description}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#323843]">/{collection.slug}</td>
                      <td className="px-3 py-3 text-[#323843]">{collection.itemCount}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[12px] ${
                            collection.isActive
                              ? "bg-[#e7f8ed] text-[#1f7a42]"
                              : "bg-[#eceff5] text-[#4e5766]"
                          }`}
                        >
                          {collection.isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(collection.id);
                              setForm(toCollectionFormState(collection));
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
                            disabled={deletingId === collection.id}
                            onClick={() => {
                              void handleDelete(collection);
                            }}
                            className="rounded-lg border border-[#efb1b1] px-3 py-1.5 text-[13px] font-medium text-[#b03131] transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === collection.id ? "Đang xóa..." : "Xóa"}
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
