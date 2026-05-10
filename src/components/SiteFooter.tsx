import Image from "next/image";
import Link from "next/link";

type SiteFooterProps = {
  sitePhone?: string;
  northPhone?: string;
  southPhone?: string;
  zaloChatUrl?: string;
};

function PhoneShortcutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6.7 3h3.1L11 7.2 8.8 9.1a13.7 13.7 0 0 0 6.1 6.1l1.9-2.2 4.2 1.2v3.1a1.7 1.7 0 0 1-1.8 1.7A16.2 16.2 0 0 1 5 4.8 1.7 1.7 0 0 1 6.7 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZaloShortcutIcon() {
  return (
    <Image src="/social/zalo.svg" alt="Zalo" width={20} height={20} className="h-5 w-5" />
  );
}

const toDigits = (value: string) => value.replace(/\D/g, "");

const toTelHref = (phone: string) => {
  const digits = toDigits(phone);
  return digits ? `tel:${digits}` : "tel:";
};

export default function SiteFooter({
  sitePhone,
  northPhone,
  southPhone,
  zaloChatUrl,
}: SiteFooterProps) {
  const envNorthPhone = process.env.NEXT_PUBLIC_CONTACT_NORTH_PHONE?.trim();
  const envSouthPhone = process.env.NEXT_PUBLIC_CONTACT_SOUTH_PHONE?.trim();
  const envSitePhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const envZaloChatUrl = process.env.NEXT_PUBLIC_ZALO_CHAT_URL?.trim();

  const primaryPhone = sitePhone?.trim() || envSitePhone || envNorthPhone || envSouthPhone || "0901.827.555";
  const northContact = northPhone?.trim() || envNorthPhone || primaryPhone;
  const southContact = southPhone?.trim() || envSouthPhone || primaryPhone;
  const zaloTargetPhone = toDigits(envNorthPhone || northContact || primaryPhone);
  const zaloHref = zaloChatUrl?.trim() || envZaloChatUrl || (zaloTargetPhone ? `https://zalo.me/${zaloTargetPhone}` : "#");

  return (
    <footer className="border-t border-[#e2e2e5] bg-[#f1f2f4]">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-12 md:px-6 md:pb-8 md:pt-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.15fr_0.9fr_0.9fr_1fr]">
          <section className="space-y-4 text-[#1f2530]">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.02em] md:text-[17px]">Hỗ trợ và liên hệ</h3>
            <p className="text-[15px] leading-tight md:text-[17px]">
              <strong>Hotline:</strong> {primaryPhone}
            </p>
            <p className="text-[15px] leading-tight md:text-[17px]">
              <strong>Email:</strong> hotro.toamhoanhao@gmail.com
            </p>
            <p className="max-w-[720px] text-[14px] leading-[1.55] text-[#2b3240] md:text-[16px]">
              Tổ Ấm Hoàn Hảo là chuỗi bán lẻ và cung cấp giải pháp đồ Nội thất - Trang trí theo phong cách xuất khẩu.
            </p>

            <Link href="/" aria-label="Về trang chủ" className="mx-auto block w-fit pt-2 text-center text-[#c9a22f]">
              <p className="font-serif text-[13px] font-semibold leading-[1.08] tracking-[0.03em] md:text-[16px]">
                <span className="inline-flex items-center gap-[0.2em]">
                  <span>TỔ</span>
                  <span>ẤM</span>
                  <span>HOÀN</span>
                  <span>HẢO</span>
                </span>
              </p>
              <p className="mt-1.5 text-[6px] font-semibold tracking-[0.18em] md:text-[7px]">NỘI THẤT XUẤT KHẨU</p>
            </Link>
          </section>

          <section className="text-[#1f2530]">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.02em] md:text-[17px]">Giới thiệu</h3>
            <ul className="mt-4 space-y-3 text-[14px] leading-[1.35] text-[#2a313d] md:text-[15px]">
              <li>
                <Link href="/gioi-thieu" className="inline-flex transition hover:text-[#947717]">
                  Về Nội Thất Tổ Ấm Hoàn Hảo
                </Link>
              </li>
              <li>
                <Link href="/tuyen-dung" className="inline-flex transition hover:text-[#947717]">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/he-thong-cua-hang" className="inline-flex transition hover:text-[#947717]">
                  Hệ thống cửa hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="inline-flex transition hover:text-[#947717]">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
            </ul>
          </section>

          <section className="text-[#1f2530]">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.02em] md:text-[17px]">Hướng dẫn</h3>
            <ul className="mt-4 space-y-3 text-[14px] leading-[1.35] text-[#2a313d] md:text-[15px]">
              <li>
                <Link href="/dat-hang-online" className="inline-flex transition hover:text-[#947717]">
                  Đặt hàng
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu-don-hang" className="inline-flex transition hover:text-[#947717]">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-giao-hang-lap-dat" className="inline-flex transition hover:text-[#947717]">
                  Giao hàng & Lắp đặt
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-su-dung" className="inline-flex transition hover:text-[#947717]">
                  Sử dụng sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-va-quy-dinh" className="inline-flex transition hover:text-[#947717]">
                  Bảo hành & Bảo trì
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-doi-tra" className="inline-flex transition hover:text-[#947717]">
                  Đổi trả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-luu-kho" className="inline-flex transition hover:text-[#947717]">
                  Lưu kho sản phẩm
                </Link>
              </li>
            </ul>
          </section>

          <section className="text-[#1f2530]">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.02em] md:text-[17px]">
              Kết nối với Tổ Ấm Hoàn Hảo
            </h3>

            <form className="mt-4 flex max-w-[500px] overflow-hidden rounded-[5px] border border-[#d6d7dc] bg-white">
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                className="h-11 w-full bg-transparent px-4 py-3 text-[13px] text-[#20252d] placeholder:text-[#999da6] focus:outline-none md:h-12 md:text-[14px]"
              />
              <button
                type="submit"
                className="shrink-0 bg-[#9c9da2] px-5 text-[13px] font-medium text-[#1e232b] transition hover:bg-[#888b92] md:text-[14px]"
              >
                Đăng ký
              </button>
            </form>

            <div className="mt-6 flex flex-nowrap items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-7 w-7 items-center justify-center transition hover:opacity-90"
              >
                <Image src="/social/facebook.svg" alt="Facebook" width={28} height={28} className="h-7 w-7" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-7 w-7 items-center justify-center transition hover:opacity-90"
              >
                <Image src="/social/instagram.svg" alt="Instagram" width={28} height={28} className="h-7 w-7" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="inline-flex h-7 w-7 items-center justify-center transition hover:opacity-90"
              >
                <Image src="/social/tiktok.svg" alt="TikTok" width={28} height={28} className="h-7 w-7" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="inline-flex h-7 w-7 items-center justify-center transition hover:opacity-90"
              >
                <Image src="/social/youtube.svg" alt="YouTube" width={28} height={28} className="h-7 w-7" />
              </a>
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-[#e1e1e4] pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <p className="text-[11px] text-[#7a7f89] md:text-[12px]">
              © Bản quyền thuộc về Tổ Ấm Hoàn Hảo - Nội thất xuất khẩu
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-[#d7dce4] bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          <a
            href={toTelHref(northContact)}
            className="flex min-h-[66px] items-center justify-center gap-2 border-r border-[#e6eaf1] px-2 text-[#243145]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f5f9] text-[#28374b]">
              <PhoneShortcutIcon />
            </span>
            <span className="text-center text-[11px] font-semibold leading-[1.2]">Liên hệ miền Bắc</span>
          </a>

          <a
            href={zaloHref}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[66px] items-center justify-center gap-2 border-r border-[#e6eaf1] px-2 text-[#015ea7]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ebf6ff] text-[#0074cf]">
              <ZaloShortcutIcon />
            </span>
            <span className="text-center text-[11px] font-semibold leading-[1.2]">Zalo Chat</span>
          </a>

          <a
            href={toTelHref(southContact)}
            className="flex min-h-[66px] items-center justify-center gap-2 px-2 text-[#243145]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f5f9] text-[#28374b]">
              <PhoneShortcutIcon />
            </span>
            <span className="text-center text-[11px] font-semibold leading-[1.2]">Liên hệ miền Nam</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
