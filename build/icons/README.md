# 🎨 **APP ICON SETUP**

## **📁 PLACE YOUR LOGO HERE**

**Required File**: `logo.jpg`

1. **Place your logo.jpg file** in this directory (`build/icons/logo.jpg`)
2. **Run icon generation**: `npm run generate-icons`
3. **Icons will be auto-generated** for all platforms:
   - `icon.icns` - macOS app icon
   - `icon.ico` - Windows app icon  
   - `icon.png` - Linux app icon
   - Multiple sizes for each platform

## **📋 REQUIREMENTS**

- **Format**: JPG, PNG, or SVG
- **Size**: Minimum 512x512 pixels (1024x1024 recommended)
- **Quality**: High resolution for best results
- **Background**: Transparent or solid color

## **🚀 USAGE**

```bash
# After placing logo.jpg in this directory:
npm run generate-icons

# Icons will be generated automatically
# Build process will use custom icons
```

**The build system will automatically use your custom icons once generated!**
