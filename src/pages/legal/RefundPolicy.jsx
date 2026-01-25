import React from "react";
import LegalLayout from "./LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Return & Refund Policy" updated="January 25, 2026">
      <p className="legalNotice">
        This policy describes the standard return/refund rules. Shops may have additional rules shown on the product page.
      </p>

      <h2>1) Return window</h2>
      <ul>
        <li>Typical return window: 7–30 days (depends on the shop and product category).</li>
        <li>Some items can be non-returnable (shown before purchase).</li>
      </ul>

      <h2>2) Refund method</h2>
      <ul>
        <li>Refunds go back to the original payment method when possible.</li>
        <li>If you used Moondala credits/wallet, refunds may return to the wallet.</li>
      </ul>

      <h2>3) Shipping & condition</h2>
      <ul>
        <li>Items must be returned in original condition unless damaged/defective.</li>
        <li>Return shipping responsibility may depend on the reason (defect vs change of mind).</li>
      </ul>

      <h2>4) Fraud & abuse</h2>
      <p>
        We may deny refunds for abuse, repeated suspicious behavior, or policy violations.
      </p>

      <h2>5) Referral rewards</h2>
      <p>
        If an order is refunded, related referral rewards may be reversed.
      </p>
    </LegalLayout>
  );
}
