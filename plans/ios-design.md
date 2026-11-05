# iOS Software Design — Attaie Properties App

## Overview

Native-feel iOS app built with Capacitor (React web app wrapped in native shell) for maximum
code reuse with the website, while delivering full iOS capabilities: APNs push notifications,
Apple Sign-In, MapKit, Face ID / Touch ID, and App Store distribution.

---

## Platform Targets

| Setting | Value |
|---------|-------|
| Minimum iOS | 16.0 |
| Target iOS | 17+ |
| Devices | iPhone + iPad (universal) |
| Build Tool | Capacitor 6 + Xcode 15+ |
| Bundle ID | `com.attaie.properties` |
| Language | Swift 5.9 (native shell) + TypeScript (web layer) |

---

## Phase 1 — Project Setup & Configuration

**Goal:** Working iOS project with Firebase, code signing, and Capacitor bridge.

### 1.1 Capacitor Initialization

```bash
npm install @capacitor/core @capacitor/ios
npx cap add ios
npx cap open ios
```

### 1.2 `capacitor.config.json` (iOS section)

```json
{
  "appId": "com.attaie.properties",
  "appName": "Attaie Properties",
  "webDir": "dist",
  "ios": {
    "contentInset": "automatic",
    "backgroundColor": "#1A2335",
    "scheme": "App",
    "limitsNavigationsToAppBoundDomains": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1A2335",
      "launchAutoHide": true,
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
ios/
│
├── App/
│   ├── AppDelegate.swift               ← UIApplication delegate
│   ├── SceneDelegate.swift             ← Multi-window support
│   ├── ViewController.swift            ← Capacitor bridge host
│   ├── Info.plist                      ← Permissions + config
│   ├── PrivacyInfo.xcprivacy           ← Required for iOS 17+
│   ├── Assets.xcassets/
│   │   ├── AppIcon.appiconset/         ← All icon sizes
│   │   ├── Colors/                     ← Brand adaptive colors
│   │   └── LaunchImage/
│   ├── LaunchScreen.storyboard
│   └── GoogleService-Info.plist        ← Firebase config (NOT committed)
│
├── Podfile                             ← CocoaPods dependencies
├── Podfile.lock
└── AttaieProperties.xcodeproj/
    └── project.pbxproj
```

### 1.4 Info.plist Permissions

```xml
<!-- NSCameraUsageDescription -->
<key>NSCameraUsageDescription</key>
<string>Attaie Properties needs camera access to upload your profile photo and documents.</string>

<!-- NSPhotoLibraryUsageDescription -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Attaie Properties needs photo library access to upload property and document images.</string>

<!-- NSLocationWhenInUseUsageDescription -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Attaie Properties uses your location to show nearby properties.</string>

<!-- NSUserNotificationsUsageDescription - note: not in Info.plist, handled via UNUserNotificationCenter -->

<!-- Face ID -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to securely log in to Attaie Properties.</string>
```

### 1.5 PrivacyInfo.xcprivacy (iOS 17+ Required)

Declare all APIs used:
```xml
<dict>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <!-- File timestamp APIs -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array><string>C617.1</string></array>
    </dict>
  </array>
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <!-- Declare: name, email, phone, location usage -->
  </array>
</dict>
```

### 1.6 Podfile Dependencies

```ruby
platform :ios, '16.0'
use_frameworks!

target 'App' do
  pod 'CapacitorCordova'
  pod 'Capacitor'
  pod 'Firebase/Analytics'
  pod 'Firebase/Auth'
  pod 'Firebase/Database'
  pod 'Firebase/Messaging'
  pod 'Firebase/Crashlytics'
  pod 'GoogleSignIn'
end
```

---

## Phase 2 — Navigation & Screen Architecture

**Goal:** Define all screens, tab bar structure, and deep-link routing.

### 2.1 Tab Bar Structure

```
Tab 1: Home          (house.fill)
Tab 2: Properties    (building.2.fill)
Tab 3: Projects      (map.fill)
Tab 4: Saved         (heart.fill)
Tab 5: Account       (person.fill)
```

Uses SF Symbols. Active tab: brand gold. Inactive: neutral gray.
Badge on Account when notifications present.

