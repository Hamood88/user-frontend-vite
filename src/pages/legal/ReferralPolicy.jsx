import React from "react";
import LegalLayout from "./LegalLayout";

export default function ReferralPolicy() {
  return (
    <LegalLayout title="Referral & Rewards Policy" updated="January 25, 2026">
      <p className="legalNotice">
        Referrals are meant for real people inviting real people. Fraud kills trust — we enforce this strictly.
      </p>

      <h2>1) How rewards work</h2>
      <ul>
        <li>Rewards may be earned from eligible transactions in your referral chain.</li>
        <li>Reward levels, percentages, and durations may be configurable by Moondala and can change over time.</li>
        <li>Some transactions may be excluded (refunds, chargebacks, fraud, restricted items).</li>
      </ul>

      <h2>2) What's not allowed</h2>
      <ul>
        <li>Creating fake accounts to farm rewards.</li>
        <li>Self-referrals (you referring yourself using another account).</li>
        <li>Buying/selling accounts, referral codes, or automated/bot signups.</li>
        <li>Misleading claims like "guaranteed income" or "risk-free profit."</li>
      </ul>

      <h2>3) Holds, reversals, and investigations</h2>
      <ul>
        <li>We may hold rewards until an order is completed or a return window passes.</li>
        <li>If a refund/chargeback happens, related rewards can be reversed.</li>
        <li>We may pause payouts during fraud investigations.</li>
      </ul>

      <h2>4) Enforcement</h2>
      <p>
        Abuse can lead to reward cancellation, feature restriction, or account suspension.
      </p>
    </LegalLayout>
  );
}
