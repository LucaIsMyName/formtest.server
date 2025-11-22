# 📦 **BUILD INSTRUCTIONS**

## **Cross-Platform Build Setup**

This project uses `electron-builder` to create native applications for macOS, Windows, and Linux.

### **🚀 Quick Build Commands**

```bash
# Build for current platform only
npm run dist

# Build for macOS (.app and .dmg)
npm run dist:mac

# Build for Windows (.exe installer and portable)
npm run dist:win

# Build for Linux (AppImage and .deb)
npm run dist:linux

# Build for all platforms
npm run dist:all
```

### **📱 Platform-Specific Outputs**

#### **macOS Builds:**
- **DMG Installer**: `dist-electron/FormTest Server-1.0.0.dmg`
- **ZIP Archive**: `dist-electron/FormTest Server-1.0.0-mac.zip`
- **Supports**: Intel (x64) and Apple Silicon (arm64)

#### **Windows Builds:**
- **NSIS Installer**: `dist-electron/FormTest Server Setup 1.0.0.exe`
- **Portable**: `dist-electron/FormTest Server 1.0.0.exe`
- **Supports**: 64-bit (x64) and 32-bit (ia32)

#### **Linux Builds:**
- **AppImage**: `dist-electron/FormTest Server-1.0.0.AppImage`
- **Debian Package**: `dist-electron/formtest-server_1.0.0_amd64.deb`
- **Supports**: 64-bit (x64)

### **🔧 Build Requirements**

#### **For macOS builds:**
- Must be run on macOS
- Xcode Command Line Tools installed
- Optional: Apple Developer account for code signing

#### **For Windows builds:**
- Can be run on any platform
- Wine (on macOS/Linux) for cross-compilation

#### **For Linux builds:**
- Can be run on any platform

### **📋 Build Assets**

The following files are used for building:

```
build/
├── entitlements.mac.plist    # macOS security entitlements
├── icon.icns                 # macOS app icon (512x512)
├── icon.ico                  # Windows app icon (256x256)
├── icon.png                  # Linux app icon (512x512)
└── background.png            # DMG background image
```

### **🎯 Build Configuration**

Key configuration in `package.json`:

- **App ID**: `com.formtest.server`
- **Product Name**: `FormTest Server`
- **Output Directory**: `dist-electron/`
- **Includes**: All compiled code, dependencies, test runner
- **Excludes**: Development files, tests, documentation

### **🔒 Code Signing (Optional)**

For production releases:

1. **macOS**: Add Apple Developer certificates
2. **Windows**: Add code signing certificate
3. **Update package.json** with signing configuration

### **📦 Distribution**

Built applications are ready for distribution:
- **macOS**: Upload .dmg to website or App Store
- **Windows**: Distribute .exe installer
- **Linux**: Share AppImage or publish .deb to repositories

### **🐛 Troubleshooting**

**Common Issues:**

1. **Native dependencies**: Run `npm run rebuild:sqlite` after install
2. **Missing icons**: Add icon files to `build/` directory
3. **Permission errors**: Check entitlements.mac.plist for macOS
4. **Large bundle size**: Review file exclusions in package.json

**Build Logs:**
Check `dist-electron/` for detailed build logs and error messages.