### 2.2 Full Screen Map

```
App Launch
  └── LaunchScreen (native, immediate)
       └── Onboarding Flow (first install — 3 slides, stored in UserDefaults)
            └── Main App (TabBarController)

Home Tab:
  Home Screen (UINavigationController)
    → Property Detail Screen
      → Virtual Tour Screen (fullscreen SFSafariViewController)
      → Inquiry Form Screen
      → Book Visit Screen (date picker sheet)
    → Project Detail Screen
      → Master Plan Screen (fullscreen + pinch-zoom)
      → Unit Detail (UISheetPresentationController — half sheet)
      → Gallery Screen (fullscreen, swipe to dismiss)
      → Video Screen (AVPlayerViewController)
      → 3D / VR Screen (WKWebView fullscreen)

Properties Tab:
  Properties List Screen
    → Filter Sheet (UISheetPresentationController, large detent)
    → Property Detail Screen

Projects Tab:
  Projects List Screen
    → Project Detail Screen

Saved Tab:
  Auth check → Login screen (if not authenticated)
  Saved Properties Screen
    → Property Detail Screen

Account Tab:
  Login / Register Screen (if not authenticated)
  Dashboard Screen
    → Inquiry History Screen
    → Visit Appointments Screen
    → Documents Screen
    → Profile Settings Screen
    → Notifications Settings Screen
```

### 2.3 Deep Links (Universal Links + URL Scheme)

| URL | Screen |
|-----|--------|
| `attaie://property/:id` | Property Detail |
| `attaie://project/:id` | Project Detail |
| `attaie://project/:id/masterplan` | Master Plan |
| `attaie://inquiry/:id` | Inquiry detail |
| `attaie://visit/:id` | Visit detail |
| `https://attaieproperties.com/properties/:id` | Universal Link → Property Detail |

Universal Links require an `apple-app-site-association` file on the web server.

---

## Phase 3 — Capacitor Plugins & Native Bridges

**Goal:** Full native capability from the web layer.

### 3.1 Official Capacitor Plugins

| Plugin | Package | Usage |
|--------|---------|-------|
| Push Notifications | `@capacitor/push-notifications` | APNs via FCM |
| Local Notifications | `@capacitor/local-notifications` | Scheduled reminders |
| Camera | `@capacitor/camera` | Photo capture and library |
| Filesystem | `@capacitor/filesystem` | Save documents |
| Geolocation | `@capacitor/geolocation` | Nearby properties |
| Haptics | `@capacitor/haptics` | UIImpactFeedbackGenerator |
| Status Bar | `@capacitor/status-bar` | Dynamic status bar styling |
| Splash Screen | `@capacitor/splash-screen` | Control splash visibility |
| Share | `@capacitor/share` | UIActivityViewController |
| Browser | `@capacitor/browser` | SFSafariViewController |
| Biometric Auth | `capacitor-native-biometric` | Face ID / Touch ID |
| Google Maps | `@capacitor/google-maps` | Native MapView |

### 3.2 APNs Push Notification Setup

**AppDelegate.swift:**
```swift
import Firebase
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()
    UNUserNotificationCenter.current().delegate = self
    return true
  }

  func application(_ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
  }
}
```

**Push Notification Types & Actions:**

| Type | Title | Deep Link |
|------|-------|-----------|
| Inquiry reply | "Agent replied to your inquiry" | `attaie://inquiry/:id` |
| Visit confirmed | "Your visit is confirmed" | `attaie://visit/:id` |
| Visit reminder | "Your visit is tomorrow" | `attaie://visit/:id` |
| Price change | "Price update on saved property" | `attaie://property/:id` |
| New listing | "New property matching your search" | `attaie://property/:id` |

Notification categories with action buttons:
- Visit reminder: "Confirm Attendance" / "Cancel Visit"
- Price change: "View Property" / "Remove from Saved"

### 3.3 Face ID / Touch ID Implementation

