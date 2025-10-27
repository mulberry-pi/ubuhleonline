# 📱 Ubuhle Mobile App Setup Guide

Your app is now configured for native mobile deployment with full camera and photo gallery access!

## ✨ What You Get

- **Native Camera**: Full access to device camera with smooth experience
- **Photo Gallery**: Browse and select photos from device gallery with thumbnails
- **Smart Permissions**: Native permission dialogs that remember user choices
- **Works without account**: Users can upload photos even before signing in/up

## 🚀 Testing on Your Device

### Step 1: Export to GitHub
1. Click the **"Export to GitHub"** button in Lovable
2. Git pull the project to your local machine

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Add Native Platforms

**For iOS (requires Mac with Xcode):**
```bash
npx cap add ios
npx cap update ios
```

**For Android (requires Android Studio):**
```bash
npx cap add android
npx cap update android
```

### Step 4: Build the Web App
```bash
npm run build
```

### Step 5: Sync to Native Platform
```bash
npx cap sync
```

Run this command **every time** you pull new changes from GitHub.

### Step 6: Run on Device/Emulator

**iOS:**
```bash
npx cap run ios
```
- Opens in Xcode
- Select your device or simulator
- Click Run

**Android:**
```bash
npx cap run android
```
- Opens in Android Studio
- Select your device or emulator
- Click Run

## 📸 Camera & Gallery Features

When users click "Choose Source" they'll see:

1. **Photo Gallery** - Opens native photo picker with thumbnails
2. **Take a Photo** - Opens native camera app
3. **My Files** - Traditional file browser (fallback)

### Permissions Flow

- **First time**: Native dialog asks "Allow Ubuhle to access your camera/photos?"
- **User choice**: Allow Once, Allow, or Don't Allow
- **Remembered**: Device remembers choice for future uses
- **Settings**: Users can change permissions in device Settings > Ubuhle

## 🌐 Development Testing

The app is configured for **hot reload** during development:
- Changes in Lovable appear instantly on your device
- No need to rebuild constantly
- Perfect for rapid iteration

## 📦 Distribution Options

### Option 1: Testing (No App Store Needed)
- **iOS**: Use TestFlight (up to 10,000 testers)
- **Android**: Share APK directly with users

### Option 2: App Store Publishing
- **Apple App Store**: $99/year developer account
- **Google Play Store**: $25 one-time fee
- Submit when ready for public release

## 🔧 Troubleshooting

**Camera not working?**
- Check device permissions: Settings > Ubuhle > Allow Camera
- Rebuild: `npm run build && npx cap sync`

**Gallery showing file picker instead of photos?**
- This is expected in web browser preview
- Native gallery only works on actual mobile device

**Changes not appearing?**
- Run `npx cap sync` after pulling new code
- Restart the app on your device

## 📝 Notes

- The web preview in Lovable will show basic file upload (browser limitation)
- Full native camera/gallery experience only works on actual devices
- Permissions are handled automatically by Capacitor
- No need to manually configure Info.plist or AndroidManifest.xml

## 🆘 Need Help?

Check out the Capacitor documentation:
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [iOS Setup Guide](https://capacitorjs.com/docs/ios)
- [Android Setup Guide](https://capacitorjs.com/docs/android)
