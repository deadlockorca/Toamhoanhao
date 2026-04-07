"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";
import R2ImageUploadField from "@/components/admin/R2ImageUploadField";

type ProductTab = "NEW" | "BEST" | "SALE";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imageUrls: string[];
  shortDescription: string | null;
  description: string | null;
  specs: Array<{
    id: string;
    name: string;
    value: string;
    sortOrder: number;
  }>;
  showContactPrice: boolean;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  tab: ProductTab;
  inStock: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
};

type AdminListResponse = {
  products?: AdminProduct[];
  categories?: AdminCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    search: string;
    categoryId: string;
    tab: ProductTab | null;
  };
  error?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  imageUrl: string;
  imageUrls: string[];
  shortDescription: string;
  description: string;
  specs: Array<{
    name: string;
    value: string;
  }>;
  showContactPrice: boolean;
  price: string;
  originalPrice: string;
  badge: string;
  tab: ProductTab;
  inStock: boolean;
  isFeatured: boolean;
  categoryId: string;
};

const MAX_PRODUCT_IMAGES = 5;
const MAX_PRODUCT_SPECS = 30;

const tabOptions: Array<{ value: ProductTab; label: string }> = [
  { value: "NEW", label: "Sản phẩm mới" },
  { value: "BEST", label: "Bán chạy nhất" },
  { value: "SALE", label: "Đang giảm giá" },
];

const emptyFormState: ProductFormState = {
  name: "",
  slug: "",
  imageUrl: "",
  imageUrls: [""],
  shortDescription: "",
  description: "",
  specs: [{ name: "", value: "" }],
  showContactPrice: false,
  price: "",
  originalPrice: "",
  badge: "",
  tab: "NEW",
  inStock: true,
  isFeatured: false,
  categoryId: "",
};

