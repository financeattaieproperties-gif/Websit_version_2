# Android Software Design — Attaie Properties App

## Overview

Native-feel Android app built with Capacitor (React web app wrapped in native shell) for maximum
code reuse with the website, while supporting full Android capabilities: FCM push notifications,
Google Sign-In, Google Maps, biometric auth, and Play Store distribution.

---

## Platform Targets

| Setting | Value |
|---------|-------|
| Minimum SDK | Android 8.0 (API 26) |
| Target SDK | Android 14 (API 34) |
| Build Tool | Capacitor 6 |
| Package Name | `com.attaie.properties` |
| Language | Kotlin (native shell) + TypeScript (web layer) |
| Architecture | MVVM in native layer, Context/Hooks in web layer |

---

## Phase 1 — Project Setup & Configuration

**Goal:** Working Android project with Firebase, signing config, and Capacitor bridge.

### 1.1 Capacitor Initialization

```bash
npm install @capacitor/core @capacitor/android
npx cap init "Attaie Properties" com.attaie.properties
npx cap add android
```

### 1.2 `capacitor.config.json`

```json
{
  "appId": "com.attaie.properties",
  "appName": "Attaie Properties",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": false,
    "webContentsDebuggingEnabled": false
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1A2335",
      "androidSplashResourceName": "splash",
      "showSpinner": false
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#1A2335"
    }
  }
}
```

### 1.3 Project File Structure

```
android/
│
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/attaie/properties/
│   │       │   ├── MainActivity.kt          ← Capacitor entry point
│   │       │   └── MyFirebaseMessagingService.kt ← FCM handler
│   │       ├── res/
│   │       │   ├── drawable/                ← Icons, splash background
│   │       │   ├── mipmap-*/                ← App icons (all densities)
│   │       │   ├── values/
│   │       │   │   ├── colors.xml
│   │       │   │   ├── strings.xml
│   │       │   │   └── styles.xml
│   │       │   └── xml/
│   │       │       ├── file_paths.xml       ← FileProvider config
│   │       │       └── network_security_config.xml
│   │       └── AndroidManifest.xml
│   └── build.gradle
│
├── google-services.json                     ← Firebase config (NOT committed)
├── capacitor.settings.gradle
└── build.gradle
```

### 1.4 Required Permissions (`AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 1.5 Signing Configuration

```gradle
// app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file(KEYSTORE_PATH)
            storePassword KEYSTORE_PASSWORD
            keyAlias KEY_ALIAS
            keyPassword KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Keystore values stored in `~/.gradle/gradle.properties` — never in the repo.

---

## Phase 2 — Navigation & Screen Architecture

**Goal:** Define all screens, bottom navigation, and deep-link routing.

### 2.1 Bottom Navigation Structure

```
Tab 1: Home          (house icon)
Tab 2: Properties    (building icon)
Tab 3: Projects      (grid icon)
Tab 4: Saved         (heart icon)
Tab 5: Account       (person icon)
```

Badge on Account tab when logged in. Notification dot on Home when new update.

### 2.2 Full Screen Map

```
App Launch
  └── Splash Screen (2 sec)
       └── Onboarding (first install only — 3 slides)
            └── Main App (Bottom Navigation)

Home Tab:
  Home Screen
    → Property Detail Screen
      → Virtual Tour Screen (fullscreen WebView)
      → Inquiry Form Screen
      → Book Visit Screen
    → Project Detail Screen
      → Master Plan Screen (fullscreen)
      → Unit Detail Sheet (bottom sheet)
      → Gallery Screen (fullscreen)
      → Video Screen
      → 3D View Screen

Properties Tab:
  Properties List Screen
    → Filter Screen (full screen on mobile)
    → Property Detail Screen (shared with Home)

Projects Tab:
  Projects List Screen
    → Project Detail Screen (shared with Home)

Saved Tab:
  Saved Properties Screen (auth gate — login prompt if not logged in)
    → Property Detail Screen

