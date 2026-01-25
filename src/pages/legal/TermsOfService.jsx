import React from "react";
import { useTranslation } from 'react-i18next';
import LegalLayout from "./LegalLayout";

export default function TermsOfService() {
  const { t } = useTranslation();
  const content = t('legal.pages.termsOfService', { returnObjects: true });

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
      <p>{content.section3Intro}</p>
      <ul>
        {content.section3Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section4Title}</h2>
      <ul>
        {content.section4Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section5Title}</h2>
      <p>{content.section5Content}</p>

      <h2>{content.section6Title}</h2>
      <ul>
        {content.section6Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.section7Title}</h2>
      <p>{content.section7Intro}</p>
      <ul>
        {content.section7Content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{content.section7Note}</p>

      <h2>{content.section8Title}</h2>
      <p>{content.section8Content}</p>

      <h2>{content.section9Title}</h2>
      <p>{content.section9Content}</p>

      <h2>{content.section10Title}</h2>
      <p>{content.section10Content}</p>
    </LegalLayout>
  );
}
