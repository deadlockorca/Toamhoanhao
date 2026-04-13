"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import AdminSectionNav from "@/components/AdminSectionNav";

type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  activeSessionsCount: number;
};

type AdminUsersSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
};

type AdminUsersResponse = {
  users?: AdminUser[];
  summary?: AdminUsersSummary;
  error?: string;
};

type UserEditState = {
  fullName: string;
  phone: string;
  isActive: boolean;
  newPassword: string;
};

type UserFilterStatus = "all" | "active" | "inactive";

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

const toUserEditState = (user: AdminUser): UserEditState => ({
  fullName: user.fullName ?? "",
  phone: user.phone ?? "",
  isActive: user.isActive,
  newPassword: "",
});

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Chưa có";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [userEdits, setUserEdits] = useState<Record<string, UserEditState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusDraft, setStatusDraft] = useState<UserFilterStatus>("all");
  const [statusApplied, setStatusApplied] = useState<UserFilterStatus>("all");

  const hasFilters = useMemo(
    () => Boolean(searchApplied.trim()) || statusApplied !== "all",
    [searchApplied, statusApplied],
  );

  const loadData = useCallback(async () => {
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set("take", "200");
      if (searchApplied.trim()) {
        params.set("search", searchApplied.trim());
      }
      if (statusApplied !== "all") {
        params.set("status", statusApplied);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminUsersResponse;
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Không thể tải dữ liệu tài khoản khách hàng."));
      }

      const nextUsers = Array.isArray(payload.users) ? payload.users : [];
      setUsers(nextUsers);
      setSummary(
        payload.summary ?? {
          totalUsers: nextUsers.length,
          activeUsers: nextUsers.filter((item) => item.isActive).length,
          inactiveUsers: nextUsers.filter((item) => !item.isActive).length,
        },
      );

      const nextEdits: Record<string, UserEditState> = {};
      nextUsers.forEach((user) => {
        nextEdits[user.id] = toUserEditState(user);
      });
      setUserEdits(nextEdits);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải dữ liệu tài khoản khách hàng.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchApplied, statusApplied]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSearchApplied(searchDraft.trim());
    setStatusApplied(statusDraft);
  };

  const handleClearFilters = () => {
    setSearchDraft("");
    setStatusDraft("all");
    setSearchApplied("");
    setStatusApplied("all");
    setIsLoading(true);
  };

  const handleSaveUser = async (user: AdminUser) => {
    const edit = userEdits[user.id];
    if (!edit) {
      return;
    }

    const payload: {
      fullName?: string | null;
      phone?: string | null;
      isActive?: boolean;
      newPassword?: string;
    } = {};

    const nextFullName = edit.fullName.trim();
    const nextPhone = edit.phone.trim();
    const nextPassword = edit.newPassword.trim();

    if (nextFullName !== (user.fullName ?? "")) {
      payload.fullName = nextFullName || null;
    }

    if (nextPhone !== (user.phone ?? "")) {
      payload.phone = nextPhone || null;
    }

    if (edit.isActive !== user.isActive) {
      payload.isActive = edit.isActive;
    }

    if (nextPassword) {
      payload.newPassword = nextPassword;
    }

    if (Object.keys(payload).length === 0) {
      setSuccessMessage(`Không có thay đổi nào cho tài khoản ${user.email}.`);
      setErrorMessage(null);
      return;
    }

    setSavingUserId(user.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(parseErrorMessage(responseBody, "Không thể cập nhật tài khoản khách hàng."));
      }

      setSuccessMessage(`Đã cập nhật tài khoản ${user.email}.`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản khách hàng.";
      setErrorMessage(message);
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-[22px] font-semibold text-[#191919] md:text-[28px]">Quản lý tài khoản khách hàng</h1>
          <p className="mt-2 text-[14px] text-[#5f6570]">
            Theo dõi khách đã đăng ký, cập nhật thông tin, khóa/mở tài khoản và đặt lại mật khẩu khi cần.
          </p>
          <div className="mt-4">
            <AdminSectionNav />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#d9d9df] bg-white p-4 shadow-sm">
            <p className="text-[13px] text-[#6b7280]">Tổng tài khoản</p>
            <p className="mt-2 text-[26px] font-semibold text-[#1f2329]">{summary.totalUsers}</p>
          </article>
          <article className="rounded-2xl border border-[#d9d9df] bg-white p-4 shadow-sm">
            <p className="text-[13px] text-[#6b7280]">Đang hoạt động</p>
            <p className="mt-2 text-[26px] font-semibold text-[#1f7a43]">{summary.activeUsers}</p>
          </article>
          <article className="rounded-2xl border border-[#d9d9df] bg-white p-4 shadow-sm">
            <p className="text-[13px] text-[#6b7280]">Đang khóa</p>
            <p className="mt-2 text-[26px] font-semibold text-[#b42318]">{summary.inactiveUsers}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-[#d9d9df] bg-white p-5 shadow-sm md:p-6">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto] md:items-end" onSubmit={handleApplyFilters}>
            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Tìm theo email / tên / số điện thoại</span>
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                className="w-full rounded-xl border border-[#cdd1d8] px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
                placeholder="Ví dụ: khach@gmail.com"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#363c47]">Trạng thái</span>
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value as UserFilterStatus)}
                className="w-full rounded-xl border border-[#cdd1d8] bg-white px-3 py-2.5 text-[14px] focus:border-[#222] focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đang khóa</option>
              </select>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#1f2329] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#323843]"
            >
              Lọc dữ liệu
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-[#cfd3da] px-4 py-2.5 text-[14px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7]"
            >
              Xóa lọc
            </button>
          </form>

          {hasFilters ? (
            <p className="mt-3 text-[13px] text-[#6a7280]">
              Đang lọc theo điều kiện hiện tại. Bấm nút xóa lọc để xem toàn bộ khách hàng.
            </p>
          ) : null}

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
            <h2 className="text-[18px] font-semibold text-[#222]">Danh sách tài khoản khách hàng</h2>
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
            <p className="mt-4 text-[14px] text-[#5f6570]">Đang tải danh sách tài khoản khách hàng...</p>
          ) : users.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#5f6570]">Chưa có tài khoản khách hàng nào phù hợp điều kiện lọc.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#ececf1]">
              <table className="min-w-[1380px] w-full border-collapse text-left text-[14px]">
                <thead className="bg-[#f7f8fb] text-[#3a4250]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Thông tin tài khoản</th>
                    <th className="px-3 py-2.5 font-semibold">Liên hệ</th>
                    <th className="px-3 py-2.5 font-semibold">Đơn hàng</th>
                    <th className="px-3 py-2.5 font-semibold">Phiên đăng nhập</th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Reset mật khẩu</th>
                    <th className="px-3 py-2.5 font-semibold">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const edit = userEdits[user.id] ?? toUserEditState(user);

                    return (
                      <tr key={user.id} className="border-t border-[#ececf1] align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-[#1f2329]">{user.email}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            Tạo lúc: {formatDateTime(user.createdAt)}
                          </p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            Cập nhật: {formatDateTime(user.updatedAt)}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-2">
                            <input
                              value={edit.fullName}
                              onChange={(event) =>
                                setUserEdits((prev) => ({
                                  ...prev,
                                  [user.id]: { ...edit, fullName: event.target.value },
                                }))
                              }
                              className="w-[230px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Họ tên khách hàng"
                            />
                            <input
                              value={edit.phone}
                              onChange={(event) =>
                                setUserEdits((prev) => ({
                                  ...prev,
                                  [user.id]: { ...edit, phone: event.target.value },
                                }))
                              }
                              className="w-[230px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                              placeholder="Số điện thoại"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <p className="font-semibold">{user.ordersCount}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">đơn hàng đã tạo</p>
                        </td>

                        <td className="px-3 py-3 text-[#323843]">
                          <p className="font-semibold">{user.activeSessionsCount}</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">phiên còn hiệu lực</p>
                          <p className="mt-1 text-[12px] text-[#6a7280]">
                            Đăng nhập gần nhất: {formatDateTime(user.lastLoginAt)}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <label className="inline-flex items-center gap-2 text-[13px] text-[#2f3642]">
                            <input
                              type="checkbox"
                              checked={edit.isActive}
                              onChange={(event) =>
                                setUserEdits((prev) => ({
                                  ...prev,
                                  [user.id]: { ...edit, isActive: event.target.checked },
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
                              setUserEdits((prev) => ({
                                ...prev,
                                [user.id]: { ...edit, newPassword: event.target.value },
                              }))
                            }
                            className="w-[220px] rounded-lg border border-[#cdd1d8] px-2 py-1.5 text-[12px] focus:border-[#222] focus:outline-none"
                            placeholder="Mật khẩu mới (>= 8 ký tự)"
                          />
                          <p className="mt-1 text-[11px] text-[#6a7280]">
                            Để trống nếu không muốn đổi mật khẩu.
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              void handleSaveUser(user);
                            }}
                            disabled={savingUserId === user.id}
                            className="rounded-lg border border-[#cfd3da] px-3 py-1.5 text-[13px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingUserId === user.id ? "Đang lưu..." : "Lưu"}
                          </button>
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
