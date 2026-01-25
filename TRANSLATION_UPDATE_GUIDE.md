# Legal Pages Translation Update Guide

## Status

### ✅ Completed (3/18):
- **en** (English) - Full
- **ar** (Arabic) - Full with RTL support  
- **es** (Spanish) - Full

### 🔄 Remaining (15/18):
fr, de, id, hi, it, ja, ko, zh, pt, ru, tr, ur, so, fil, am

## What Was Added

Each language now has translations for all 5 legal pages:

1. **privacyPolicy** - 8 sections covering data collection, usage, sharing
2. **termsOfService** - 10 sections covering accounts, fraud, transactions
3. **communityGuidelines** - 4 sections (Allowed, Not allowed, Enforcement, Reporting)
4. **refundPolicy** - 5 sections covering returns, refunds, fraud
5. **referralPolicy** - 4 sections (already existed, kept intact)

## Structure

All translations follow this pattern in `public/locales/{lang}/translation.json`:

```json
{
  "legal": {
    "pages": {
      "privacyPolicy": {
        "title": "...",
        "intro": "...",
        "section1Title": "...",
        "section1Content": ["...", "..."],
        ...
      },
      "termsOfService": { ... },
      "communityGuidelines": { ... },
      "refundPolicy": { ... },
      "referralPolicy": { ... }
    }
  }
}
```

## How to Complete Remaining Languages

### Option 1: Manual Translation
1. Copy the English (`en/translation.json`) legal.pages structure
2. Translate all text strings to target language
3. Maintain JSON structure exactly
4. Use professional legal terminology
5. Validate JSON syntax

### Option 2: Use Translation Service
```bash
# Example using a translation API or service
# Translate en/translation.json → {lang}/translation.json
# Merge into existing {lang} file preserving other keys
```

### Option 3: AI-Assisted Batch Translation
Use the provided `batch-update-legal-translations.py` script:
1. Add translations for each remaining language to the `LEGAL_TRANSLATIONS` dictionary
2. Run: `python batch-update-legal-translations.py`
3. Verify output in each `public/locales/{lang}/translation.json`

## Translation Guidelines

### Professional Tone
- Use formal legal language appropriate for each locale
- Maintain consistent terminology across all pages
- Keep sentence structure clear and unambiguous

### Cultural Adaptation
- Adapt examples (email addresses, phone formats) to local standards
- Use culturally appropriate metaphors where applicable
- Respect local data privacy expectations (GDPR for EU languages, etc.)

### Technical Accuracy
- Translate technical terms consistently (e.g., "cookies", "IP address")
- Keep proper nouns unchanged ("Moondala", "support@moondala.one")
- Preserve formatting markers (numbers in section titles "1)", "2)")

## Verification Checklist

For each language file:

- [ ] All 5 legal pages present (privacyPolicy, termsOfService, communityGuidelines, refundPolicy, referralPolicy)
- [ ] JSON syntax valid (no trailing commas, quotes properly escaped)
- [ ] Section numbering consistent with English version
- [ ] Arrays used for multi-item content (section1Content, etc.)
- [ ] Strings used for single-paragraph content (intro, section5Content in Privacy Policy)
- [ ] No broken Unicode characters (especially for non-Latin scripts: ar, hi, ja, ko, zh, ur, am)
- [ ] File saved with UTF-8 encoding
- [ ] Trailing newline at end of file

## Quick Reference: Section Counts

| Page | Sections |
|------|----------|
| Privacy Policy | 8 |
| Terms of Service | 10 |
| Community Guidelines | 4 |
| Refund Policy | 5 |
| Referral Policy | 4 (existing) |

## Testing

After updating all files:

1. Start dev server: `npm run dev`
2. Navigate to `/legal/privacy-policy`
3. Test language switcher for each locale
4. Verify:
   - No JSON parse errors in console
   - All sections render correctly
   - RTL languages (ar, ur) display properly
   - No missing translation keys ({{key}} placeholders visible)

## Languages Priority Order

Recommended translation priority based on typical user base:

1. **Tier 1** (Major markets): fr, de, pt, ru, zh, ja
2. **Tier 2** (Growing markets): id, hi, it, ko, tr
3. **Tier 3** (Emerging): ur, so, fil, am

## Contact

For questions about legal content accuracy or translation requirements, contact the legal team before publishing.

---

Last Updated: January 25, 2026
Updated Files: en, ar, es
Remaining: 15 languages
