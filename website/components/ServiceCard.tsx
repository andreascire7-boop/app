"use client";

import Link from "next/link";
import styles from "./ServiceCard.module.css";
import type { Service } from "@/lib/services";
import { waLink } from "@/lib/site";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";

export default function ServiceCard({ service }: { service: Service }) {
  const { locale } = useLocale();
  const dict = t(locale);
  const message =
    locale === "it"
      ? `Ciao Andrea, sono interessato/a a: ${service.name}. Puoi darmi info?`
      : `Hi Andrea, I'm interested in: ${service.name}. Could you send me more info?`;

  return (
    <div className={`${styles.card} ${service.highlight ? styles.highlight : ""}`}>
      <div className={styles.top}>
        <span className={styles.name}>{service.name}</span>
        <span className={styles.price}>{service.price}</span>
      </div>
      {service.duration && <span className={styles.duration}>{service.duration}</span>}
      <p className={styles.desc}>{service.description}</p>
      <Link href={waLink(message)} target="_blank" className={styles.cta}>
        {dict.servicesPage.bookCta}
      </Link>
    </div>
  );
}
