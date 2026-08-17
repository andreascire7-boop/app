"use client";

import Link from "next/link";
import styles from "./WhatsAppButton.module.css";
import { waLink } from "@/lib/site";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";

export default function WhatsAppButton() {
  const { locale } = useLocale();
  const dict = t(locale);

  return (
    <Link
      href={waLink(dict.whatsappDefaultMessage)}
      target="_blank"
      aria-label={dict.nav.whatsapp}
      className={styles.fab}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.54 22 22 17.52 22 12S17.54 2 12.02 2Zm0 18.1c-1.62 0-3.13-.46-4.4-1.26l-.32-.19-3.02.79.81-2.94-.21-.31A8.07 8.07 0 0 1 3.93 12c0-4.46 3.63-8.09 8.09-8.09 4.46 0 8.08 3.63 8.08 8.09 0 4.46-3.62 8.1-8.08 8.1Zm4.44-6.06c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </Link>
  );
}