```typescript
import { NativeBiometric } from 'capacitor-native-biometric';

// After successful login — offer biometric setup
const result = await NativeBiometric.isAvailable();
if (result.isAvailable) {
  await NativeBiometric.setCredentials({
    username: userEmail,
    password: accessToken,
    server: 'api.attaieproperties.com'
  });
}

// On app launch — attempt biometric login
try {
  await NativeBiometric.verifyIdentity({
    reason: 'Log in to Attaie Properties',
    title: 'Biometric Login',
    subtitle: 'Use Face ID or Touch ID',
    negativeButtonText: 'Use Password'
  });
  const creds = await NativeBiometric.getCredentials({
    server: 'api.attaieproperties.com'
  });
  // Use stored token to authenticate
} catch {
  // Fall back to password login
}
```

---

## Phase 4 — Design System (Apple HIG)

**Goal:** Authentic iOS feel that respects Apple's Human Interface Guidelines.

### 4.1 Adaptive Color Assets

Defined in `Assets.xcassets/Colors/`:

| Asset Name | Light | Dark |
|------------|-------|------|
| `BrandPrimary` | `#B8944A` | `#C9A55E` |
| `BrandDark` | `#1A2335` | `#0D1520` |
| `BrandLight` | `#F5EFE6` | `#2A2520` |
| `StatusAvailable` | `#22C55E` | `#16A34A` |
| `StatusPending` | `#F59E0B` | `#D97706` |
| `StatusSold` | `#EF4444` | `#DC2626` |
| `Background` | `#FAFAFA` | `#1C1C1E` |
| `CardSurface` | `#FFFFFF` | `#2C2C2E` |

All colors referenced by name in code — never hardcoded hex in Swift or CSS.

### 4.2 Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display | Playfair Display | 56pt | Bold |
| Headline 1 | Playfair Display | 34pt | Bold |
| Headline 2 | SF Pro Display | 28pt | Semibold |
| Title | SF Pro Text | 20pt | Semibold |
| Body | SF Pro Text | 17pt | Regular |
| Body Small | SF Pro Text | 15pt | Regular |
| Caption | SF Pro Text | 13pt | Regular |
| Label | SF Pro Text | 12pt | Medium |

Arabic: all SF Pro replaced with Tajawal. Line height ×1.8.

Dynamic Type: All text sizes linked to system text size preferences.

### 4.3 Key UI Component Patterns

| Component | iOS Implementation |
|-----------|-------------------|
| Property card | `UICollectionViewCell` / SwiftUI `Card` — 16pt corner radius |
| Status badge | `UILabel` with `UIView` background — pill shape |
| Filter panel | `UISheetPresentationController` — medium + large detents |
| Image gallery | `UIPageViewController` + `UIPinchGestureRecognizer` |
| Search | `UISearchController` in `UINavigationController` |
| Inquiry form | Scroll view with `UITextField` (rounded rect style) |
| WhatsApp FAB | `UIButton` pinned to `safeAreaLayoutGuide` bottom-trailing |
| Push banner | Custom in-app banner (slide from top, auto-dismiss 4 sec) |
| Map | `MKMapView` via `@capacitor/google-maps` native bridge |
| Masterplan | `WKWebView` with gesture passthrough config |
| Skeleton | `CAGradientLayer` shimmer animation on placeholder views |

### 4.4 RTL Support

```swift
// AppDelegate.swift
if Locale.current.language.languageCode?.identifier == "ar" {
    UIView.appearance().semanticContentAttribute = .forceRightToLeft
}
```

Web layer auto-switches via `dir="rtl"` on `<html>`. Test that:
- Back button still points correctly
- Tab bar icons don't flip (they shouldn't — SF Symbols handles this)
- List swipe actions appear on correct side

---

## Phase 5 — Performance Optimization

**Goal:** 60fps on iPhone 12 and above, smooth on iPhone SE (2nd gen).

### 5.1 Image Optimization

- All images served in HEIF/WebP from Appwrite
- Thumbnail sizes: 400×300 (card), 800×600 (detail), full-res (gallery lightbox)
- `URLCache` for web layer (300MB disk, 50MB memory)
- Native image loading: `SDWebImage` or `Kingfisher` if any native views
- Responsive `srcset` for all `<img>` in web layer

### 5.2 Web Layer Performance

