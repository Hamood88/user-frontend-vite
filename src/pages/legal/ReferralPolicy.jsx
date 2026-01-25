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

      <h2>2) Fraud and abuse (zero tolerance)</h2>
      <p>
        <strong>You will be permanently banned if you:</strong>
      </p>
      <ul>
        <li>Create duplicate or fake accounts to farm rewards (including family/friend accounts used fraudulently).</li>
        <li>Run "referral farms" using bots, scripts, or automated account creation tools.</li>
        <li>Self-refer (using another account to refer yourself).</li>
        <li>Buy, sell, trade, or share referral codes or accounts for money or benefits.</li>
        <li>Use Moondala to spam-promote competitor referral schemes or MLM programs.</li>
        <li>Manipulate referral tracking, order data, or reward calculations through technical exploits.</li>
        <li>Impersonate Moondala or steal our content/code/branding.</li>
        <li>Make misleading claims like "guaranteed income" or "risk-free profit."</li>
      </ul>
      <p className="legalNotice">
        <strong>Detection:</strong> We use automated fraud detection, manual reviews, and pattern analysis.
        Suspicious activity triggers immediate investigation.
      </p>

      <h2>3) Holds, reversals, and investigations</h2>
      <ul>
        <li>We may hold rewards until an order is completed or a return window passes.</li>
        <li>If a refund/chargeback happens, related rewards can be reversed.</li>
        <li>We may pause payouts during fraud investigations.</li>
      </ul>

      <h2>4) Enforcement and consequences</h2>
      <p>
        <strong>For fraud and abuse violations:</strong>
      </p>
      <ul>
        <li><strong>Immediate suspension:</strong> Account disabled pending investigation.</li>
        <li><strong>Permanent ban:</strong> Repeat offenders or severe fraud cases lose all access.</li>
        <li><strong>Reward forfeiture:</strong> All pending and earned rewards are cancelled and non-refundable.</li>
        <li><strong>Clawback:</strong> Already-paid rewards may be reclaimed if obtained fraudulently.</li>
        <li><strong>Legal action:</strong> We reserve the right to pursue legal remedies for fraud or theft.</li>
        <li><strong>Device/IP blocks:</strong> Banned users may be blocked from creating new accounts on the same device or network.</li>
      </ul>
      <p>
        <strong>For minor violations:</strong> Warnings, temporary feature restrictions, or reward holds.
      </p>
    </LegalLayout>
  );
}
