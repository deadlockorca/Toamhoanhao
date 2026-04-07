"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

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
      setFormState(initialFormState);
      setMode("login");
      setSuccessMessage("Bạn đã đăng xuất.");
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

          <section className="mx-auto w-full max-w-[760px] border border-[#ececec] bg-[#f4f4f5] p-4 md:p-6">
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
            <div className="mx-auto mt-7 max-w-[500px] space-y-4 rounded-lg border border-[#e0e0e0] bg-white p-5 md:p-6">
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
                <Link href="/" className="text-[14px] font-medium text-[#2e3744] underline underline-offset-4">
                  Quay về trang chủ
                </Link>
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

              {mode === "login" ? (
                <p className="mt-4 text-center text-[16px] font-semibold text-[#2e3744]">Quên mật khẩu?</p>
              ) : null}

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
