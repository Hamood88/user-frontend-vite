import React from "react";
import { useTranslation } from 'react-i18next';
import LegalLayout from "./LegalLayout";

export default function CommunityGuidelines() {
  const { t } = useTranslation();
  const content = t('legal.pages.communityGuidelines', { returnObjects: true });

  return (
    <LegalLayout title={content.title} updated="January 25, 2026">
      <p className="legalNotice">{content.intro}</p>

      <h2>{content.allowedTitle}</h2>
      <ul>
        {content.allowedContent.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.notAllowedTitle}</h2>
      <ul>
        {content.notAllowedContent.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.enforcementTitle}</h2>
      <ul>
        {content.enforcementContent.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{content.reportingTitle}</h2>
      <p>{content.reportingContent}</p>
    </LegalLayout>
  );
}
