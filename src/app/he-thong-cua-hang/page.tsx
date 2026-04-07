"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type StoreItem = {
  id: string;
  city: string;
  district: string;
  name: string;
  address: string;
  openHours: string;
  mapEmbed: string;
  mapLink: string;
};

const storeData: StoreItem[] = [
  {
    id: "hn-office",
    city: "Hà Nội",
    district: "Thanh Xuân",
    name: "Văn phòng Hà Nội",
    address:
      "Tầng 5, Tòa nhà Zen Tower, Số 12 đường Khuất Duy Tiến, Phường Thanh Xuân Trung, Quận Thanh Xuân, Thành phố Hà Nội.",
    openHours: "08:30 - 20:30 (Thứ 2 - Chủ nhật)",
    mapEmbed:
      "https://www.google.com/maps?q=T%E1%BA%A7ng%205%2C%20T%C3%B2a%20nh%C3%A0%20Zen%20Tower%2C%20S%E1%BB%91%2012%20%C4%91%C6%B0%E1%BB%9Dng%20Khu%E1%BA%A5t%20Duy%20Ti%E1%BA%BFn%2C%20H%C3%A0%20N%E1%BB%99i&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=T%E1%BA%A7ng+5,+T%C3%B2a+nh%C3%A0+Zen+Tower,+S%E1%BB%91+12+Khu%E1%BA%A5t+Duy+Ti%E1%BA%BFn,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i",
  },
  {
    id: "hcm-office",
    city: "TP. Hồ Chí Minh",
    district: "Phú Lợi",
    name: "Văn phòng TP.HCM",
    address: "Số 15, Đường D2, Khu dân cư Hiệp Phát, Phường Phú Lợi, Thành phố Hồ Chí Minh.",
    openHours: "08:30 - 20:30 (Thứ 2 - Chủ nhật)",
    mapEmbed:
      "https://www.google.com/maps?q=S%E1%BB%91%2015%2C%20%C4%90%C6%B0%E1%BB%9Dng%20D2%2C%20Khu%20d%C3%A2n%20c%C6%B0%20Hi%E1%BB%87p%20Ph%C3%A1t%2C%20Ph%C6%B0%E1%BB%9Dng%20Ph%C3%BA%20L%E1%BB%A3i%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91+15,+%C4%90%C6%B0%E1%BB%9Dng+D2,+Khu+d%C3%A2n+c%C6%B0+Hi%E1%BB%87p+Ph%C3%A1t,+Ph%C6%B0%E1%BB%9Dng+Ph%C3%BA+L%E1%BB%A3i,+Th%C3%A0nh+ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh",
  },
  {
    id: "dong-nai-factory",
    city: "Đồng Nai",
    district: "Long Bình",
    name: "Nhà máy Đồng Nai",
    address: "Số 609, Tổ 3, Khu phố 1, Phường Long Bình, Tỉnh Đồng Nai, Việt Nam.",
    openHours: "08:00 - 17:30 (Thứ 2 - Thứ 7)",
    mapEmbed:
      "https://www.google.com/maps?q=S%E1%BB%91%20609%2C%20T%E1%BB%95%203%2C%20Khu%20ph%E1%BB%91%201%2C%20Ph%C6%B0%E1%BB%9Dng%20Long%20B%C3%ACnh%2C%20%C4%90%E1%BB%93ng%20Nai&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91+609,+T%E1%BB%95+3,+Khu+ph%E1%BB%91+1,+Ph%C6%B0%E1%BB%9Dng+Long+B%C3%ACnh,+%C4%90%E1%BB%93ng+Nai",
  },
];

