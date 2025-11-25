# Camera Testing Guide

This guide provides alternative ways to test the camera functionality without dealing with proxy servers.

## 🎯 Option 1: Test on Your Phone Directly

The easiest way to test camera functionality is to access the app from your phone on the same network.

### Steps:

1. **Find your computer's IP address**:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```
   
   Look for something like `192.168.1.x` or `10.0.0.x`

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Update Vite config** to allow network access:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       host: '0.0.0.0', // Allow external access
       port: 3000,
     }
   })
   ```

4. **Access from your phone**:
   - Make sure your phone is on the same WiFi network
   - Open browser on phone: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.5:3000`

5. **Test camera**:
   - Click "Scan Receipt"
   - Grant camera permission
   - Camera will work natively on your phone!

---

## 🎯 Option 2: Use HTTPS with Localhost Tunnel

Modern browsers require HTTPS for camera access. Use a tunnel service:

### Using ngrok (Recommended):

1. **Install ngrok**:
   ```bash
   # Mac
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your app**:
   ```bash
   npm run dev
   ```

3. **Create tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL**:
   - ngrok will show: `https://abc123.ngrok.io`
   - Open this URL in any browser (even your phone)
   - Camera will work over HTTPS!

### Using Cloudflare Tunnel:

```bash
# Install
brew install cloudflare/cloudflare/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000
```

---

## 🎯 Option 3: Mobile App with Capacitor (Native)

Convert to a real mobile app:

1. **Install Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/camera @capacitor/filesystem
   npx cap init
   ```

2. **Add platforms**:
   ```bash
   npm install @capacitor/ios @capacitor/android
   npx cap add ios
   npx cap add android
   ```

3. **Build and sync**:
   ```bash
   npm run build
   npx cap sync
   ```

4. **Open in native IDE**:
   ```bash
   # iOS
   npx cap open ios
   
   # Android
   npx cap open android
   ```

5. **Run on device or emulator** - camera works natively!

---

## 🎯 Option 4: Use Expo Go (Easiest for Mobile)

If you want Expo-like experience:

### Convert to React Native with Expo:

1. **Create Expo app**:
   ```bash
   npx create-expo-app pantrix-mobile
   cd pantrix-mobile
   ```

2. **Install dependencies**:
   ```bash
   npx expo install expo-camera expo-image-picker
   npm install @supabase/supabase-js @anthropic-ai/sdk
   ```

3. **Use Expo Camera**:
   ```typescript
   import { Camera } from 'expo-camera';
   import * as ImagePicker from 'expo-image-picker';
   
   // Request permission
   const { status } = await Camera.requestCameraPermissionsAsync();
   
   // Take photo
   const photo = await camera.takePictureAsync();
   ```

4. **Test with Expo Go**:
   ```bash
   npx expo start
   ```
   - Scan QR code with Expo Go app
   - Camera works instantly on your phone!

---

## 🎯 Option 5: Browser with Test Images

Test without real camera:

1. **Use file input instead of camera**:
   ```typescript
   // In ReceiptScanScreen.tsx
   <input
     type="file"
     accept="image/*"
     capture="environment" // Suggests rear camera
     onChange={handleImageSelect}
   />
   ```

2. **Prepare test images**:
   - Save sample receipts on your device
   - Upload them via file picker
   - Test OCR without camera access

---

## 📱 Recommended Setup for Development

### For Quick Testing:
1. Use **ngrok** (Option 2) - works everywhere, HTTPS included
2. Access from any device
3. No code changes needed

### For Production-Like Testing:
1. Test on phone via local network (Option 1)
2. Real device, real camera
3. See actual performance

### For Native App:
1. Use **Capacitor** (Option 3) - keep your existing React code
2. Or use **Expo** (Option 4) - requires React Native conversion
3. Best user experience

---

## 🔧 Quick Fix: Update Camera Component

Make camera work better in browsers:

```typescript
// src/components/CameraView.tsx
const constraints = {
  video: {
    facingMode: { ideal: 'environment' }, // Rear camera
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

---

## 🎬 Testing Checklist

- [ ] Camera permission granted
- [ ] Video stream shows
- [ ] Can capture image
- [ ] Image is clear
- [ ] Can switch cameras (front/back)
- [ ] Gallery upload works
- [ ] Image is sent to API
- [ ] Receipt items are extracted
- [ ] Items are added to inventory

---

## 🚀 My Recommendation

**Best approach for your use case:**

1. **For Development**: Use **ngrok** (Option 2)
   - Fastest setup
   - Works on any device
   - HTTPS included
   - No proxy needed

2. **For Production**: Use **Capacitor** (Option 3)
   - Keep your existing React code
   - Native camera access
   - Better performance
   - App store ready

---

## 📝 Implementation Example

### Using ngrok (Simplest):

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Start tunnel
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000

# Open https://abc123.ngrok.io in any browser
# Camera works!
```

### No Proxy Needed! 🎉

---

## ❓ Need Help?

- **Camera not working?** → Check HTTPS is enabled (use ngrok/tunnel)
- **Permission denied?** → Check browser/phone settings
- **Blurry images?** → Adjust camera constraints (resolution)
- **API errors?** → Check Anthropic API key in .env

For more help, see `MANUAL-TESTING-GUIDE.md`

