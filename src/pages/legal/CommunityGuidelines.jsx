import React from "react";
import LegalLayout from "./LegalLayout";

export default function CommunityGuidelines() {
  return (
    <LegalLayout title="Community Guidelines" updated="January 25, 2026">
      <p className="legalNotice">
        Moondala is social commerce — keep it safe, honest, and respectful.
      </p>

      <h2>Allowed</h2>
      <ul>
        <li>Real product discussions, reviews, honest feedback.</li>
        <li>Sharing referral codes in a truthful way (no deception).</li>
        <li>Respectful disagreement.</li>
      </ul>

      <h2>Not allowed</h2>
      <ul>
        <li>Scams, fake giveaways, or misleading "guaranteed earnings" claims.</li>
        <li>Harassment, hate speech, threats, or bullying.</li>
        <li>Illegal items/services or instructions for wrongdoing.</li>
        <li>Spam (mass posting, repetitive links, bot behavior).</li>
      </ul>

      <h2>Enforcement</h2>
      <ul>
        <li>We may remove content or restrict features.</li>
        <li>Severe or repeated violations can lead to suspension or permanent ban.</li>
      </ul>

      <h2>Reporting</h2>
      <p>
        If you see abuse, report it in the app (or support email when added).
      </p>
    </LegalLayout>
  );
}
