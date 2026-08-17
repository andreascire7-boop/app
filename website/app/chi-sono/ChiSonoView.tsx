"use client";

import Link from "next/link";
import styles from "./chisono.module.css";
import { waLink } from "@/lib/site";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";
import Reveal from "@/components/Reveal";

export default function ChiSonoPage() {
  const { locale } = useLocale();
  const dict = t(locale);
  const about = dict.aboutPage;

  return (
    <>
      <section className={styles.hero}>
        <Reveal as="div" className={`container ${styles.heroGrid}`}>
          <div className={styles.avatar}>AS</div>
          <div>
            <span className="eyebrow" style={{ color: "#8fb0ff" }}>
              {about.eyebrow}
            </span>
            <h1>{about.heading}</h1>
            <span className={styles.role}>{about.role}</span>
          </div>
        </Reveal>
      </section>

      <section className={styles.profile}>
        <Reveal as="div" className="container">
          <p>{about.profile}</p>
        </Reveal>
      </section>

      <section>
        <div className={`container ${styles.grid2}`}>
          <div className={styles.block}>
            <h2>{about.experienceHeading}</h2>
            {about.experience.map((item, i) => (
              <Reveal as="div" className={styles.timelineItem} key={item.role} delay={i * 100}>
                <strong>{item.role}</strong>
                <span>{item.place}</span>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>

          <div className={styles.block}>
            <h2>{about.educationHeading}</h2>
            {about.education.map((item, i) => (
              <Reveal as="div" className={styles.timelineItem} key={item.title} delay={i * 100}>
                <strong>{item.title}</strong>
                <span>{item.place}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.certs}>
        <div className="container">
          <h2 style={{ marginBottom: 28 }}>{about.certificationsHeading}</h2>
          <div className={styles.certGrid}>
            {about.certifications.map((cert, i) => (
              <Reveal as="div" className={styles.certCard} key={cert.org + cert.title} delay={(i % 4) * 70}>
                <span className={styles.certOrg}>{cert.org}</span>
                <span className={styles.certTitle}>{cert.title}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 style={{ marginBottom: 24 }}>{about.specializationsHeading}</h2>
          <Reveal as="div" className={styles.tagRow}>
            {dict.specializations.map((spec) => (
              <span className={styles.tag} key={spec}>
                {spec}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <div className={styles.ctaWrap}>
        <Link href={waLink(dict.whatsappDefaultMessage)} target="_blank" className="btn btn-primary">
          {about.cta}
        </Link>
      </div>
    </>
  );
}
