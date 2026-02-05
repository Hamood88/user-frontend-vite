# iOS Release Build Guide - Moondala App

## Prerequisites

✅ **Apple Developer Account** ($99/year)
✅ **Mac computer** with macOS (required for Xcode)
✅ **Xcode** (latest version from Mac App Store)
✅ **Node.js** installed
✅ **CocoaPods** installed (`sudo gem install cocoapods`)

## Step 1: Install Xcode & Command Line Tools

1. Download **Xcode** from Mac App Store (free, ~15GB)
2. Open Xcode → Accept license agreement
3. Install Command Line Tools:
   ```bash
   xcode-select --install
   ```
4. Verify installation:
   ```bash
   xcode-select -p
   # Should show: /Applications/Xcode.app/Contents/Developer
   ```

## Step 2: Build Web App

From your Windows machine or Mac, build the web app first:

```bash
cd user-frontend-vite-temp
npm install
npm run build
```

This creates the `dist/` folder with your production web build.

## Step 3: Sync Capacitor (on Mac)

Transfer the entire `user-frontend-vite-temp/` folder to your Mac, then:

```bash
cd user-frontend-vite-temp
npm install
npx cap sync ios
```

This copies the web build into the iOS project and updates native dependencies.

## Step 4: Open Project in Xcode

```bash
npx cap open ios
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

**⚠️ IMPORTANT**: Always open `.xcworkspace`, NOT `.xcodeproj` (CocoaPods requirement)

## Step 5: Configure Signing & Capabilities

### A. Set App Bundle Identifier

1. In Xcode, select **App** project in left sidebar
2. Select **App** target under TARGETS
3. Go to **Signing & Capabilities** tab
4. **Bundle Identifier**: `com.moondala.app` (already set)
5. **Team**: Select your Apple Developer team from dropdown

### B. Enable Automatic Signing

1. Check **Automatically manage signing**
2. Select your **Team** from dropdown
3. Xcode will automatically create provisioning profiles

### C. Configure Capabilities

Your app uses these features (already configured in `capacitor.config.ts`):

- ✅ **Associated Domains** (for deep links)
- ✅ **Push Notifications** (if needed later)
- ✅ **Background Modes** (if needed)

To enable deep links:
1. In Xcode → **Signing & Capabilities**
2. Click **+ Capability** → Search "Associated Domains"
3. Add domain: `applinks:moondala.com`

## Step 6: Configure App Information

### A. Update Info.plist

Location: `ios/App/App/Info.plist`

Key settings (already configured):

```xml
<key>CFBundleDisplayName</key>
<string>Moondala</string>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>moondala</string>
    </array>
  </dict>
</array>
```

### B. Privacy Descriptions

Add privacy usage descriptions (required by App Store):

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to let you upload product photos and profile pictures.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to let you select images for your posts and products.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save images to your photo library.</string>
```

## Step 7: Set App Icons & Splash Screen

### A. App Icon

1. Prepare 1024x1024px PNG (no transparency, no rounded corners)
2. In Xcode → Select **Assets.xcassets** in left sidebar
3. Select **AppIcon**
4. Drag your 1024x1024 image to the "App Store iOS" slot
5. Xcode auto-generates all required sizes

**Design Requirements**:
- 1024x1024px PNG
- No transparency (opaque background)
- No rounded corners (iOS adds them)
- High quality, no compression artifacts

### B. Splash Screen

1. Assets → Select **Splash**
2. Add 2732x2732px centered logo/image
3. Background color set in `capacitor.config.ts`: `#0a0a0f`

## Step 8: Configure Deep Links (Universal Links)

### A. Apple App Site Association (AASA)

Deploy this file to your server at:
```
https://moondala.com/.well-known/apple-app-site-association
```