Account Tab:
  → If not logged in: Login / Register Screen
  → If logged in:
      Dashboard Overview Screen
        → Inquiries Screen
        → Visit Appointments Screen
        → Documents Screen
        → Profile Settings Screen
        → Notifications Screen
```

### 2.3 Deep Links

| Deep Link | Screen |
|-----------|--------|
| `attaie://property/:id` | Property Detail |
| `attaie://project/:id` | Project Detail |
| `attaie://project/:id/masterplan` | Master Plan |
| `attaie://inquiry/:id` | Inquiry detail |
| `attaie://visit/:id` | Visit detail |

Registered in `AndroidManifest.xml` as intent filters.

---

## Phase 3 — Capacitor Plugins & Native Bridges

**Goal:** Wire all native device capabilities to the web layer.

### 3.1 Official Capacitor Plugins

| Plugin | Package | Usage |
|--------|---------|-------|
| Push Notifications | `@capacitor/push-notifications` | FCM push |
| Local Notifications | `@capacitor/local-notifications` | Scheduled reminders |
| Camera | `@capacitor/camera` | Profile photo upload |
| Filesystem | `@capacitor/filesystem` | Save documents |
| Geolocation | `@capacitor/geolocation` | Nearby properties |
| Haptics | `@capacitor/haptics` | Feedback on interactions |
| Status Bar | `@capacitor/status-bar` | Status bar color per screen |
| Splash Screen | `@capacitor/splash-screen` | Custom splash |
| Share | `@capacitor/share` | Share property link |
| Browser | `@capacitor/browser` | Open external links in-app |
| Biometric Auth | `capacitor-native-biometric` | Face/fingerprint login |
| Google Maps | `@capacitor/google-maps` | Native maps component |

### 3.2 Push Notification Flow

```
Firebase Console / Backend API
  ↓ FCM
Android Device
  ↓ MyFirebaseMessagingService.kt
  ↓ Display notification (if app in background)
  ↓ If app in foreground → emit event to web layer
  ↓ @capacitor/push-notifications listener in React
  ↓ Show in-app notification banner
  ↓ On tap → deep link to relevant screen
```

**Notification types and actions:**

| Type | Title | Deep Link |
|------|-------|-----------|
| New inquiry reply | "Agent replied to your inquiry" | `attaie://inquiry/:id` |
| Visit confirmed | "Your visit is confirmed" | `attaie://visit/:id` |
| Visit reminder | "Your visit is tomorrow at 10am" | `attaie://visit/:id` |
| Price change | "Price update on saved property" | `attaie://property/:id` |
| New listing | "New property in your area" | `attaie://property/:id` |

### 3.3 Biometric Authentication

```typescript
// On login success — offer biometric setup
await NativeBiometric.setCredentials({
  username: userEmail,
  password: accessToken,
  server: 'api.attaieproperties.com'
});

// On subsequent app open — check for biometric
const available = await NativeBiometric.isAvailable();
if (available.isAvailable) {
  const verified = await NativeBiometric.verifyIdentity({
    reason: 'Login to Attaie Properties',
    title: 'Biometric Login',
    negativeButtonText: 'Use Password'
  });
  const credentials = await NativeBiometric.getCredentials({ server: '...' });
  // Use stored token
}
```

---

## Phase 4 — Design System (Material Design 3)

**Goal:** Android-native feel using Material You with brand color overrides.

### 4.1 Color Theme

```xml
<!-- values/colors.xml -->
<color name="brand_primary">#B8944A</color>
<color name="brand_dark">#1A2335</color>
<color name="brand_light">#F5EFE6</color>
<color name="status_available">#22C55E</color>
<color name="status_pending">#F59E0B</color>
<color name="status_sold">#EF4444</color>
```