const makeUnique = (items: string[]) => Array.from(new Set(items));

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-white">
      <path
        d="M12 22c-4-5-6-8.5-6-12a6 6 0 1 1 12 0c0 3.5-2 7-6 12Zm0-8.6a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ opened }: { opened: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-5 w-5 text-[#616a78] transition ${opened ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9.5 12 15l6-5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-[#8b93a1]">
      <path
        d="M12 6v6l3.5 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-[#8b93a1]">
      <path
        d="M12 21c-3.4-4.3-5-7.2-5-10a5 5 0 1 1 10 0c0 2.8-1.6 5.7-5 10Zm0-7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function StoreSystemPage() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [openedStoreId, setOpenedStoreId] = useState<string | null>(storeData[0]?.id ?? null);

  const cityOptions = useMemo(() => makeUnique(storeData.map((item) => item.city)), []);

  const districtOptions = useMemo(() => {
    if (!selectedCity) {
      return [];
    }
    return makeUnique(storeData.filter((item) => item.city === selectedCity).map((item) => item.district));
  }, [selectedCity]);

  const filteredStores = useMemo(() => {
    return storeData.filter((item) => {
      const cityMatch = selectedCity ? item.city === selectedCity : true;
      const districtMatch = selectedDistrict ? item.district === selectedDistrict : true;
      return cityMatch && districtMatch;
    });
  }, [selectedCity, selectedDistrict]);

  useEffect(() => {
    setSelectedDistrict("");
  }, [selectedCity]);

  useEffect(() => {
    if (filteredStores.length === 0) {
      setOpenedStoreId(null);
      return;
    }

    const hasOpenedStore = filteredStores.some((item) => item.id === openedStoreId);
    if (!hasOpenedStore) {
      setOpenedStoreId(filteredStores[0].id);
    }
  }, [filteredStores, openedStoreId]);

  const activeStore = filteredStores.find((item) => item.id === openedStoreId) ?? filteredStores[0] ?? null;

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#1a1a1a]">
      <SiteHeader />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
          <nav className="mb-8 flex items-center gap-2.5 text-[14px] text-[#737b88] md:text-[15px]">
            <Link href="/" className="transition hover:text-[#4f5968]">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-[#c4a235]">Hệ thống cửa hàng</span>
          </nav>

          <section className="rounded-2xl border border-[#e5e6ea] bg-white p-5 md:p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row">
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="h-11 min-w-[220px] rounded-[6px] border border-[#d5d9e0] bg-white px-3 text-[14px] text-[#364152] outline-none transition focus:border-[#b9982e]"
              >
                <option value="">Chọn tỉnh thành</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={selectedDistrict}
                onChange={(event) => setSelectedDistrict(event.target.value)}
                disabled={!selectedCity}
                className="h-11 min-w-[220px] rounded-[6px] border border-[#d5d9e0] bg-white px-3 text-[14px] text-[#364152] outline-none transition focus:border-[#b9982e] disabled:cursor-not-allowed disabled:bg-[#f2f4f7] disabled:text-[#9aa2af]"
              >
                <option value="">Chọn Quận/Huyện</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              <div className="min-w-0 overflow-hidden pb-2">
                <div className="flex items-center gap-2 rounded-t-[10px] bg-[#fadc4a] px-3 py-2.5">
                  <LocationIcon />
                  <span className="text-[16px] font-bold text-white">Hệ thống cửa hàng</span>
                </div>

                <div className="h-[420px] overflow-y-auto rounded-b-[10px] border border-[#fadc4a] bg-[#f1f1f5] p-2.5">
                  {filteredStores.length > 0 ? (
                    filteredStores.map((store) => {
                      const isOpened = openedStoreId === store.id;

                      return (
                        <article key={store.id} className="mb-4 last:mb-0">
                          <button
                            type="button"
                            onClick={() => setOpenedStoreId((prev) => (prev === store.id ? null : store.id))}
                            className="flex w-full items-center gap-2.5 rounded-[5px] bg-white px-4 py-3.5 text-left"
                          >
                            <h2 className="flex-1 text-[16px] font-semibold text-[#202734]">{store.name}</h2>
                            <ChevronIcon opened={isOpened} />
                          </button>

                          {isOpened ? (
                            <div className="mt-2 rounded-[5px] bg-white px-4 py-3 shadow-[0_4px_15px_rgba(20,25,26,0.2)]">
                              <div className="text-[14px] leading-[1.45] text-[#515968]">
                                <span className="text-[#9aa1ad]">Địa chỉ: </span>
                                {store.address}
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-[14px] text-[#515968]">
                                <ClockIcon />
                                <span>{store.openHours}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-[14px]">
                                <PinIcon />
                                <a
                                  href={store.mapLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#2f3c52] underline underline-offset-2 transition hover:text-[#111827]"
                                >
                                  Xem bản đồ
                                </a>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-[8px] bg-white px-4 py-5 text-[14px] text-[#616b79]">
                      Không có cửa hàng phù hợp với bộ lọc hiện tại.
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="h-full overflow-hidden rounded-[10px] border border-[#e0e4eb] bg-white">
                  {activeStore ? (
                    <iframe
                      title={`Bản đồ - ${activeStore.name}`}
                      src={activeStore.mapEmbed}
                      className="h-[420px] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-[420px] items-center justify-center px-4 text-center text-[14px] text-[#6b7280]">
                      Vui lòng chọn khu vực để xem bản đồ cửa hàng.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