Content:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.moondala.app",
        "paths": [
          "/r/*",
          "/product/*",
          "/shop/*"
        ]
      }
    ]
  }
}
```

**Replace `YOUR_TEAM_ID`** with your Apple Developer Team ID (found in Xcode under Signing & Capabilities).

### B. Verify AASA

Test your AASA file:
```bash
curl https://moondala.com/.well-known/apple-app-site-association
```

Or use Apple's validator:
https://search.developer.apple.com/appsearch-validation-tool/

## Step 9: Build Archive for App Store

### A. Select Build Target

1. In Xcode toolbar, next to Run button
2. Select **Any iOS Device (arm64)** (NOT simulator)
3. Or select **Generic iOS Device**

### B. Create Archive

1. **Product** → **Archive** (or Cmd+B to build first)
2. Wait 5-10 minutes for build (first time)
3. Archive Organizer window opens automatically

### C. Distribute to App Store

1. In Archive Organizer, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Click **Next** → **Upload**
5. Select signing certificate (automatic if using auto-signing)
6. Click **Upload**

Progress: Archive → Upload → Processing (20-60 minutes) → Ready for Review

## Step 10: App Store Connect Setup

### A. Create App Listing

1. Go to https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Fill in details:
   - **Name**: Moondala
   - **Primary Language**: English (US)
   - **Bundle ID**: com.moondala.app (select from dropdown)
   - **SKU**: moondala-app-001 (unique identifier)
   - **User Access**: Full Access

### B. App Information

Required fields:

**App Category**:
- Primary: Shopping
- Secondary: Social Networking

**App Privacy URL**:
```
https://moondala.com/privacy
```

**Support URL**:
```
https://moondala.com/support
```

**Marketing URL** (optional):
```
https://moondala.com
```

**Description** (4000 chars max):
```
Moondala - Your Social Shopping Marketplace

Discover, shop, and earn with Moondala! Join a vibrant community where shopping meets social networking.

KEY FEATURES:

🛍️ SHOP FROM AMAZING VENDORS
• Browse curated products from verified shops
• Personalized shopping mall experience
• Secure checkout and order tracking
• Easy returns and customer support

💰 EARN WHILE YOU SHARE
• Refer friends and earn commissions
• Multi-level referral rewards system
• Track your earnings in real-time
• Withdraw anytime to your account

🏪 SHOP OWNERS WELCOME
• Create your custom digital storefront
• Visual mall builder - no coding needed
• Manage products, orders, and customers
• Analytics and performance insights

🌟 SOCIAL FEATURES
• Follow your favorite shops
• Like, comment, and share products
• Ask questions to sellers
• Chat with previous buyers

🎁 SPECIAL PERKS
• QR code referrals for easy sharing
• Exclusive deals and promotions
• Early access to new products
• Loyalty rewards program

Join thousands of happy shoppers and vendors on Moondala. Download now and start your shopping journey!
```

**Keywords** (100 chars max):
```
shopping,marketplace,referral,earn,shop,social,vendor,mall,commission,rewards
```

**Promotional Text** (170 chars max):
```
Earn rewards while shopping! Join Moondala - where every purchase supports vendors and earns you commissions. Shop smarter, earn more! 🛍️💰
```

### C. Screenshots

Upload screenshots (required: iPhone 6.7" + iPad Pro 12.9"):

**iPhone 6.7" Display** (1290x2796 or 1284x2778):
- Min 2 screenshots, max 10
- Suggested: Login, Home Feed, Product Details, Earn More, Profile

**iPad Pro 12.9" Display** (2048x2732):
- Min 2 screenshots, max 10
- Optional but recommended

**How to capture**:
1. Run app in Xcode Simulator
2. Select iPhone 14 Pro Max (6.7")
3. Navigate to each screen
4. **Device** → **Trigger Screenshot** (or Cmd+S)
5. Screenshots saved to Desktop

**Screenshot Tips**:
- Show key features (shopping, earning, shop browsing)
- Use actual content (real products, not placeholders)
- Add text overlays highlighting features (optional)
- First 3 screenshots are most important (appear in search)

### D. App Preview (Optional Video)

- 15-30 second video showing app usage
- Same sizes as screenshots (6.7" iPhone)
- .mov or .mp4 format
- Helps conversion rate but optional

### E. Version Information

**Version Number**: 1.0.0
**Copyright**: 2026 Moondala Inc
**Age Rating**: 
- Select **4+** (no mature content)
- Complete age rating questionnaire

### F. App Review Information

**Contact Information**:
- First Name: [Your Name]
- Last Name: [Your Last Name]
- Phone: [Your Phone]
- Email: [Your Email]

**Demo Account** (required for review):
```
Username: demo@moondala.com
Password: Demo1234!
```

**Notes**:
```
Demo account includes:
- Sample products to browse
- Pre-loaded shopping cart
- Example referral code: DEMO123
- Test shop account access

To test referral feature:
1. Tap "Earn More" in sidebar
2. View referral code and QR code
3. Share link: https://moondala.com/r/DEMO123

