import React from "react";
import { useTranslation } from 'react-i18next';
import LegalLayout from "./LegalLayout";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const content = t('legal.pages.privacyPolicy', { returnObjects: true });

  return (
    <LegalLayout title={content.title} updated="January 25, 2026">
      <p className="legalNotice" dangerouslySetInnerHTML={{ __html: content.intro }} />

      <h2>{content.section1Title}</h2>
      <ul>
        {content.section1Content.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
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
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      <h2>{content.section4Title}</h2>
      <p>{content.section4Intro}</p>
      <ul>
        {content.section4Content.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
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
      <p>{content.section7Content}</p>

      <h2>{content.section8Title}</h2>
      <p dangerouslySetInnerHTML={{ __html: content.section8Content }} />
    </LegalLayout>
  );
}
