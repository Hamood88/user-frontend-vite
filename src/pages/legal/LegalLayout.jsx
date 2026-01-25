import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./legal.css";

export default function LegalLayout({ title, updated, children }) {
  const { t } = useTranslation();
  
  return (
    <div className="legalWrap">
      <div className="legalTop">
        <div>
          <h1 className="legalTitle">{title}</h1>
          <p className="legalMeta">{t('legal.lastUpdated')}: {updated}</p>
          <div className="legalLinksRow" style={{ marginTop: 10 }}>
            <Link className="legalPill" to="/legal/privacy">{t('legal.privacy')}</Link>
            <Link className="legalPill" to="/legal/terms">{t('legal.terms')}</Link>
            <Link className="legalPill" to="/legal/guidelines">{t('legal.guidelines')}</Link>
            <Link className="legalPill" to="/legal/referrals">{t('legal.referrals')}</Link>
            <Link className="legalPill" to="/legal/refunds">{t('legal.refunds')}</Link>
          </div>
        </div>

        <Link className="legalPill" to="/" style={{ height: "fit-content" }}>
          ← {t('legal.back')}
        </Link>
      </div>

      <div className="legalCard">{children}</div>
    </div>
  );
}
