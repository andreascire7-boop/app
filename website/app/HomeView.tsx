"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { site, waLink } from "@/lib/site";
import { getServiceCategories } from "@/lib/services";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";
import Reveal from "@/components/Reveal";

export default function Home() {
  const { locale } = useLocale();
  const dict = t(locale);
  const [sc, massage] = getServiceCategories(locale);

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <Reveal className={styles.heroCopy}>
            <span className="eyebrow">{dict.hero.eyebrow}</span>
            <h1>
              {dict.hero.titleLine1}
              <br />
              <span className="accent">{dict.hero.titleAccent}</span> {dict.hero.titleRest}
            </h1>
            <p>{dict.hero.body}</p>
            <div className={styles.heroActions}>
              <Link href={waLink(dict.whatsappDefaultMessage)} target="_blank" className="btn btn-primary">
                {dict.hero.ctaPrimary}
              </Link>
              <Link href="/servizi" className="btn btn-ghost">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </Reveal>

          <Reveal className={styles.heroVisual} delay={150}>
            <div className={styles.floatCard}>
              <span className={styles.floatDot} />
              {dict.hero.badge}
            </div>
            <div className={styles.photoCard}>
              <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1440e6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#050b24" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle cx="320" cy="90" r="160" fill="url(#wave)" />
                <circle cx="60" cy="420" r="120" fill="url(#wave)" />
              </svg>
              <div className={styles.photoBadge}>
                <strong>{site.name}</strong>
                <span>{site.tagline}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className={styles.specStrip}>
        <div className={`container ${styles.specGrid}`}>
          {dict.specializations.map((spec, i) => (
            <Reveal as="div" className={styles.specItem} key={spec} delay={i * 50}>
              <span className={styles.specDot} />
              {spec}
            </Reveal>
          ))}
        </div>
      </div>

      <section>
        <div className="container">
          <Reveal className={styles.sectionHead}>
            <span className="eyebrow">{dict.homeServices.eyebrow}</span>
            <h2>{dict.homeServices.heading}</h2>
            <p>{dict.homeServices.body}</p>
          </Reveal>

          <div className={styles.serviceGrid}>
            <Reveal className={styles.serviceBlock}>
              <span className="eyebrow">{sc.title}</span>
              <h3>{dict.homeServices.scTitle}</h3>
              <p>{sc.intro}</p>
              <ul>
                {sc.services.slice(0, 4).map((s) => (
                  <li key={s.slug}>{s.name}</li>
                ))}
              </ul>
              <Link href="/servizi#sc-coaching" className="btn btn-primary">
                {dict.homeServices.scCta}
              </Link>
            </Reveal>

            <Reveal className={styles.serviceBlock} delay={120}>
              <span className="eyebrow">{massage.title}</span>
              <h3>{dict.homeServices.massageTitle}</h3>
              <p>{massage.intro}</p>
              <ul>
                {massage.services.slice(0, 4).map((s) => (
                  <li key={s.slug}>{s.name}</li>
                ))}
              </ul>
              <Link href="/servizi#massaggio-sportivo" className="btn btn-primary">
                {dict.homeServices.massageCta}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.project}>
        <div className={`container ${styles.projectGrid}`}>
          <Reveal>
            <span className="eyebrow" style={{ color: "#8fb0ff" }}>
              {dict.project.eyebrow}
            </span>
            <h2>{dict.project.heading}</h2>
            <p>{dict.project.body}</p>
            <div className={styles.projectTags}>
              {dict.project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <Link href={site.instagramProject} target="_blank" className="btn btn-light">
              {dict.project.cta}
            </Link>
          </Reveal>
          <Reveal className={styles.projectCard} delay={150}>
            <strong>{dict.project.cardTitle}</strong>
            <p>{dict.project.cardBody}</p>
          </Reveal>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <Reveal as="div" className={`container ${styles.ctaInner}`}>
          <h2>{dict.ctaBand.heading}</h2>
          <div className={styles.ctaActions}>
            <Link href={waLink(dict.whatsappStartMessage)} target="_blank" className="btn btn-primary">
              {dict.ctaBand.primary}
            </Link>
            <Link href="/contatti" className="btn btn-ghost">
              {dict.ctaBand.secondary}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