- Vite build: code-split per route
- Preconnect: `<link rel="preconnect" href="https://api.attaieproperties.com">`
- TanStack Query: stale 5min, GC 30min, background refetch on focus
- Virtual scroll for lists > 50 items
- Service worker: cache static bundles + offline fallback

### 5.3 Cold Start Target: Under 2 Seconds

Sequence:
1. LaunchScreen.storyboard — shows instantly (0ms, native)
2. WKWebView loads from bundle — background
3. Splash hides at 2 seconds
4. First data: from localforage cache → UI shows immediately → background refresh

### 5.4 WKWebView Configuration

```swift
let config = WKWebViewConfiguration()
config.allowsInlineMediaPlayback = true
config.mediaTypesRequiringUserActionForPlayback = []

// Process pool reuse (prevents re-init on navigation)
let sharedPool = WKProcessPool()
config.processPool = sharedPool
```

### 5.5 ProMotion (120Hz) Support

- Enable in Info.plist: `CADisableMinimumFrameDurationOnPhone = YES`
- CSS animations using `will-change: transform` trigger Metal rendering
- Avoid `requestAnimationFrame` loops that force 60fps cap

---

## Phase 6 — Offline Support

**Goal:** Core content browsable without internet.

### 6.1 Cached Data

| Data | Storage | TTL |
|------|---------|-----|
| Last 20 viewed properties | localforage (WKWebView IndexedDB) | 7 days |
| Last 5 projects | localforage | 7 days |
| Saved property IDs | localforage | Indefinite |
| User profile | localforage | Until logout |
| API responses | URLCache (native) | 5 min |

### 6.2 Offline UI

- Show cached content with "Last updated X ago" banner
- Disable inquiry/visit forms when offline with `Network.getStatus()`
- Service worker serves cached assets for full offline shell
- Retry on reconnect: Network plugin listener

---

## Phase 7 — Security

**Goal:** App Store compliance and user data protection.

### 7.1 Keychain Storage

```swift
// Never use UserDefaults for sensitive data
import Security

func saveToKeychain(key: String, value: String) {
    let data = value.data(using: .utf8)!
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrAccount: key,
        kSecValueData: data,
        kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemAdd(query as CFDictionary, nil)
}
```

All JWT tokens, refresh tokens, and credentials stored in Keychain only.

### 7.2 App Transport Security

```xml
<!-- Info.plist — ATS enforced by default, ensure no exceptions -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

All API calls must use HTTPS with valid certificates.

### 7.3 SSL Certificate Pinning

```swift
// URLSession delegate
func urlSession(_ session: URLSession,
    didReceive challenge: URLAuthenticationChallenge,
    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
    // Compare server cert against pinned cert
    // Reject if mismatch
}
```

### 7.4 Jailbreak Detection

```swift
func isJailbroken() -> Bool {
    #if !targetEnvironment(simulator)
    let paths = ["/Applications/Cydia.app", "/bin/bash", "/usr/sbin/sshd"]
    return paths.contains { FileManager.default.fileExists(atPath: $0) }
    #else
    return false
    #endif
}
```

Show warning but do not block access — log to analytics.

---

## Phase 8 — App Store Requirements & Submission

**Goal:** Pass App Store review and maintain compliance.

### 8.1 Required Assets

| Asset | Size | Format |
|-------|------|--------|
| App icon | 1024×1024 | PNG, no alpha, no rounded corners |
| iPhone screenshots | 1290×2796 (6.7") | PNG or JPEG |
| iPad screenshots | 2048×2732 (13") | PNG or JPEG |
| Preview video | Optional, 15–30 sec | .mov H.264 |

Minimum 3 screenshots per device type.

### 8.2 Apple Sign-In (Required)

Since Google Sign-In is offered, Apple Sign-In is mandatory per App Store guidelines.

```typescript
import { SignInWithApple } from '@capacitor-community/apple-sign-in';

