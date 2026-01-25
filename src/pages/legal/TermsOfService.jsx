import React from "react";
import LegalLayout from "./LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" updated="January 25, 2026">
      <p className="legalNotice">
        By using Moondala, you agree to follow these Terms. If you don't agree, don't use the app.
      </p>

      <h2>1) Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your account secure.</li>
        <li>You're responsible for activity under your account.</li>
        <li>We may suspend accounts involved in fraud, abuse, or rule violations.</li>
      </ul>

      <h2>2) What you can't do</h2>
      <ul>
        <li>Scams, impersonation, fraud, or misleading referral behavior.</li>
        <li>Harassment, hate, threats, or illegal content.</li>
        <li>Trying to exploit bugs or reverse engineer the platform.</li>
      </ul>

      <h2>3) Transactions</h2>
      <ul>
        <li>Orders, returns, and refunds follow our Refund Policy.</li>
        <li>Some items may be non-refundable if clearly labeled.</li>
        <li>We may hold or reverse rewards when refunds/chargebacks happen.</li>
      </ul>

      <h2>4) Referral rewards</h2>
      <p>
        Rewards are governed by the Referral & Rewards Policy. We may pause or deny rewards
        for suspected abuse or fake accounts.
      </p>

      <h2>5) Content you post</h2>
      <ul>
        <li>You own your content, but you give Moondala permission to display it in the app.</li>
        <li>Don't post content you don't have rights to.</li>
      </ul>

      <h2>6) Service changes</h2>
      <p>
        We may update features, fees, and policies as Moondala grows. We'll update the "Last updated" date.
      </p>

      <h2>7) Liability</h2>
      <p>
        Moondala is provided "as is." To the fullest extent permitted by law, we're not liable for indirect damages
        (lost profits, data loss, etc.).
      </p>

      <h2>8) Contact</h2>
      <p>Support contact will be listed here (example: support@moondala.one).</p>
    </LegalLayout>
  );
}