```xml
<!-- values/themes.xml — Material You seed color -->
<style name="Theme.AttaieProperties" parent="Theme.Material3.Light">
    <item name="colorPrimary">@color/brand_primary</item>
    <item name="colorOnPrimary">@color/white</item>
    <item name="colorSurface">@color/white</item>
    <item name="colorBackground">#FAFAFA</item>
</style>
```

### 4.2 Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display | Playfair Display | 56sp | Bold |
| Headline Large | Playfair Display | 32sp | SemiBold |
| Headline Medium | Inter | 28sp | SemiBold |
| Body Large | Inter | 16sp | Regular |
| Body Medium | Inter | 14sp | Regular |
| Label | Inter | 12sp | Medium |

Arabic: swap all to Tajawal, increase lineSpacingMultiplier to 1.8.

### 4.3 Key UI Component Patterns

| Component | Implementation |
|-----------|---------------|
| Property card | MaterialCardView, 16dp corner radius, shadow elevation 2dp |
| Status badge | Chip (MaterialChip) with status color background |
| Filter panel | ModalBottomSheetDialog with checkbox groups |
| Image gallery | ViewPager2 + ZoomageView for pinch-zoom |
| Search | SearchBar (MD3) in toolbar |
| Inquiry form | TextInputLayout (OutlinedBox style) |
| WhatsApp FAB | ExtendedFloatingActionButton (sticky bottom-right) |
| In-app notification | Snackbar with action button |
| Map view | @capacitor/google-maps native component |
| Masterplan | WebView component with touch-passthrough events |
| Skeleton loading | ShimmerFrameLayout over card placeholders |

### 4.4 RTL Support

```xml
<!-- AndroidManifest.xml -->
<application android:supportsRtl="true" ... >
```

```xml
<!-- In all layouts — use start/end instead of left/right -->
android:layout_marginStart="16dp"
android:layout_marginEnd="16dp"
android:textAlignment="viewStart"
```

The web layer handles RTL automatically via `dir="rtl"` on `<html>`. The native Kotlin shell inherits device locale.

---

## Phase 5 — Performance Optimization

**Goal:** Smooth, fast experience on mid-range Android devices.

### 5.1 Image Optimization

- All images served in WebP format from Appwrite
- `BitmapFactory` decode options: inSampleSize based on target view size
- Glide library for native image loading (if any native screens)
- Web layer: `loading="lazy"` on all `<img>` tags
- Thumbnail sizes: 400×300 for cards, 800×600 for detail, full-res for gallery

### 5.2 Web Layer Performance

- Vite build: code splitting per route (each page ~30–60KB gzipped)
- Preload critical fonts in `<head>`
- TanStack Query: 5min stale time, 30min cache, background refetch
- Virtual scroll (react-virtuoso) for property lists > 50 items
- Service worker: cache static assets + last-viewed property pages

### 5.3 Cold Start Target: Under 2 Seconds

Sequence:
1. Splash screen shows immediately (native, no JS needed) — 0ms
2. WebView begins loading web bundle — background
3. Splash hides at 2 seconds maximum
4. Firebase data: load from local cache first, then refresh

### 5.4 Memory Management

- Avoid holding large bitmaps in memory — release on fragment destroy
- Web: avoid memory leaks in useEffect (cleanup all Firebase listeners)
- Recycle `RecyclerView` / virtual list cells
- Limit concurrent image loads to 3

---

## Phase 6 — Offline Support

**Goal:** Core content browsable without internet.

### 6.1 Cached Data (Persisted Locally)

| Data | Storage | TTL |
|------|---------|-----|
| Last 20 viewed properties | localforage (IndexedDB in WebView) | 7 days |
| Last 5 viewed projects | localforage | 7 days |
| Saved property IDs | localforage | Indefinite |
| User profile | localforage | Until logout |

### 6.2 Offline UI Behavior

- Show cached data with "Last updated X ago" notice
- Disable form submissions (inquiry, visit booking) with "No internet" banner
- Show cached property images (browser cache)
- Retry queue: store failed API calls, replay when connection restored