To test shopping:
1. Browse products on home feed
2. Add to cart
3. Complete checkout
```

## Step 11: Submit for Review

### A. Build Version

1. In App Store Connect → **App Store** tab
2. **+ Version or Platform** → **iOS**
3. Enter version: **1.0.0**
4. Select uploaded build (appears after processing)

### B. Pre-submission Checklist

- [ ] All screenshots uploaded (iPhone + iPad)
- [ ] App description written
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Demo account credentials provided
- [ ] Age rating completed
- [ ] App icon uploaded (1024x1024)
- [ ] Build selected
- [ ] Export compliance answered (select "No" if not using encryption)

### C. Submit

1. Click **Add for Review**
2. Click **Submit for Review**
3. Wait for Apple review (typically 24-48 hours)

## Step 12: Post-Submission

### Review Status Flow

1. **Waiting for Review** → 1-2 days in queue
2. **In Review** → Apple tests app (few hours)
3. **Pending Developer Release** → Approved! (you control release)
4. **Ready for Sale** → Live on App Store

### If Rejected

Common reasons:
- Missing demo account credentials
- Broken features in demo account
- Privacy policy issues
- Guideline violations

**Fix and Resubmit**:
1. Address feedback in Resolution Center
2. Build new version if code changes needed
3. Resubmit for review

## Troubleshooting

### "No code signing identities found"

**Solution**:
1. Xcode → **Settings** → **Accounts**
2. Add your Apple ID
3. Select team → **Manage Certificates**
4. Click **+** → **Apple Distribution**

### "Unable to install app"

**Solution**:
1. Clean build folder: **Product** → **Clean Build Folder**
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Restart Xcode

### "Module not found" errors

**Solution**:
```bash
cd ios/App
pod install
```

### Deep links not working

**Solution**:
1. Verify AASA file deployed to production
2. Check Team ID matches in AASA file
3. Test with Safari: Navigate to `https://moondala.com/r/TEST`
4. Should prompt to open in Moondala app

### App crashes on launch

**Solution**:
1. Check logs: Xcode → **Window** → **Devices and Simulators**
2. Select your device → View device logs
3. Look for crash reports
4. Common issue: Missing API base URL in web build

## Testing Checklist

Before submission, test these flows:

- [ ] **Launch**: App opens without crash
- [ ] **Login**: Can sign in with credentials
- [ ] **Browse**: Products load and display images
- [ ] **Product Details**: Images, reviews, questions load
- [ ] **Cart**: Add to cart, update quantity, checkout
- [ ] **Earn More**: QR code generates, referral link works
- [ ] **Deep Links**: Open `moondala.com/r/CODE` in Safari → Opens app
- [ ] **Profile**: View profile, edit info, logout
- [ ] **Offline**: Graceful handling when no internet

## Build Commands Reference

### Development Testing

```bash
# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on connected device
npx cap run ios
```

### Production Build

```bash
# Clean build
cd user-frontend-vite-temp
rm -rf dist node_modules
npm install
npm run build

# Sync
npx cap sync ios

# Open Xcode
npx cap open ios

# Then: Product → Archive in Xcode
```

## Important Files

- **capacitor.config.ts** - Capacitor configuration ✅ Already configured
- **ios/App/App/Info.plist** - iOS app metadata
- **ios/App/App/Assets.xcassets** - App icons, splash screens
- **src/capacitor-init.js** - Deep link handler ✅ Already implemented
- **.well-known/apple-app-site-association** - Deploy to production server

## Environment Variables

Ensure your production build uses correct API base:

**.env.production** (in `user-frontend-vite-temp/`):
```
VITE_API_BASE=https://moondala-backend.onrender.com
```

Build automatically uses this when running `npm run build`.

## Timeline Estimate

- **Initial Setup** (Xcode, certificates): 1-2 hours
- **Build & Archive**: 30 minutes
- **App Store Connect Setup**: 1-2 hours
- **Screenshot Creation**: 1 hour
- **Apple Review**: 24-48 hours
- **Total to Live**: 2-3 days

## Next Steps After Approval

1. **Marketing**: Share App Store link on social media
2. **Updates**: Use TestFlight for beta testing future versions
3. **Analytics**: Set up App Store Connect analytics
4. **Push Notifications**: Add Firebase Cloud Messaging (optional)
5. **In-App Purchases**: If adding paid features later

## Support Resources

- **Apple Developer Forums**: https://developer.apple.com/forums
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Capacitor iOS Docs**: https://capacitorjs.com/docs/ios
- **App Store Connect**: https://appstoreconnect.apple.com

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Build web app (Windows or Mac)
cd user-frontend-vite-temp
npm run build

# 2. Sync to iOS (on Mac)
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
# - Select team in Signing & Capabilities
# - Product → Archive
# - Distribute → App Store Connect

# 5. App Store Connect:
# - Create app listing
# - Add screenshots
# - Submit for review
```

**Estimated time to first submission**: 3-4 hours  
**Estimated time to App Store approval**: 24-48 hours

Good luck with your iOS launch! 🎉
