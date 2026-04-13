"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";

type StaffRole = "MEDIA" | "ORDER_STAFF";

type AdminStaffAccount = {
  id: string;
  username: string;
  role: StaffRole;
  roleLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AdminStaffResponse = {
  accounts?: AdminStaffAccount[];
  account?: AdminStaffAccount;
  error?: string;
};

type CreateFormState = {
  username: string;
  role: StaffRole;
  password: string;
  isActive: boolean;
};

type EditFormState = {
  username: string;
  role: StaffRole;
  isActive: boolean;
  newPassword: string;
};

const emptyCreateForm: CreateFormState = {
  username: "",
  role: "MEDIA",
  password: "",
  isActive: true,
};

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

const toEditState = (account: AdminStaffAccount): EditFormState => ({
  username: account.username,
  role: account.role,
  isActive: account.isActive,
  newPassword: "",
});

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

export default function AdminStaffPage() {
  const [accounts, setAccounts] = useState<AdminStaffAccount[]>([]);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [edits, setEdits] = useState<Record<string, EditFormState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminStaffResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải danh sách tài khoản nhân sự."));
      }

      const nextAccounts = Array.isArray(payload.accounts) ? payload.accounts : [];
      setAccounts(nextAccounts);

      const nextEdits: Record<string, EditFormState> = {};
      nextAccounts.forEach((account) => {
        nextEdits[account.id] = toEditState(account);
      });
      setEdits(nextEdits);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách tài khoản nhân sự.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: createForm.username,
          role: createForm.role,
          password: createForm.password,
          isActive: createForm.isActive,
        }),
      });

      const payload = (await response.json()) as AdminStaffResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tạo tài khoản nhân sự."));
      }

      setCreateForm(emptyCreateForm);
      setSuccessMessage("Đã tạo tài khoản nhân sự mới.");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo tài khoản nhân sự.";
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (account: AdminStaffAccount) => {
    const edit = edits[account.id];
    if (!edit) {
      return;
    }

    const payload: {
      username?: string;
      role?: StaffRole;
      isActive?: boolean;
      newPassword?: string;
    } = {};

    const nextUsername = edit.username.trim();
    const nextPassword = edit.newPassword.trim();

    if (nextUsername !== account.username) {
      payload.username = nextUsername;
    }

    if (edit.role !== account.role) {
      payload.role = edit.role;
    }

    if (edit.isActive !== account.isActive) {
      payload.isActive = edit.isActive;
    }

    if (nextPassword) {
      payload.newPassword = nextPassword;
    }

    if (Object.keys(payload).length === 0) {
      setSuccessMessage(`Không có thay đổi cho tài khoản ${account.username}.`);
      setErrorMessage(null);
      return;
    }

    setSavingId(account.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/staff/${account.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json()) as AdminStaffResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(responseBody, "Không thể cập nhật tài khoản nhân sự."));
      }

      setSuccessMessage(`Đã cập nhật tài khoản ${account.username}.`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản nhân sự.";
      setErrorMessage(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (account: AdminStaffAccount) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa tài khoản "${account.username}" không?`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(account.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/staff/${account.id}`, {
        method: "DELETE",
      });

      const responseBody = (await response.json()) as AdminStaffResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(responseBody, "Không thể xóa tài khoản nhân sự."));
      }

      setSuccessMessage(`Đã xóa tài khoản ${account.username}.`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa tài khoản nhân sự.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">
            Quản lý tài khoản nhân sự
          </h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Tạo tài khoản Media hoặc Nhân viên đơn hàng trực tiếp từ trang quản trị. Không cần thêm vào .env.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[18px] font-semibold text-[#222]">Tạo tài khoản nhân sự mới</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreate}>
            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Tên đăng nhập *</span>
              <input
                required
                value={createForm.username}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, username: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="media.team"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Vai trò *</span>
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, role: event.target.value as StaffRole }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="MEDIA">Media</option>
                <option value="ORDER_STAFF">Nhân viên đơn hàng</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Mật khẩu *</span>
              <input
                required
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                }
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Tối thiểu 8 ký tự"
              />
            </label>

            <label className="inline-flex items-center gap-2 pt-7 text-[14px] text-[#2f3642]">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
                className="h-4 w-4 rounded border-[#cdd1d8]"
              />
              Kích hoạt ngay
            </label>

            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-[#1f2329] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#323843] disabled:cursor-not-allowed disabled:bg-[#9199a8]"
              >
                {isCreating ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </form>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-[#f0a7a7] bg-[#fff0f0] px-3 py-2 text-[14px] text-[#b11f1f]">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-xl border border-[#b8e4c3] bg-[#f0fff5] px-3 py-2 text-[14px] text-[#1e7b3f]">
              {successMessage}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách tài khoản nhân sự</h2>
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
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải dữ liệu tài khoản nhân sự...</p>
          ) : accounts.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có tài khoản nhân sự nào.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[1200px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Tài khoản</th>
                    <th className="px-3 py-2.5 font-semibold">Vai trò</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Reset mật khẩu</th>
                    <th className="px-3 py-2.5 font-semibold">Thời gian</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const edit = edits[account.id] ?? toEditState(account);
                    return (
                      <tr key={account.id} className="border-t border-[#ececf1] align-top">
                        <td className="px-3 py-3">
                          <input
                            value={edit.username}
                            onChange={(event) =>
                              setEdits((prev) => ({
                                ...prev,
                                [account.id]: { ...edit, username: event.target.value },
                              }))
                            }
                            className="w-[250px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <select
                            value={edit.role}
                            onChange={(event) =>
                              setEdits((prev) => ({
                                ...prev,
                                [account.id]: { ...edit, role: event.target.value as StaffRole },
                              }))
                            }
                            className="w-[190px] rounded-lg border border-[#cdd1d8] bg-white px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                          >
                            <option value="MEDIA">Media</option>
                            <option value="ORDER_STAFF">Nhân viên đơn hàng</option>
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <label className="inline-flex items-center gap-2 text-[13px] text-[#2f3642]">
                            <input
                              type="checkbox"
                              checked={edit.isActive}
                              onChange={(event) =>
                                setEdits((prev) => ({
                                  ...prev,
                                  [account.id]: { ...edit, isActive: event.target.checked },
                                }))
                              }
                              className="h-4 w-4 rounded border-[#cdd1d8]"
                            />
                            {edit.isActive ? (
                              <span className="rounded-full bg-[#e8f8ec] px-2 py-0.5 text-[11px] font-semibold text-[#1f7a43]">
                                Đang hoạt động
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#fff1f1] px-2 py-0.5 text-[11px] font-semibold text-[#b42318]">
                                Đang khóa
                              </span>
                            )}
                          </label>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="password"
                            value={edit.newPassword}
                            onChange={(event) =>
                              setEdits((prev) => ({
                                ...prev,
                                [account.id]: { ...edit, newPassword: event.target.value },
                              }))
                            }
                            className="w-[220px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                            placeholder="Mật khẩu mới (>= 8 ký tự)"
                          />
                        </td>

                        <td className="px-3 py-3 text-[12px] text-[#6a7280]">
                          <p>Tạo: {formatDateTime(account.createdAt)}</p>
                          <p className="mt-1">Cập nhật: {formatDateTime(account.updatedAt)}</p>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                void handleSave(account);
                              }}
                              disabled={savingId === account.id}
                              className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingId === account.id ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDelete(account);
                              }}
                              disabled={deletingId === account.id}
                              className="rounded-lg border border-[#e2b6b6] px-3 py-1.5 text-[13px] font-medium text-[#9d2f2f] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === account.id ? "Đang xóa..." : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
