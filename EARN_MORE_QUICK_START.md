# Earn More Feature - Quick Start Guide

## What's New? 🎉

Added a complete referral earning system to Moondala with:
- 💰 Referral code management
- 🔲 QR code generation & download
- 📱 Social media sharing (Facebook, Twitter, Email)
- 👥 Separate signup links for users and shops
- 📊 Real-time referral statistics

## Accessing the Feature

### For Users
1. **Log into user account**
2. **Open sidebar** on the left
3. **Click "💰 Earn More"** (between Cart and Profile)
4. **Explore referral options**

## Main Features Explained

### 📌 Feature 1: Referral Code
Your unique code for inviting others. Example: `ABC123`

**How to use:**
- Copy the code
- Share with friends/shops
- They use it when signing up
- You earn commission

### 🔲 Feature 2: QR Code
Scannable code that contains your referral link.

**How to use:**
- Click **"📥 Download QR Code"** to save as PNG
- Print it and share physically
- Post on social media
- Anyone scanning gets taken to referral signup page

### 📲 Feature 3: Direct Links
Complete links for users and shops.

**How to use:**
- Copy the link
- Send via email, chat, or messaging
- Each link has custom signup message
- User link: `/refer/user/{code}`
- Shop link: `/refer/shop/{code}`

### 📤 Feature 4: Social Sharing
Share directly to social platforms.

**How to use:**
1. Click **[Facebook]**, **[Twitter]**, or **[Email]**
2. Platform opens with pre-filled referral message
3. Add your personal note if desired
4. Send/post

### 📊 Feature 5: Referral Statistics
See how many people you've invited and earnings.

**Shows:**
- **People Invited**: Count of sign-ups via your code
- **Total Earned**: Commission from referrals
- **Referral Code**: Your unique code

## Tab System

### Invite Users Tab 👥
For inviting regular users to the platform.

**Message shown to new users:**
```
🎁 Join our growing community! 
This referral link unlocks exclusive rewards. 
Sign up now and start earning!
```

**Invite link:** `/refer/user/{code}`

### Invite Shops Tab 🏪
For recruiting shop owners to sell on the platform.

**Message shown to shop owners:**
```
🏪 Start your shop on Moondala! 
This referral link gives you special bonuses. 
Register now and reach millions of customers!
```

**Invite link:** `/refer/shop/{code}`

## Complete User Flow Example

### Scenario: You want to invite a friend

**Step 1: Get the referral code**
1. Go to "💰 Earn More"
2. Look at the **Referral Code** section
3. Your code is displayed (e.g., "ABC123")

**Step 2: Choose how to share**

Option A - Copy & Send Code:
- Click [Copy] next to your code
- Send code to friend
- Friend enters code during signup

Option B - Share QR Code:
- Click [📥 Download QR Code]
- Save image
- Share image on social media or print
- Friend scans with phone camera
- Redirects to signup with your code

Option C - Share Link:
- Copy the direct link from "Direct Signup Link" section
- Send link to friend
- Friend clicks, sees welcome message
- Friend signs up using your referral code

Option D - Social Media:
- Click [Facebook], [Twitter], or [Email]
- Platform opens with message
- Share to your followers
- People click link and sign up

**Step 3: Track earnings**
- Check "People Invited" count
- See "Total Earned" amount
- Earnings update automatically

## Referral Rewards

### What you earn:
- **Per user signup**: Commission on their transactions
- **Per shop signup**: Commission on shop sales
- **Lifetime**: Keep earning from all referrals

### Payment:
- Earnings shown in "Total Earned"
- Specific payment details managed through admin/settings

## Tips for Maximum Referrals

### ✅ Do's:
- ✓ Share with relevant audiences
- ✓ Use different channels (social, email, messaging)
- ✓ Print QR codes for physical sharing
- ✓ Add personal messages to invitations
- ✓ Follow up with friends/business contacts

### ❌ Don'ts:
- ✗ Don't spam or harass
- ✗ Don't use misleading titles
- ✗ Don't share in inappropriate groups
- ✗ Don't expect instant results

## FAQ

**Q: How long does my referral code last?**
A: Your code never expires. It's unique to your account forever.

**Q: Can I have multiple referral codes?**
A: No, you have one unique code per account.

**Q: When do I get paid for referrals?**
A: Payment schedule depends on your account settings. Check settings page.

**Q: What if someone uses the wrong code?**
A: Only signups with YOUR exact code count as your referral.

**Q: Can I change my referral code?**
A: No, but it's randomly generated so it's unique to you.

**Q: Do I need to invite friends to earn?**
A: No, but referrals are the primary way to earn passive income.

**Q: What's the difference between user and shop invites?**
A: Users earn from their purchases; shops earn from their sales. Different commissions apply.

## Troubleshooting

### Issue: Can't find "Earn More" link
- Solution: Make sure you're logged in
- Solution: Look in left sidebar, between Cart and Profile
- Solution: If on mobile, might be in hamburger menu

### Issue: QR code won't download
- Solution: Try different browser
- Solution: Check pop-up blocker isn't blocking
- Solution: Try Firefox or Chrome

### Issue: Social sharing not working
- Solution: Check pop-up blocker settings
- Solution: Make sure you're on the latest browser
- Solution: Try copying link instead

### Issue: Stats showing 0
- Solution: Wait a few minutes for data to sync
- Solution: Refresh page
- Solution: Check if any referrals completed signup

## Technical Details

### Backend API Used
- Endpoint: `/api/users/referral-network`
- Returns referral stats in real-time

### Referral Storage
- Stored in: User database with referral code field
- Associated during: Account signup using code

### Links Generated
- User invite: `https://moondala.com/refer/user/{CODE}`
- Shop invite: `https://moondala.com/refer/shop/{CODE}`

## Support

**Need help?**
- Check this guide first
- Look at [EARN_MORE_FEATURE.md](EARN_MORE_FEATURE.md) for technical details
- Review [EARN_MORE_UI_GUIDE.md](EARN_MORE_UI_GUIDE.md) for visual guide
- Contact admin if issue persists

## Updates & Changelog

### Version 1.0 (Initial Release)
- ✅ Referral code management
- ✅ QR code generation
- ✅ Social media sharing
- ✅ User/Shop dual signup links
- ✅ Real-time statistics
- ✅ Mobile responsive design

### Planned Features
- 🔮 Referral tier rewards
- 🔮 Network tree visualization
- 🔮 Commission history
- 🔮 Custom referral campaigns
- 🔮 Email notifications for referrals

---

**Happy Sharing! 🚀**

Start inviting users and shops today and watch your earnings grow!
