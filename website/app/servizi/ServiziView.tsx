"use client";

import styles from "./servizi.module.css";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";
import { getServiceCategories } from "@/lib/services";
import { useLocale } from "@/lib/i18n";
import { t } from "@/lib/dictionary";

export default function ServiziPage() {
  const { locale } = useLocale();
  const dict = t(locale);
  const categories = getServiceCategories(locale);

  return (
    <>
      <Reveal as="section" className={styles.hero}>
        <div className="container">
          <span className="eyebrow">{dict.servicesPage.eyebrow}</span>
          <h1>{dict.servicesPage.heading}</h1>
          <p>{dict.servicesPage.body}</p>
        </div>
      </Reveal>

      {categories.map((category) => (
        <section key={category.slug} id={category.slug} className={styles.category}>
          <div className="container">
            <Reveal className={styles.categoryHead}>
              <span className="eyebrow">{category.title}</span>
              <h2>{category.title}</h2>
              <p>{category.intro}</p>
            </Reveal>
            <div className={styles.grid}>
              {category.services.map((service, i) => (
                <Reveal key={service.slug} delay={(i % 4) * 80}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
