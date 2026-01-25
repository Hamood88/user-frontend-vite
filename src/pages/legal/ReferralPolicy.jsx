import React from "react";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

export default function ReferralPolicy() {
  const { t } = useTranslation();
  
  return (
    <LegalLayout title={t('legal.pages.referralPolicy.title')} updated="January 25, 2026">
      <p className="legalNotice">
        {t('legal.pages.referralPolicy.intro')}
      </p>

      <h2>{t('legal.pages.referralPolicy.section1Title')}</h2>
      <ul>
        {t('legal.pages.referralPolicy.section1Content', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('legal.pages.referralPolicy.section2Title')}</h2>
      <p>
        <strong>{t('legal.pages.referralPolicy.section2Intro')}</strong>
      </p>
      <ul>
        {t('legal.pages.referralPolicy.section2Content', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p className="legalNotice">
        <strong>{t('legal.pages.referralPolicy.section2Detection')}</strong>
      </p>

      <h2>{t('legal.pages.referralPolicy.section3Title')}</h2>
      <ul>
        {t('legal.pages.referralPolicy.section3Content', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('legal.pages.referralPolicy.section4Title')}</h2>
      <p>
        <strong>{t('legal.pages.referralPolicy.section4Intro')}</strong>
      </p>
      <ul>
        {t('legal.pages.referralPolicy.section4Content', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>
        <strong>{t('legal.pages.referralPolicy.section4Minor')}</strong>
      </p>
    </LegalLayout>
  );
}