### 6.3 Network Status

```typescript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
// { connected: boolean, connectionType: 'wifi' | 'cellular' | 'none' }

Network.addListener('networkStatusChange', status => {
  // Show/hide offline banner
  // Replay queued requests if now connected
});
```

---

## Phase 7 — Security

**Goal:** Production-grade security for app store and user data.

### 7.1 Data Storage Security

- JWT access token: `EncryptedSharedPreferences` (AES-256)
- Never store sensitive data in standard `SharedPreferences`
- Biometric credentials: Android Keystore system via `NativeBiometric`
- User profile cache: encrypted with device key

### 7.2 Network Security

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">attaieproperties.com</domain>
    </domain-config>
</network-security-config>
```

- HTTPS enforced — no HTTP traffic
- Certificate pinning for API domain (production only)
- Root detection: warn user if device is rooted

### 7.3 Code Protection

```
# proguard-rules.pro
-keep class com.attaie.properties.** { *; }
-keepattributes *Annotation*
-dontobfuscate (debug), full obfuscation on release
```

R8 full mode enabled in release builds.

---

## Phase 8 — Build & Release Pipeline

**Goal:** Automated build and Play Store release.

### 8.1 Build Commands

```bash
# Build web layer
npm run build:mobile

# Sync to Android
npx cap sync android

# Debug APK
cd android && ./gradlew assembleDebug

# Release APK
./gradlew assembleRelease

# Release AAB (Play Store)
./gradlew bundleRelease
```

### 8.2 Version Management

```gradle
// app/build.gradle
defaultConfig {
    versionCode 14          ← Increment each Play Store upload
    versionName "1.4.0"     ← Semantic versioning
}
```

### 8.3 CI/CD Pipeline (GitHub Actions)

```yaml
Trigger: Push to main or release tag
Steps:
  1. Checkout + Node setup
  2. npm ci + npm run build:mobile
  3. npx cap sync android
  4. Setup Java 17
  5. Decode keystore from GitHub secret
  6. ./gradlew bundleRelease
  7. Upload AAB to Play Store (fastlane supply)
  8. Create GitHub Release
```

### 8.4 Play Store Requirements

- App icon: 512×512 PNG (no alpha)
- Feature graphic: 1024×500 JPG
- Screenshots: phone (min 2), 7-inch tablet, 10-inch tablet
- Privacy policy URL: required (handles user data)
- Data safety form: complete all fields (location, personal info)
- Target API 34: required for new apps
- 64-bit support: ensure all native libs have arm64-v8a

---

## Phase 9 — Testing

### 9.1 Testing Layers

| Layer | Tool | What to test |
|-------|------|-------------|
| Unit | Vitest | Business logic, services, utils |
| Component | React Testing Library | UI components in isolation |
| Integration | Playwright (Web) | Full user flows in browser |
| Device | Android Emulator + real devices | Native plugins, gestures, orientation |
| Performance | Android Profiler | Memory, CPU, frame rate |
| Accessibility | TalkBack | Screen reader compatibility |

### 9.2 Device Matrix

Test on:
- Budget: Samsung Galaxy A14 (Android 13)
- Mid-range: Samsung Galaxy A54 (Android 14)
- Flagship: Samsung Galaxy S24 (Android 14)
- Small screen: 5.0" (360dp width)
- Large screen: 6.7" + tablet 10"

---

## Phase 10 — Analytics & Monitoring

### 10.1 Firebase Analytics Events

Same events as web, plus mobile-specific:
- `app_open` — cold vs warm start
- `deep_link_open` — source + destination
- `push_notification_tap` — notification type
- `biometric_login` — success or fallback
- `share_property` — property ID + platform

### 10.2 Crash Reporting

Firebase Crashlytics enabled in release builds:
- Automatic crash reports
- Non-fatal error logging: `FirebaseCrashlytics.getInstance().recordException(e)`
- User identifier set on login (uid only, no PII)