const mapProductToFormState = (product: AdminProduct): ProductFormState => ({
  imageUrls:
    product.imageUrls.length > 0
      ? product.imageUrls.slice(0, MAX_PRODUCT_IMAGES)
      : product.imageUrl
        ? [product.imageUrl]
        : [""],
  name: product.name,
  slug: product.slug,
  imageUrl: product.imageUrl ?? "",
  shortDescription: product.shortDescription ?? "",
  description: product.description ?? "",
  specs:
    product.specs.length > 0
      ? product.specs
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((spec) => ({ name: spec.name, value: spec.value }))
      : [{ name: "", value: "" }],
  showContactPrice: product.showContactPrice,
  price: String(product.price),
  originalPrice: product.originalPrice !== null ? String(product.originalPrice) : "",
  badge: product.badge ?? "",
  tab: product.tab,
  inStock: product.inStock,
  isFeatured: product.isFeatured,
  categoryId: product.categoryId ?? "",
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

const getCleanImageUrls = (imageUrls: string[]) => {
  const uniqueUrls: string[] = [];
  for (const url of imageUrls) {
    const cleaned = url.trim();
    if (!cleaned) {
      continue;
    }
    if (uniqueUrls.includes(cleaned)) {
      continue;
    }
    uniqueUrls.push(cleaned);
    if (uniqueUrls.length >= MAX_PRODUCT_IMAGES) {
      break;
    }
  }
  return uniqueUrls;
};

const getCleanSpecs = (specs: Array<{ name: string; value: string }>) => {
  const cleanedSpecs: Array<{ name: string; value: string }> = [];

  for (const spec of specs) {
    const name = spec.name.trim();
    const value = spec.value.trim();

    if (!name && !value) {
      continue;
    }

    cleanedSpecs.push({ name, value });

    if (cleanedSpecs.length >= MAX_PRODUCT_SPECS) {
      break;
    }
  }

  return cleanedSpecs;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterTab, setFilterTab] = useState<"" | ProductTab>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState<ProductFormState>(emptyFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(currentPage));
      searchParams.set("limit", String(pageSize));
      if (searchQuery) {
        searchParams.set("search", searchQuery);
      }
      if (filterCategoryId) {
        searchParams.set("categoryId", filterCategoryId);
      }
      if (filterTab) {
        searchParams.set("tab", filterTab);
      }

      const response = await fetch(`/api/admin/products?${searchParams.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminListResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu quản trị."));
      }

      setProducts(Array.isArray(payload.products) ? payload.products : []);
      setCategories(Array.isArray(payload.categories) ? payload.categories : []);
      const pagination = payload.pagination;
      if (pagination) {
        setTotalProducts(pagination.total);
        setTotalPages(pagination.totalPages);
        if (pagination.page !== currentPage) {
          setCurrentPage(pagination.page);
        }
      } else {
        setTotalProducts(Array.isArray(payload.products) ? payload.products.length : 0);
        setTotalPages(1);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị sản phẩm.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterCategoryId, filterTab]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm(emptyFormState);
    setEditingId(null);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilterCategoryId("");
    setFilterTab("");
    setCurrentPage(1);
  };

  const updateImageAt = (index: number, value: string) => {
    setForm((prev) => {
      const nextImageUrls = [...prev.imageUrls];
      nextImageUrls[index] = value;
      return {
        ...prev,
        imageUrls: nextImageUrls,
        imageUrl: (nextImageUrls[0] ?? "").trim(),
      };
    });
  };

  const addImageSlot = () => {
    setForm((prev) => {
      if (prev.imageUrls.length >= MAX_PRODUCT_IMAGES) {
        return prev;
      }
      return {
        ...prev,
        imageUrls: [...prev.imageUrls, ""],
      };
    });
  };

  const removeImageSlot = (index: number) => {
    setForm((prev) => {
      const nextImageUrls = prev.imageUrls.filter((_, currentIndex) => currentIndex !== index);
      if (nextImageUrls.length === 0) {
        nextImageUrls.push("");
      }

      return {
        ...prev,
        imageUrls: nextImageUrls,
        imageUrl: (nextImageUrls[0] ?? "").trim(),
      };
    });
  };

  const updateSpecAt = (index: number, key: "name" | "value", value: string) => {
    setForm((prev) => {
      const nextSpecs = [...prev.specs];
      const current = nextSpecs[index] ?? { name: "", value: "" };
      nextSpecs[index] = {
        ...current,
        [key]: value,
      };

      return {
        ...prev,
        specs: nextSpecs,
      };
    });
  };

  const addSpecRow = () => {
    setForm((prev) => {
      if (prev.specs.length >= MAX_PRODUCT_SPECS) {
        return prev;
      }

      return {
        ...prev,
        specs: [...prev.specs, { name: "", value: "" }],
      };
    });
  };

  const removeSpecRow = (index: number) => {
    setForm((prev) => {
      const nextSpecs = prev.specs.filter((_, currentIndex) => currentIndex !== index);
      if (nextSpecs.length === 0) {
        nextSpecs.push({ name: "", value: "" });
      }

      return {
        ...prev,
        specs: nextSpecs,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const cleanImageUrls = getCleanImageUrls(form.imageUrls);
      const cleanSpecs = getCleanSpecs(form.specs);
      const primaryImageUrl = cleanImageUrls[0] ?? "";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          imageUrl: primaryImageUrl,
          imageUrls: cleanImageUrls,
          shortDescription: form.shortDescription,
          description: form.description,
          specs: cleanSpecs,
          showContactPrice: form.showContactPrice,
          price: form.price,
          originalPrice: form.originalPrice,
          badge: form.badge,
          tab: form.tab,
          inStock: form.inStock,
          isFeatured: form.isFeatured,
          categoryId: form.categoryId,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể lưu sản phẩm."));
      }

      setSuccessMessage(editingId ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm mới.");
      resetForm();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu sản phẩm.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    const shouldDelete = window.confirm(`Xóa sản phẩm "${product.name}"?`);
    if (!shouldDelete) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingId(product.id);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể xóa sản phẩm."));
      }

      if (editingId === product.id) {
        resetForm();
      }

      setSuccessMessage("Đã xóa sản phẩm.");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa sản phẩm.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">Quản lý sản phẩm</h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Bạn có thể thêm, sửa, xóa sản phẩm trực tiếp từ đây. Trang này hiện chưa bật đăng nhập,
            nên chỉ dùng nội bộ.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">
            {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tên sản phẩm *</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Ví dụ: Sofa Bed Manhattan"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Slug (để trống sẽ tự tạo)</span>
                <input
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="sofa-bed-manhattan"
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-[14px] text-[#2e3440]">
                  <input
                    type="checkbox"
                    checked={form.showContactPrice}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, showContactPrice: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-[#cdd1d8]"
                  />
                  Không hiển thị giá, thay bằng chữ &quot;Liên Hệ&quot;
                </label>
                <p className="text-[12px] text-[#66707f]">
                  Bật tùy chọn này nếu bạn muốn ẩn giá bán và giá gốc trên website.
                </p>
              </div>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">
                  Giá bán {form.showContactPrice ? "(đang ẩn)" : "*"}
                </span>
                <input
                  required={!form.showContactPrice}
                  disabled={form.showContactPrice}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#8a929e]"
                  placeholder={form.showContactPrice ? "Liên Hệ" : "12490000"}
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">
                  Giá gốc {form.showContactPrice ? "(đang ẩn)" : ""}
                </span>
                <input
                  disabled={form.showContactPrice}
                  inputMode="numeric"
                  value={form.originalPrice}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, originalPrice: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#8a929e]"
                  placeholder={form.showContactPrice ? "Liên Hệ" : "14100000"}
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#363c47]">
                    Ảnh sản phẩm (tối đa {MAX_PRODUCT_IMAGES} ảnh)
                  </span>
                  <span className="text-[12px] text-[#66707f]">
                    {getCleanImageUrls(form.imageUrls).length}/{MAX_PRODUCT_IMAGES} ảnh hợp lệ
                  </span>
                </div>

                <div className="space-y-3 rounded-xl border border-[#dce0e7] bg-[#fbfcfd] p-3">
                  {form.imageUrls.map((imageUrl, index) => (
                    <div
                      key={`product-image-${index}`}
                      className="rounded-lg border border-[#e4e7ed] bg-white p-3"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[12px] font-medium text-[#3c4453]">
                          Ảnh {index + 1}
                          {index === 0 ? " (ảnh chính)" : ""}
                        </p>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeImageSlot(index)}
                            className="rounded-md border border-[#efb1b1] px-2.5 py-1 text-[12px] font-medium text-[#b03131] transition hover:bg-[#fff4f4]"
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>

                      <input
                        value={imageUrl}
                        onChange={(event) => updateImageAt(index, event.target.value)}
                        className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                        placeholder={index === 0 ? "/products/p1.jpg" : "https://..."}
                      />

                      <R2ImageUploadField
                        value={imageUrl}
                        folder="products"
                        onUploaded={(url) => updateImageAt(index, url)}
                      />
                    </div>
                  ))}

                  {form.imageUrls.length < MAX_PRODUCT_IMAGES && (
                    <button
                      type="button"
                      onClick={addImageSlot}
                      className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
                    >
                      + Thêm ảnh
                    </button>
                  )}
                </div>
              </div>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Badge</span>
                <input
                  value={form.badge}
                  onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                  placeholder="Mới / Hot / Bán chạy"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Tab hiển thị</span>
                <select
                  value={form.tab}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tab: event.target.value as ProductTab }))
                  }
                  className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                >
                  {tabOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[13px] font-medium text-[#363c47]">Danh mục</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                >
                  <option value="">Không chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[13px] font-medium text-[#363c47]">Mô tả ngắn</span>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, shortDescription: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] leading-6 focus:border-[#222] focus:outline-none"
                  placeholder="Mô tả ngắn hiển thị gần tiêu đề sản phẩm"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[13px] font-medium text-[#363c47]">Mô tả chi tiết</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={8}
                  className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] leading-6 focus:border-[#222] focus:outline-none"
                  placeholder="Mỗi đoạn có thể xuống dòng để hiển thị rõ hơn ở trang chi tiết"
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#363c47]">
                    Thông số sản phẩm (tối đa {MAX_PRODUCT_SPECS} dòng)
                  </span>
                  <span className="text-[12px] text-[#66707f]">
                    {getCleanSpecs(form.specs).length}/{MAX_PRODUCT_SPECS} dòng hợp lệ
                  </span>
                </div>

                <div className="space-y-2 rounded-xl border border-[#dce0e7] bg-[#fbfcfd] p-3">
                  {form.specs.map((spec, index) => (
                    <div
                      key={`product-spec-${index}`}
                      className="rounded-lg border border-[#e4e7ed] bg-white p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[12px] font-medium text-[#3c4453]">Thông số {index + 1}</p>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSpecRow(index)}
                            className="rounded-md border border-[#efb1b1] px-2.5 py-1 text-[12px] font-medium text-[#b03131] transition hover:bg-[#fff4f4]"
                          >
                            Xóa dòng
                          </button>
                        )}
                      </div>

                      <div className="grid gap-2 md:grid-cols-[0.8fr_1.2fr]">
                        <input
                          value={spec.name}
                          onChange={(event) => updateSpecAt(index, "name", event.target.value)}
                          className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                          placeholder="Tên thông số (VD: Kích thước)"
                        />
                        <input
                          value={spec.value}
                          onChange={(event) => updateSpecAt(index, "value", event.target.value)}
                          className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                          placeholder="Giá trị (VD: 220 x 95 x 85 cm)"
                        />
                      </div>
                    </div>
                  ))}

                  {form.specs.length < MAX_PRODUCT_SPECS && (
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
                    >
                      + Thêm thông số
                    </button>
                  )}
                </div>
              </div>
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
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#cdd1d8]"
                />
                Sản phẩm nổi bật
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
                {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
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
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách sản phẩm</h2>
            <button
              type="button"
              onClick={() => {
                void loadData();
              }}
              className="rounded-xl border border-[#cfd3da] px-4 py-2 text-[14px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
            >
              Tải lại dữ liệu
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.5fr_auto]">
            <label className="space-y-1">
              <span className="text-[12px] font-medium text-[#4b5565]">Tìm theo tên / slug</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyFilters();
                  }
                }}
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Ví dụ: sofa, ban-an..."
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-medium text-[#4b5565]">Danh mục</span>
              <select
                value={filterCategoryId}
                onChange={(event) => setFilterCategoryId(event.target.value)}
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={`filter-category-${category.id}`} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-medium text-[#4b5565]">Tab</span>
              <select
                value={filterTab}
                onChange={(event) => setFilterTab(event.target.value as "" | ProductTab)}
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="">Tất cả tab</option>
                {tabOptions.map((option) => (
                  <option key={`filter-tab-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-medium text-[#4b5565]">Mỗi trang</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setCurrentPage(1);
                  setPageSize(Number(event.target.value));
                }}
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-xl bg-[#1f2329] px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-[#323843]"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-[#cfd3da] px-3 py-2 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
              >
                Xóa lọc
              </button>
            </div>
          </div>

          {!isLoading && (
            <p className="mt-3 text-[13px] text-[#5f6570]">
              Hiển thị{" "}
              <span className="font-semibold text-[#2f3642]">
                {totalProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-[#2f3642]">
                {totalProducts === 0 ? 0 : Math.min((currentPage - 1) * pageSize + products.length, totalProducts)}
              </span>{" "}
              trên tổng{" "}
              <span className="font-semibold text-[#2f3642]">{totalProducts}</span> sản phẩm.
            </p>
          )}

          {isLoading ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách sản phẩm...</p>
          ) : products.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có sản phẩm nào trong database.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[980px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Tên sản phẩm</th>
                    <th className="px-3 py-2.5 font-semibold">Tab</th>
                    <th className="px-3 py-2.5 font-semibold">Giá</th>
                    <th className="px-3 py-2.5 font-semibold">Danh mục</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-[#ececf1] align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-[#1f2329]">{product.name}</p>
                        <p className="mt-1 text-[12px] text-[#6a7280]">/{product.slug}</p>
                      </td>
                      <td className="px-3 py-3 text-[#323843]">{product.tab}</td>
                      <td className="px-3 py-3 text-[#323843]">
                        {product.showContactPrice ? (
                          <span className="font-semibold text-[#bf1f15]">Liên Hệ</span>
                        ) : (
                          <>
                            {currencyFormatter.format(product.price)}
                            {product.originalPrice !== null && (
                              <span className="ml-2 text-[12px] text-[#8f97a4] line-through">
                                {currencyFormatter.format(product.originalPrice)}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#323843]">
                        {product.categoryName ?? "Chưa gán danh mục"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1 text-[12px]">
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 ${
                              product.inStock
                                ? "bg-[#e7f8ed] text-[#1f7a42]"
                                : "bg-[#fff1f1] text-[#b03131]"
                            }`}
                          >
                            {product.inStock ? "Còn hàng" : "Hết hàng"}
                          </span>
                          {product.isFeatured && (
                            <span className="inline-flex w-fit rounded-full bg-[#f5edff] px-2 py-0.5 text-[#6a39b5]">
                              Nổi bật
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(product.id);
                              setForm(mapProductToFormState(product));
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
                            disabled={deletingId === product.id}
                            onClick={() => {
                              void handleDelete(product);
                            }}
                            className="rounded-lg border border-[#efb1b1] px-3 py-1.5 text-[13px] font-medium text-[#b03131] transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === product.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-[#5f6570]">
                Trang <span className="font-semibold text-[#2f3642]">{currentPage}</span> / {totalPages}
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
                  className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
