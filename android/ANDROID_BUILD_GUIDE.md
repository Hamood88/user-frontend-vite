# Android Release Build Guide

## Prerequisites

You need **Android Studio** to build the app. Download from:
https://developer.android.com/studio

Android Studio includes:
- ✅ Java JDK (required for building)
- ✅ Android SDK (required for building)
- ✅ Gradle build system
- ✅ Android Emulator
- ✅ Build tools & signing utilities

## Step 1: Install Android Studio

1. Download Android Studio from link above
2. Run installer (accept default settings)
3. On first launch, complete setup wizard:
   - Install Android SDK (default location: `C:\Users\hamoo\AppData\Local\Android\Sdk`)
   - Install Android SDK Platform 34 (Android 14)
   - Install Android SDK Build-Tools
   - Install Android Emulator

## Step 2: Open Project in Android Studio

```powershell
cd C:\Users\hamoo\OneDrive\Desktop\myproject\user-frontend-vite-temp
npx cap open android
```

This will:
- Launch Android Studio
- Open the `android/` folder as Gradle project
- Auto-download Gradle dependencies
- Index the project (takes 2-5 minutes first time)

## Step 3: Generate Release Keystore

In Android Studio:

1. **Menu** → **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle (AAB)** → **Next**
3. Click **Create new...** under Key store path
4. Fill in keystore details:
   - **Key store path**: `C:\Users\hamoo\OneDrive\Desktop\myproject\user-frontend-vite-temp\android\moondala-release.keystore`
   - **Password**: `moondala2026`
   - **Alias**: `moondala`
   - **Password**: `moondala2026`
   - **Validity**: 25 years
   - **Certificate**:
     - First and Last Name: `Moondala`
     - Organizational Unit: `Mobile`
     - Organization: `Moondala Inc`
     - City: `Your City`
     - State: `Your State`
     - Country Code: `US`
5. Click **OK** to generate keystore
6. **IMPORTANT**: Save keystore file and passwords securely!

## Step 4: Configure Signing (Automated)

The `key.properties` file has already been created for you. Just verify it exists:

Location: `android/key.properties`

Contents:
```
storePassword=moondala2026
keyPassword=moondala2026
keyAlias=moondala
storeFile=moondala-release.keystore
```

The `app/build.gradle` file is also already configured to use this keystore.

## Step 5: Build Release AAB

In Android Studio:

1. **Build** → **Select Build Variant** → Choose **release**
2. **Build** → **Generate Signed Bundle / APK**
3. Select **Android App Bundle (AAB)**
4. Select your keystore (should auto-fill if you created it in Step 3)
5. Click **Next** → **release** build variant → **Finish**
6. Wait for build (takes 2-5 minutes)
7. When done, Android Studio shows popup: **locate** → Opens folder with AAB file

Output location:
```
android/app/release/app-release.aab
```

## Step 6: Test on Physical Device

### Via USB:

1. Enable Developer Options on your Android phone:
   - **Settings** → **About Phone** → Tap **Build Number** 7 times
2. Enable USB Debugging:
   - **Settings** → **Developer Options** → **USB Debugging** ON
3. Connect phone via USB cable
4. In Android Studio, select your device from device dropdown
5. Click **Run** (green play button)

### Via Emulator:

1. **Tools** → **Device Manager**
2. **Create Device** → Select phone model → **Next**
3. Select **System Image** (e.g., Android 14, API 34) → **Download** → **Next**
4. Click **Finish**
5. Click **Play** button on created device
6. Wait for emulator to boot (takes 1-2 minutes first time)
7. In Android Studio, select emulator from device dropdown
8. Click **Run**

## Step 7: Test Deep Links

### Method 1: ADB Command

```powershell
# Replace with your package ID and test URL
adb shell am start -a android.intent.action.VIEW -d "https://moondala.one/r/TESTCODE" com.moondala.app
```

### Method 2: Test URL in Browser

1. Open Chrome on phone/emulator
2. Navigate to: `https://moondala.one/r/TESTCODE`
3. Should prompt to open in Moondala app
4. Tap "Open in Moondala"
5. App should launch and navigate to referral page

### Method 3: QR Code

1. Generate QR code for `https://moondala.one/r/TESTCODE`
2. Scan with phone camera
3. Tap notification → Opens app with deep link

## Step 8: Upload to Google Play Console

1. Go to: https://play.google.com/console
2. Create new app (if first time)
3. Fill in app details:
   - **App name**: Moondala
   - **Default language**: English (US)
   - **App category**: Shopping
   - **Price**: Free
4. Upload `app-release.aab` from step 5
5. Complete store listing:
   - **Short description** (80 chars)
   - **Full description** (4000 chars)
   - **Screenshots** (min 2, preferably 8):
     - Phone: 1080x1920 or 1080x2340
     - Tablet: 1536x2048 (optional)
   - **Feature graphic**: 1024x500 PNG
   - **App icon**: 512x512 PNG (32-bit with alpha)
6. **Privacy Policy**: Add URL (required)
7. **Content rating**: Complete questionnaire
8. **Target audience**: Set age rating
9. **Submit for review**

Typical review time: 2-7 days

## Troubleshooting

### "SDK location not found"
- Android Studio → **File** → **Project Structure** → **SDK Location**
- Set to: `C:\Users\hamoo\AppData\Local\Android\Sdk`

### "Gradle sync failed"
- **File** → **Invalidate Caches** → **Invalidate and Restart**
- Wait for re-indexing

### "Build failed: minSdkVersion"
- In `android/variables.gradle`, ensure:
  ```
  minSdkVersion = 22
  targetSdkVersion = 34
  ```

### "Deep links not working"
- Verify AndroidManifest.xml has `android:autoVerify="true"`
- Deploy AASA file to `https://moondala.one/.well-known/assetlinks.json`:
  ```json
  [{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.moondala.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }]
  ```
- Get fingerprint with:
  ```powershell
  keytool -list -v -keystore android/moondala-release.keystore -alias moondala
  ```

## Build Commands Reference

### Development Build (Debug)
```powershell
npx cap run android
```

### Release Build (Command Line)
```powershell
cd android
gradlew bundleRelease
```

### Clean Build
```powershell
cd android
gradlew clean
gradlew bundleRelease
```

## Important Files

- **AndroidManifest.xml**: Deep link configuration ✅ Already configured
- **build.gradle (app)**: Signing config ✅ Already configured
- **key.properties**: Keystore credentials ✅ Already created
- **capacitor.config.ts**: Capacitor settings ✅ Already configured
- **src/capacitor-init.js**: Deep link handler ✅ Already implemented

## Security Notes

⚠️ **NEVER commit these to git**:
- `moondala-release.keystore` (in .gitignore)
- `key.properties` (in .gitignore)
- Keystore passwords

✅ **Backup securely**:
- Copy `moondala-release.keystore` to secure location (USB drive, encrypted cloud storage)
- Save passwords in password manager
- If you lose the keystore, you CANNOT update the app on Play Store (must publish new app)

## Next Steps

1. Install Android Studio
2. Run `npx cap open android`
3. Generate keystore via UI (Step 3)
4. Build release AAB (Step 5)
5. Test on device (Step 6)
6. Upload to Play Console (Step 8)

**Estimated time to first build**: 1-2 hours (including Android Studio setup)
