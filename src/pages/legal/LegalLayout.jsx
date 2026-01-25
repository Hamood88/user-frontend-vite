import React from "react";
import { Link } from "react-router-dom";
import "./legal.css";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="legalWrap">
      <div className="legalTop">
        <div>
          <h1 className="legalTitle">{title}</h1>
          <p className="legalMeta">Last updated: {updated}</p>
          <div className="legalLinksRow" style={{ marginTop: 10 }}>
            <Link className="legalPill" to="/legal/privacy">Privacy</Link>
            <Link className="legalPill" to="/legal/terms">Terms</Link>
            <Link className="legalPill" to="/legal/guidelines">Guidelines</Link>
            <Link className="legalPill" to="/legal/referrals">Referrals</Link>
            <Link className="legalPill" to="/legal/refunds">Refunds</Link>
          </div>
        </div>

        <Link className="legalPill" to="/" style={{ height: "fit-content" }}>
          ← Back
        </Link>
      </div>

      <div className="legalCard">{children}</div>
    </div>
  );
}
