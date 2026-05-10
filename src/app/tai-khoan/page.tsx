"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import SiteHeader from "@/components/SiteHeader";
import { dispatchAuthUpdated } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type MeResponse = {
  authenticated: boolean;
  user?: AuthUser;
};

type AuthResponse = {
  user?: AuthUser;
  message?: string;
  error?: string;
};

type AccountOrderItem = {
  id: string;
  productName: string;
  optionSummary: string | null;
  quantity: number;
  lineTotal: number;
};

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  fulfillmentStatus: string;
  fulfillmentStatusLabel: string;
  grandTotal: number;
  customerNote: string | null;
  createdAt: string;
  itemCount: number;
  items: AccountOrderItem[];
};

type AccountOrdersResponse = {
  orders?: AccountOrder[];
  error?: string;
};

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google đăng nhập chưa được cấu hình đầy đủ.",
  google_access_denied: "Bạn đã hủy đăng nhập Google.",
  google_state_invalid: "Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.",
  google_exchange_failed: "Không thể xác thực với Google lúc này.",
  google_profile_failed: "Không lấy được thông tin tài khoản Google.",
  google_email_unverified: "Email Google chưa được xác minh.",
  google_callback_failed: "Đăng nhập Google thất bại. Vui lòng thử lại.",
};

const OAUTH_SUCCESS_MESSAGES: Record<string, string> = {
  google_success: "Đăng nhập Google thành công.",
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusToneByCode: Record<string, string> = {
  PENDING: "bg-[#f8f1cf] text-[#8b6d14] border-[#ead89a]",
  CONFIRMED: "bg-[#eaf4ff] text-[#1f62a8] border-[#c5dcf3]",
  PROCESSING: "bg-[#efe9ff] text-[#5943a5] border-[#d8cbff]",
  SHIPPED: "bg-[#e7f5ff] text-[#0a6f8c] border-[#bee5f7]",
  DELIVERED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  COMPLETED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
  REFUNDED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  FAILED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const paymentToneByCode: Record<string, string> = {
  UNPAID: "bg-[#fff7de] text-[#8b6d14] border-[#ecdca2]",
  AUTHORIZED: "bg-[#eef3ff] text-[#334eb2] border-[#d2dcfb]",
  PAID: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  PARTIALLY_REFUNDED: "bg-[#f3efff] text-[#5d45a5] border-[#ddd3fb]",
  REFUNDED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  FAILED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const fulfillmentToneByCode: Record<string, string> = {
  PENDING: "bg-[#fff7de] text-[#8b6d14] border-[#ecdca2]",
  PACKING: "bg-[#eef3ff] text-[#334eb2] border-[#d2dcfb]",
  SHIPPED: "bg-[#e7f5ff] text-[#0a6f8c] border-[#bee5f7]",
  DELIVERED: "bg-[#e8f8ec] text-[#1f7a43] border-[#bde7c8]",
  RETURNED: "bg-[#f4f4f5] text-[#3f4754] border-[#d6d8de]",
  CANCELED: "bg-[#fff1f1] text-[#b42318] border-[#f1c1c1]",
};

const isContactPrice = (value: number) => value <= 0;

export default function AccountPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const currentUserId = currentUser?.id ?? null;

  useEffect(() => {
    let ignore = false;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as MeResponse;

        if (!ignore && payload.authenticated && payload.user) {
          setCurrentUser(payload.user);
        }
      } catch {
        if (!ignore) {
          setCurrentUser(null);
        }
      } finally {
        if (!ignore) {
          setCheckingSession(false);
        }
      }
    };

    void loadSession();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setOrders([]);
      setOrdersError("");
      setLoadingOrders(false);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      setLoadingOrders(true);
      setOrdersError("");

      try {
        const response = await fetch("/api/account/orders", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as AccountOrdersResponse;

        if (ignore) {
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            setCurrentUser(null);
            setOrders([]);
            setOrdersError("");
          } else {
            setOrdersError(payload.error ?? "Không thể tải lịch sử đơn hàng.");
          }
          return;
        }

        setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      } catch {
        if (!ignore) {
          setOrdersError("Không thể tải lịch sử đơn hàng lúc này.");
        }
      } finally {
        if (!ignore) {
          setLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const oauthErrorCode = url.searchParams.get("oauthError");
    const oauthStatus = url.searchParams.get("oauth");

    if (!oauthErrorCode && !oauthStatus) {
      return;
    }

    if (oauthErrorCode) {
      setErrorMessage(OAUTH_ERROR_MESSAGES[oauthErrorCode] ?? "Đăng nhập Google thất bại.");
      setSuccessMessage("");
    }

    if (oauthStatus) {
      const message = OAUTH_SUCCESS_MESSAGES[oauthStatus];
      if (message) {
        setErrorMessage("");
        setSuccessMessage(message);
      }
    }

    url.searchParams.delete("oauthError");
    url.searchParams.delete("oauth");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const modeLabel = useMemo(() => {
    if (mode === "register") {
      return {
        submit: "Đăng ký",
        switchPrompt: "Bạn đã có tài khoản?",
        switchAction: "Đăng nhập tại đây.",
      };
    }

    return {
      submit: "Đăng nhập",
      switchPrompt: "Bạn chưa có tài khoản?",
      switchAction: "Đăng ký tại đây.",
    };
  }, [mode]);

  const handleChangeField = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? {
              fullName: formState.fullName,
              email: formState.email,
              password: formState.password,
              confirmPassword: formState.confirmPassword,
            }
          : {
              email: formState.email,
              password: formState.password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setErrorMessage(data.error ?? "Không thể xử lý yêu cầu lúc này.");
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
      }
      dispatchAuthUpdated();

      setSuccessMessage(data.message ?? "Xử lý thành công.");
      setFormState((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch {
      setErrorMessage("Không kết nối được tới máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setErrorMessage(data.error ?? "Không thể đăng xuất lúc này.");
        return;
      }

      setCurrentUser(null);
      setOrders([]);
      setFormState(initialFormState);
      setMode("login");
      setSuccessMessage("Bạn đã đăng xuất.");
      dispatchAuthUpdated();
    } catch {
      setErrorMessage("Không thể kết nối để đăng xuất.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f4f4f5] py-7 md:py-8">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
          <nav className="mb-8 flex items-center gap-2.5 text-[14px] text-[#737b88] md:text-[15px]">
            <Link href="/" className="transition hover:text-[#4f5968]">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-[#c4a235]">Tài khoản</span>
          </nav>

          <section className="mx-auto w-full max-w-[860px] border border-[#ececec] bg-[#f4f4f5] p-4 md:p-6">
            <h1 className="text-center text-[28px] font-light tracking-[0.02em] text-[#20242a] md:text-[38px]">
              Tài khoản
            </h1>
            <div className="mx-auto mt-3 h-[3px] w-[92px] bg-[#e5cf62]" />
            <div className="mt-5 border-t border-[#d9d9d9]" />

            {checkingSession ? (
              <div className="py-10 text-center text-[15px] text-[#6a7280] md:text-[16px]">
                Đang kiểm tra phiên đăng nhập...
              </div>
            ) : currentUser ? (
              <div className="mt-7 space-y-5">
                <div className="space-y-4 rounded-lg border border-[#e0e0e0] bg-white p-5 md:p-6">
                  <p className="text-[20px] font-semibold text-[#2b3442]">Bạn đã đăng nhập</p>
                  <p className="text-[15px] text-[#4a5260] md:text-[16px]">
                    Xin chào <span className="font-semibold">{currentUser.fullName || "bạn"}</span>
                  </p>
                  <p className="text-[14px] text-[#636b78]">{currentUser.email}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={submitting}
                      className="rounded bg-[#e8d55d] px-5 py-2.5 text-[14px] font-semibold text-[#1f2329] transition hover:bg-[#dec640] disabled:cursor-not-allowed disabled:opacity-65 md:text-[15px]"
                    >
                      Đăng xuất
                    </button>
                    <Link
                      href="/tra-cuu-don-hang"
                      className="text-[14px] font-medium text-[#2e3744] underline underline-offset-4"
                    >
                      Tra cứu đơn hàng
                    </Link>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e0e0e0] bg-white p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[22px] font-semibold text-[#2b3442]">Lịch sử đơn hàng</h2>
                    <Link href="/san-pham-moi" className="text-[14px] font-medium text-[#2e3744] underline underline-offset-4">
                      Tiếp tục mua sắm
                    </Link>
                  </div>

                  {loadingOrders ? (
                    <p className="mt-4 text-[14px] text-[#6a7280]">Đang tải lịch sử đơn hàng...</p>
                  ) : ordersError ? (
                    <p className="mt-4 rounded-lg border border-[#f2b7b7] bg-[#fff3f3] px-3 py-2 text-[13px] font-medium text-[#b42318]">
                      {ordersError}
                    </p>
                  ) : orders.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-[#e9edf4] bg-[#f9fbff] p-4 text-[14px] text-[#5a6475]">
                      Bạn chưa có đơn hàng nào. Sau khi đặt hàng khi đã đăng nhập, đơn sẽ hiển thị tại đây.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {orders.map((order) => (
                        <article key={order.id} className="rounded-lg border border-[#e9edf4] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[15px] font-semibold text-[#1f2937]">{order.orderNumber}</p>
                              <p className="text-[12px] text-[#6b7280]">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <p className="text-[15px] font-bold text-[#bf1f15]">{formatVnd(order.grandTotal)}</p>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${statusToneByCode[order.status] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                            >
                              {order.statusLabel}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${paymentToneByCode[order.paymentStatus] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                            >
                              {order.paymentStatusLabel}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${fulfillmentToneByCode[order.fulfillmentStatus] ?? "border-[#d6dbe5] bg-[#f5f7fb] text-[#404a5a]"}`}
                            >
                              {order.fulfillmentStatusLabel}
                            </span>
                          </div>

                          <div className="mt-3 space-y-1 text-[13px] text-[#4f5968]">
                            {order.items.slice(0, 3).map((item) => (
                              <p key={item.id}>
                                {item.productName}
                                {item.optionSummary ? ` (${item.optionSummary})` : ""} x {item.quantity}
                                {": "}
                                {isContactPrice(item.lineTotal) ? "Liên hệ" : formatVnd(item.lineTotal)}
                              </p>
                            ))}
                            {order.items.length > 3 ? (
                              <p className="text-[12px] text-[#6b7280]">+{order.items.length - 3} sản phẩm khác</p>
                            ) : null}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3">
                            <Link
                              href={`/tra-cuu-don-hang?order=${encodeURIComponent(order.orderNumber)}`}
                              className="text-[13px] font-medium text-[#2e3744] underline underline-offset-4"
                            >
                              Xem trạng thái chi tiết
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="mx-auto mt-7 max-w-[760px]">
                {mode === "register" ? (
                  <div className="mb-5">
                    <label className="mb-2 block text-[15px] font-semibold text-[#3f4754] md:text-[16px]" htmlFor="fullName">
                      Họ và tên
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formState.fullName}
                      onChange={(event) => handleChangeField("fullName", event.target.value)}
                      placeholder="Nhập họ tên"
                      className="w-full rounded-[4px] border border-[#d9d9d9] bg-[#f4f4f5] px-4 py-3 text-[15px] leading-none text-[#252c36] outline-none transition placeholder:text-[#ababab] focus:border-[#c3a326] md:text-[16px]"
                    />
                  </div>
                ) : null}

                <div className="mb-5">
                  <label className="mb-2 block text-[15px] font-semibold text-[#3f4754] md:text-[16px]" htmlFor="email">
                    Email<span className="text-[#d85043]">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(event) => handleChangeField("email", event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-[4px] border border-[#d9d9d9] bg-[#f4f4f5] px-4 py-3 text-[15px] leading-none text-[#252c36] outline-none transition placeholder:text-[#ababab] focus:border-[#c3a326] md:text-[16px]"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-[15px] font-semibold text-[#3f4754] md:text-[16px]" htmlFor="password">
                    Mật khẩu<span className="text-[#d85043]">*</span>
                  </label>
                  <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-[#f4f4f5] pr-3 transition focus-within:border-[#c3a326]">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formState.password}
                      onChange={(event) => handleChangeField("password", event.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full border-0 bg-transparent px-4 py-3 text-[15px] leading-none text-[#252c36] outline-none placeholder:text-[#ababab] md:text-[16px]"
                    />
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#1f232a] md:text-[13px]"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                {mode === "register" ? (
                  <div className="mb-5">
                    <label
                      className="mb-2 block text-[15px] font-semibold text-[#3f4754] md:text-[16px]"
                      htmlFor="confirmPassword"
                    >
                      Xác nhận mật khẩu<span className="text-[#d85043]">*</span>
                    </label>
                    <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-[#f4f4f5] pr-3 transition focus-within:border-[#c3a326]">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formState.confirmPassword}
                        onChange={(event) => handleChangeField("confirmPassword", event.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full border-0 bg-transparent px-4 py-3 text-[15px] leading-none text-[#252c36] outline-none placeholder:text-[#ababab] md:text-[16px]"
                      />
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-[#1f232a] md:text-[13px]"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                      >
                        {showConfirmPassword ? "Ẩn" : "Hiện"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {errorMessage ? <p className="mb-4 text-[14px] font-medium text-[#cf3d3d]">{errorMessage}</p> : null}
                {successMessage ? (
                  <p className="mb-4 text-[14px] font-medium text-[#267a46]">{successMessage}</p>
                ) : null}

                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-[#e8d55d] px-8 py-3 text-[16px] font-semibold uppercase tracking-[0.02em] text-[#1f2329] transition hover:bg-[#dec640] disabled:cursor-not-allowed disabled:opacity-65 md:text-[20px]"
                  >
                    {submitting ? "Đang xử lý..." : modeLabel.submit}
                  </button>
                </div>

                <div className="mt-5 border-t border-[#d9d9d9] pt-5 text-center text-[15px] text-[#2f3745]">
                  {modeLabel.switchPrompt}{" "}
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-4"
                    onClick={() => {
                      setMode((prev) => (prev === "login" ? "register" : "login"));
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                  >
                    {modeLabel.switchAction}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
