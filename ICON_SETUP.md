# 🎨 **CUSTOM APP ICON SETUP INSTRUCTIONS**

## **📁 STEP 1: Place Your Logo**

**Place your `logo.jpg` file here**: `build/icons/logo.jpg`

```bash
# Navigate to your project
cd /Users/lucamack/Desktop/projects/formtest.server

# Place your logo in the icons directory
cp /path/to/your/logo.jpg build/icons/logo.jpg
```

## **🔧 STEP 2: Generate Icons**

Once your logo is in place, run the icon generation script:

```bash
npm run generate-icons
```

This will automatically create:
- `build/icons/icon.icns` - macOS app icon
- `build/icons/icon.ico` - Windows app icon
- `build/icons/icon.png` - Linux app icon
- Multiple sizes for each platform

## **📦 STEP 3: Build with Custom Icons**

After generating icons, build your app:

```bash
# Build for current platform
npm run dist

# Build for macOS
npm run dist:mac

# Build for Windows  
npm run dist:win

# Build for all platforms
npm run dist:all
```

## **✅ VERIFICATION**

Your custom icon will appear:
- **macOS**: In dock, Applications folder, and .dmg installer
- **Windows**: In taskbar, Start menu, and desktop shortcut
- **Linux**: In application launcher and file manager

## **🎯 REQUIREMENTS**

- **Format**: JPG, PNG, or SVG recommended
- **Size**: Minimum 512x512 pixels (1024x1024 preferred)
- **Quality**: High resolution for crisp results
- **Background**: Transparent or solid color

## **🚀 READY TO GO!**

Your FormTest Server app will now use your custom logo as the application icon across all platforms!

**Note**: The frameless window with custom traffic lights is already implemented and will work automatically.
