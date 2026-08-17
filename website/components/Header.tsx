"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
import { site, waLink } from "@/lib/site";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();
  const dict = t(locale);

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/servizi", label: dict.nav.servizi },
    { href: "/chi-sono", label: dict.nav.chiSono },
    { href: "/contatti", label: dict.nav.contatti },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.mark}>AS</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{site.name}</span>
            <span className={styles.brandTagline}>{site.tagline}</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.navLinks}>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <LanguageSwitcher />
          <Link
            href={waLink(dict.whatsappDefaultMessage)}
            target="_blank"
            className={`btn btn-primary ${styles.cta}`}
          >
            {dict.nav.whatsapp}
          </Link>
          <button
            className={styles.toggle}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>
      </div>

      {open && (
        <div className={`container ${styles.mobileMenu}`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href={waLink(dict.whatsappDefaultMessage)}
            target="_blank"
            className="btn btn-primary"
            onClick={() => setOpen(false)}
          >
            {dict.nav.whatsapp}
          </Link>
        </div>
      )}
    </header>
  );
}
