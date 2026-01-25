import React from "react";
import { useTranslation } from 'react-i18next';
import LegalLayout from "./LegalLayout";

export default function RefundPolicy() {
  const { t } = useTranslation();
  const content = t('legal.pages.refundPolicy', { returnObjects: true });

  return (
    <LegalLayout title={content.title} updated="January 25, 2026">
      <p className="legalNotice">{content.intro}</p>

      <h2>{content.section1Title}</h2>
      <ul>
        {content.section1Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section2Title}</h2>
      <ul>
        {content.section2Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section3Title}</h2>
      <ul>
        {content.section3Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section4Title}</h2>
      <p>{content.section4Content}</p>

      <h2>{content.section5Title}</h2>
      <p>{content.section5Content}</p>
    </LegalLayout>
  );
}
