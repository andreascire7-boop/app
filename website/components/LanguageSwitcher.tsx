"use client";

import styles from "./LanguageSwitcher.module.css";
import { useLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const dict = t(locale);

  return (
    <div className={styles.wrap}>
      <select
        aria-label={dict.languageLabel}
        className={styles.select}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="it">IT</option>
        <option value="en">EN</option>
      </select>
      <svg className={styles.arrow} width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