const result = await SignInWithApple.authorize({
  clientId: 'com.attaie.properties',
  redirectURI: 'https://attaieproperties.com/auth/apple',
  scopes: 'email name',
  nonce: generateNonce()
});
// Send result.response.identityToken to backend for verification
```

### 8.3 Data Safety Declaration

Declare in App Store Connect:
- Name and email: collected, linked to identity, used for app functionality
- Location: collected, not linked, used for nearby search
- Device ID: collected, for analytics (anonymized)
- Crash data: collected for diagnostics

### 8.4 App Privacy Nutrition Label

| Data Type | Collected | Linked to Identity | Used For |
|-----------|-----------|-------------------|----------|
| Name | Yes | Yes | Account |
| Email | Yes | Yes | Account, contact |
| Phone | Yes | Yes | Account, contact |
| Location | Optional | No | Nearby features |
| Crash data | Yes | No | Diagnostics |
| Usage data | Yes | No | Analytics |

---

## Phase 9 — Build & Release Pipeline

**Goal:** Automated TestFlight and App Store releases.

### 9.1 Build Commands

```bash
# Build web layer for mobile
npm run build:mobile

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Or build from CLI (requires Xcode + code signing configured)
xcodebuild archive \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -archivePath build/AttaieProperties.xcarchive

xcodebuild -exportArchive \
  -archivePath build/AttaieProperties.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

### 9.2 Version Management

In `project.pbxproj`:
- `CURRENT_PROJECT_VERSION` (Build number) — increment each TestFlight upload
- `MARKETING_VERSION` (Version) — semantic: 1.4.0

### 9.3 CI/CD Pipeline (GitHub Actions + Fastlane)

```yaml
Trigger: Push to main or release tag
Steps:
  1. Checkout + Node setup
  2. npm ci + npm run build:mobile
  3. npx cap sync ios
  4. Setup Xcode 15
  5. Import code signing certs (Match / manual)
  6. bundle exec fastlane beta (TestFlight)
     or fastlane release (App Store)
  7. Create GitHub Release + changelog
```

### 9.4 Fastlane Lanes

```ruby
lane :beta do
  increment_build_number
  build_app(scheme: "App", export_method: "app-store")
  upload_to_testflight(skip_waiting_for_build_processing: true)
end

lane :release do
  increment_build_number
  build_app(scheme: "App", export_method: "app-store")
  upload_to_app_store(
    submit_for_review: true,
    automatic_release: false
  )
end
```

---

## Phase 10 — Testing

### 10.1 Testing Layers

| Layer | Tool | What to test |
|-------|------|-------------|
| Unit | Vitest | Business logic, services |
| UI Component | React Testing Library | Components in isolation |
| Integration | Playwright | Full user flows (web) |
| Device | Xcode Simulator + real devices | Native plugins, gestures |
| UI Automation | XCUITest | Critical iOS flows |
| Accessibility | VoiceOver | Screen reader flows |
| Performance | Instruments | Time Profiler, Memory |

### 10.2 Device Matrix

Test on:
- iPhone SE 3rd gen (small screen, iOS 16)
- iPhone 14 (standard, iOS 16)
- iPhone 15 Pro (ProMotion, Dynamic Island, iOS 17)
- iPad Air 5th gen (tablet layout, iOS 16)
- iPhone 15 Pro Max (max size, iOS 17)

### 10.3 Accessibility Testing

- VoiceOver: all screens must be fully navigable
- Dynamic Type: test at smallest and largest text sizes
- Reduce Motion: all animations respect `@media (prefers-reduced-motion)`
- Color blind: verify status badges readable without color alone (use icons + labels)

---

## Phase 11 — Analytics & Monitoring

### 11.1 Firebase Analytics (iOS-specific events)

Same events as Android, plus:
- `app_open` — cold start vs background resume
- `deep_link_open` — universal link vs URL scheme
- `push_notification_tap` — category + action button tapped
- `face_id_login` — success / failed / fallback
- `share_property` — UIActivityType destination

### 11.2 Crashlytics

```swift
// AppDelegate.swift
FirebaseApp.configure()
// Crashlytics enabled automatically after configure()

// In error handlers:
Crashlytics.crashlytics().record(error: nsError)
Crashlytics.crashlytics().setUserID(uid)  // No PII, uid only
```

Non-fatal errors logged for: Firebase connection failures, image load failures, API timeouts.
