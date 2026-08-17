"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { site, waLink } from "@/lib/site";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";

export default function Footer() {
  const { locale } = useLocale();
  const dict = t(locale);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <div className={styles.brand}>
            <span className={styles.mark}>AS</span>
            <span className={styles.brandName}>{site.name}</span>
          </div>
          <p>
            {site.tagline}. {site.niche}, {dict.footer.taglineSuffix} {site.city}.
          </p>
        </div>

        <div>
          <span className={styles.heading}>{dict.footer.menuHeading}</span>
          <ul className={styles.list}>
            <li>
              <Link href="/servizi">{dict.nav.servizi}</Link>
            </li>
            <li>
              <Link href="/chi-sono">{dict.nav.chiSono}</Link>
            </li>
            <li>
              <Link href="/contatti">{dict.nav.contatti}</Link>
            </li>
          </ul>
        </div>

        <div>
          <span className={styles.heading}>{dict.footer.contactsHeading}</span>
          <ul className={styles.list}>
            <li>
              <Link href={waLink(dict.whatsappDefaultMessage)} target="_blank">
                WhatsApp {site.phoneDisplay}
              </Link>
            </li>
            <li>
              <Link href={`mailto:${site.email}`}>{site.email}</Link>
            </li>
            <li>
              <Link href={site.instagram} target="_blank">
                Instagram {site.instagramHandle}
              </Link>
            </li>
            <li>
              <span>{site.areaServed}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
        </span>
      </div>
    </footer>
  );
}
