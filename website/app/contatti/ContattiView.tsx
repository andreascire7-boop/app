"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./contatti.module.css";
import { site, waLink } from "@/lib/site";
import { getServiceCategories } from "@/lib/services";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";
import Reveal from "@/components/Reveal";

type Status = "idle" | "sent";

export default function ContattiPage() {
  const { locale } = useLocale();
  const dict = t(locale);
  const c = dict.contactPage;
  const categories = getServiceCategories(locale);
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const waMessage =
      locale === "it"
        ? [
            `Ciao Andrea, sono ${payload.name}.`,
            payload.service && `Servizio di interesse: ${payload.service}.`,
            `Email: ${payload.email}`,
            payload.phone && `Telefono: ${payload.phone}`,
            "",
            payload.message,
          ]
            .filter(Boolean)
            .join("\n")
        : [
            `Hi Andrea, I'm ${payload.name}.`,
            payload.service && `Service of interest: ${payload.service}.`,
            `Email: ${payload.email}`,
            payload.phone && `Phone: ${payload.phone}`,
            "",
            payload.message,
          ]
            .filter(Boolean)
            .join("\n");

    // Open WhatsApp synchronously (same click) so the message is guaranteed
    // to reach Andrea even if SMTP isn't configured for the API route below.
    window.open(waLink(waMessage), "_blank");
    setStatus("sent");
    form.reset();

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  return (
    <>
      <Reveal as="section" className={styles.hero}>
        <div className="container">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1>{c.heading}</h1>
          <p>{c.body}</p>
        </div>
      </Reveal>

      <div className={`container ${styles.layout}`}>
        <Reveal as="form" className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="name">{c.formName}</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">{c.formEmail}</label>
              <input id="email" name="email" type="email" required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="phone">{c.formPhone}</label>
              <input id="phone" name="phone" type="tel" />
            </div>
            <div className={styles.field}>
              <label htmlFor="service">{c.formService}</label>
              <select id="service" name="service" defaultValue="">
                <option value="" disabled>
                  {c.formServiceDefault}
                </option>
                {categories.map((category) => (
                  <optgroup key={category.slug} label={category.title}>
                    {category.services.map((service) => (
                      <option key={service.slug} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="message">{c.formMessage}</label>
            <textarea id="message" name="message" required />
          </div>

          <button type="submit" className="btn btn-primary">
            {c.formSubmit}
          </button>

          {status === "sent" && <span className={`${styles.status} ${styles.statusOk}`}>{c.formSuccess}</span>}
        </Reveal>

        <Reveal className={styles.card} delay={150}>
          <h2>{c.directHeading}</h2>
          <div className={styles.contactRow}>
            <span>{c.whatsappLabel}</span>
            <Link href={waLink(dict.whatsappDefaultMessage)} target="_blank">
              {site.phoneDisplay}
            </Link>
          </div>
          <div className={styles.contactRow}>
            <span>{c.emailLabel}</span>
            <Link href={`mailto:${site.email}`}>{site.email}</Link>
          </div>
          <div className={styles.contactRow}>
            <span>{c.instagramLabel}</span>
            <Link href={site.instagram} target="_blank">
              {site.instagramHandle}
            </Link>
          </div>
          <div className={styles.contactRow}>
            <span>{c.areaLabel}</span>
            <span>{site.areaServed}</span>
          </div>
        </Reveal>
      </div>
    </>
  );
}
