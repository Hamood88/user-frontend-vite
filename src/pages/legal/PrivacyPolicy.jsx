import React from "react";
import LegalLayout from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="January 25, 2026">
      <p className="legalNotice">
        <strong>Moondala does not sell your personal data.</strong> We make money from
        transactions and services — not from advertising that exploits user data.
      </p>

      <h2>1) What we collect</h2>
      <ul>
        <li><strong>Account info:</strong> name, email, phone (if you add it), country, basic profile details.</li>
        <li><strong>App activity:</strong> actions like follows, likes, comments, messages, referrals (to prevent fraud).</li>
        <li><strong>Purchase & transaction info:</strong> orders, payments status, refunds/returns history.</li>
        <li><strong>Device & log data:</strong> IP address, browser/device type, app errors, security logs.</li>
      </ul>

      <h2>2) How we use your data</h2>
      <ul>
        <li>To create and secure your account (login, fraud prevention, abuse detection).</li>
        <li>To process orders, returns, refunds, and customer support.</li>
        <li>To power core product features (feed, messaging, shop pages, referrals).</li>
        <li>To improve reliability and performance (crash logs, bug fixing, analytics).</li>
      </ul>

      <h2>3) What we do NOT do</h2>
      <ul>
        <li>We do <strong>not</strong> sell your personal data.</li>
        <li>We do <strong>not</strong> allow third-party advertisers to target you using your private profile data.</li>
      </ul>

      <h2>4) Sharing</h2>
      <p>
        We may share limited data only when needed to run the service, such as:
      </p>
      <ul>
        <li><strong>Payment processors</strong> (to complete transactions).</li>
        <li><strong>Infrastructure providers</strong> (hosting, database, email/SMS sending).</li>
        <li><strong>Legal</strong> (if required by law, or to protect users and prevent fraud).</li>
      </ul>

      <h2>5) Cookies & analytics</h2>
      <p>
        We may use cookies/local storage for login sessions and basic analytics to improve the app.
        You can restrict cookies in your browser, but some features may not work.
      </p>

      <h2>6) Your choices</h2>
      <ul>
        <li>Update your profile from Settings.</li>
        <li>Request account deletion (removes or anonymizes data where possible).</li>
        <li>Control privacy features (profile visibility, who can message you) if available in your Settings.</li>
      </ul>

      <h2>7) Data security</h2>
      <p>
        We use reasonable security practices (encryption in transit, access controls, monitoring),
        but no system is 100% secure.
      </p>

      <h2>8) Contact</h2>
      <p>
        Add a support email when ready (example: <strong>support@moondala.one</strong>).
      </p>
    </LegalLayout>
  );
}
