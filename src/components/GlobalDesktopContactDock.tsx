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
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3.5 6.8A2.3 2.3 0 0 1 5.8 4.5h12.4a2.3 2.3 0 0 1 2.3 2.3v7.9a2.3 2.3 0 0 1-2.3 2.3h-4l-4.3 3v-3H5.8a2.3 2.3 0 0 1-2.3-2.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h2.8l-2.8 4H11m2-4v4m3.3-4L14 13h2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const toDigits = (value: string) => value.replace(/\D/g, "");

const toTelHref = (phone: string) => {
  const digits = toDigits(phone);
  return digits ? `tel:${digits}` : "tel:";
};

export default function GlobalDesktopContactDock() {
  const envNorthPhone = process.env.NEXT_PUBLIC_CONTACT_NORTH_PHONE?.trim();
  const envSouthPhone = process.env.NEXT_PUBLIC_CONTACT_SOUTH_PHONE?.trim();
  const envSitePhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const envZaloChatUrl = process.env.NEXT_PUBLIC_ZALO_CHAT_URL?.trim();

  const primaryPhone = envSitePhone || envNorthPhone || envSouthPhone || "0901.827.555";
  const northContact = envNorthPhone || primaryPhone;
  const southContact = envSouthPhone || primaryPhone;
  const zaloTargetPhone = toDigits(envNorthPhone || northContact || primaryPhone);
  const zaloHref = envZaloChatUrl || (zaloTargetPhone ? `https://zalo.me/${zaloTargetPhone}` : "#");

  return (
    <div className="fixed bottom-10 right-3 z-[96] hidden flex-col gap-3 lg:flex">
      <a
        href={toTelHref(northContact)}
        aria-label={`Hotline miền Bắc ${northContact}`}
        title={`Hotline miền Bắc: ${northContact}`}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e1c24d] bg-[#ecd14f] text-[#253044] shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:brightness-95"
      >
        <PhoneShortcutIcon />
      </a>

      <a
        href={toTelHref(southContact)}
        aria-label={`Hotline miền Nam ${southContact}`}
        title={`Hotline miền Nam: ${southContact}`}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e1c24d] bg-[#ecd14f] text-[#253044] shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:brightness-95"
      >
        <PhoneShortcutIcon />
      </a>

      <a
        href={zaloHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Zalo Chat"
        title="Zalo Chat"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e1c24d] bg-[#ecd14f] text-[#253044] shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:brightness-95"
      >
        <ZaloShortcutIcon />
      </a>
    </div>
  );
}
