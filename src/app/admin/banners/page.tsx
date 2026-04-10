"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";
import R2ImageUploadField from "@/components/admin/R2ImageUploadField";

type AdminBanner = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AdminBannerResponse = {
  banners?: AdminBanner[];
  warning?: string;
  error?: string;
};

type BannerFormState = {
  title: string;
  slug: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyFormState: BannerFormState = {
  title: "",
  slug: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: "0",
  isActive: true,
};

const toBannerFormState = (banner: AdminBanner): BannerFormState => ({
  title: banner.title,
  slug: banner.slug,
  subtitle: banner.subtitle ?? "",
  imageUrl: banner.imageUrl,
  ctaLabel: banner.ctaLabel ?? "",
  ctaHref: banner.ctaHref ?? "",
  sortOrder: String(banner.sortOrder),
  isActive: banner.isActive,
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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [form, setForm] = useState<BannerFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/banners", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminBannerResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu banner."));
      }

      setBanners(Array.isArray(payload.banners) ? payload.banners : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị banner.";
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
      const endpoint = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          subtitle: form.subtitle,
          imageUrl: form.imageUrl,
          ctaLabel: form.ctaLabel,
          ctaHref: form.ctaHref,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        }),
      });

      const payload = (await response.json()) as {
        warning?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể lưu banner."));
      }

      const success = editingId ? "Đã cập nhật banner." : "Đã tạo banner mới.";
      setSuccessMessage(payload.warning ? `${success} ${payload.warning}` : success);
      resetForm();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu banner.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (banner: AdminBanner) => {
    if (!window.confirm(`Xóa banner "${banner.title}"?`)) {
      return;
    }

    setDeletingId(banner.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        warning?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể xóa banner."));
      }

      if (editingId === banner.id) {
        resetForm();
      }

      const success = "Đã xóa banner.";
      setSuccessMessage(payload.warning ? `${success} ${payload.warning}` : success);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa banner.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">Quản lý banner</h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Quản trị slider trang chủ, upload ảnh trực tiếp lên R2 và sắp xếp thứ tự hiển thị.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">
            {editingId ? "Sửa banner" : "Thêm banner mới"}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tiêu đề banner *</span>
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Ví dụ: Nội thất hiện đại cho phòng khách"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Slug (để trống sẽ tự tạo)</span>
                <input
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="banner-phong-khach"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Mô tả ngắn (subtitle)</span>
                <input
                  value={form.subtitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Nơi ý tưởng trở thành hiện thực"
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

              <div className="space-y-1 md:col-span-2">
                <label className="space-y-1 block">
                  <span className="text-[13px] font-medium text-[#363c47]">Ảnh banner (URL) *</span>
                  <input
                    required
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                    placeholder="https://..."
                  />
                </label>
                <R2ImageUploadField
                  value={form.imageUrl}
                  folder="banners"
                  onUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                />
              </div>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Nhãn nút CTA</span>
                <input
                  value={form.ctaLabel}
                  onChange={(event) => setForm((prev) => ({ ...prev, ctaLabel: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Xem ngay"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Link CTA</span>
                <input
                  value={form.ctaHref}
                  onChange={(event) => setForm((prev) => ({ ...prev, ctaHref: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="/bo-suu-tap/noi-that-phong-khach"
                />
              </label>
            </div>

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
                {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật banner" : "Thêm banner"}
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
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách banner</h2>
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
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách banner...</p>
          ) : banners.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có banner nào trong database.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[980px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Banner</th>
                    <th className="px-3 py-2.5 font-semibold">Slug</th>
                    <th className="px-3 py-2.5 font-semibold">CTA</th>
                    <th className="px-3 py-2.5 font-semibold">Thứ tự</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id} className="border-t border-[#ececf1] align-top">
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-3">
                          <div className="h-[56px] w-[96px] shrink-0 overflow-hidden rounded-lg border border-[#d9dde5] bg-[#f3f4f7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={banner.imageUrl}
                              alt={banner.subtitle?.trim() || banner.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-[#1f2329]">{banner.title}</p>
                            {banner.subtitle && (
                              <p className="mt-1 text-[12px] text-[#6a7280]">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#323843]">/{banner.slug}</td>
                      <td className="px-3 py-3 text-[#323843]">
                        {banner.ctaLabel || banner.ctaHref ? (
                          <div className="space-y-1">
                            {banner.ctaLabel && <p className="font-medium">{banner.ctaLabel}</p>}
                            {banner.ctaHref && (
                              <p className="max-w-[220px] truncate text-[12px] text-[#6a7280]">{banner.ctaHref}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8b93a2]">Không có</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#323843]">{banner.sortOrder}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[12px] ${
                            banner.isActive ? "bg-[#e7f8ed] text-[#1f7a42]" : "bg-[#eceff5] text-[#4e5766]"
                          }`}
                        >
                          {banner.isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(banner.id);
                              setForm(toBannerFormState(banner));
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
                            disabled={deletingId === banner.id}
                            onClick={() => {
                              void handleDelete(banner);
                            }}
                            className="rounded-lg border border-[#efb1b1] px-3 py-1.5 text-[13px] font-medium text-[#b03131] transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === banner.id ? "Đang xóa..." : "Xóa"}
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
