# 🎨 **CUSTOM APP ICON & FRAMELESS WINDOW IMPLEMENTATION PLAN**

## **📋 OVERVIEW**

This plan implements:
1. **Custom App Icon** - Replace default Electron icon with user's logo.jpg
2. **Frameless Window** - Remove OS title bar and traffic lights
3. **Custom Traffic Lights** - Add macOS-style traffic lights inside the app
4. **Window Controls** - Implement close, minimize, maximize functionality

---

## **🎯 PHASE 1: CUSTOM APP ICON SETUP**

### **1.1 Icon File Structure**
```
build/icons/
├── logo.jpg                    # User's original logo (place here)
├── icon.icns                   # macOS app icon (512x512)
├── icon.ico                    # Windows app icon (256x256) 
├── icon.png                    # Linux app icon (512x512)
├── icon@2x.png                 # High-DPI version (1024x1024)
└── iconTemplate.png            # Template for generation
```

### **1.2 Icon Generation Process**
- **Input**: User places `logo.jpg` in `build/icons/` directory
- **Process**: Auto-generate all required icon formats from logo.jpg
- **Formats**: .icns (macOS), .ico (Windows), .png (Linux)
- **Sizes**: Multiple resolutions for each platform

### **1.3 Build Configuration Update**
- Update `package.json` build config to use custom icons
- Configure electron-builder to include icon files
- Test icon display in built applications

---

## **🖼️ PHASE 2: FRAMELESS WINDOW IMPLEMENTATION**

### **2.1 Main Process Changes**
```typescript
// src/main/index.ts
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  frame: false,           // Remove OS frame
  titleBarStyle: 'hidden', // Hide title bar
  trafficLightPosition: { x: -1000, y: -1000 }, // Hide traffic lights
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, '../preload/index.js')
  }
})
```

### **2.2 Window Controls IPC**
```typescript
// Add IPC handlers for window controls
ipcMain.handle('window-minimize', () => mainWindow.minimize())
ipcMain.handle('window-maximize', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize())
ipcMain.handle('window-close', () => mainWindow.close())
ipcMain.handle('window-is-maximized', () => mainWindow.isMaximized())
```

---

## **🚦 PHASE 3: CUSTOM TRAFFIC LIGHTS UI**

### **3.1 Traffic Light Component**
```tsx
// src/renderer/src/components/TrafficLights.tsx
interface TrafficLightsProps {
  onClose: () => void
  onMinimize: () => void  
  onMaximize: () => void
  isMaximized: boolean
}

const TrafficLights: React.FC<TrafficLightsProps> = ({
  onClose, onMinimize, onMaximize, isMaximized
}) => {
  return (
    <div className="traffic-lights">
      <button className="traffic-light close" onClick={onClose}>
        <div className="traffic-light-icon">×</div>
      </button>
      <button className="traffic-light minimize" onClick={onMinimize}>
        <div className="traffic-light-icon">−</div>
      </button>
      <button className="traffic-light maximize" onClick={onMaximize}>
        <div className="traffic-light-icon">{isMaximized ? '⧉' : '□'}</div>
      </button>
    </div>
  )
}
```

### **3.2 Traffic Light Styling**
```css
/* src/renderer/src/index.css */
.traffic-lights {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  -webkit-app-region: no-drag; /* Allow clicking */
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.traffic-light.close {
  background-color: #ff5f57;
}

.traffic-light.minimize {
  background-color: #ffbd2e;
}

.traffic-light.maximize {
  background-color: #28ca42;
}

.traffic-light:hover {
  opacity: 0.8;
}

.traffic-light-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8px;
  color: rgba(0, 0, 0, 0.6);
  display: none;
}

.traffic-light:hover .traffic-light-icon {
  display: block;
}
```

---

## **🔧 PHASE 4: LAYOUT INTEGRATION**

### **4.1 Custom Title Bar**
```tsx
// src/renderer/src/components/CustomTitleBar.tsx
const CustomTitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  const handleClose = () => window.api.windowControls.close()
  const handleMinimize = () => window.api.windowControls.minimize()
  const handleMaximize = () => {
    window.api.windowControls.maximize()
    setIsMaximized(!isMaximized)
  }

  return (
    <div className="custom-title-bar">
      <TrafficLights
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        isMaximized={isMaximized}
      />
      <div className="title-bar-title">
        Formtest.Server
      </div>
      <div className="title-bar-spacer" />
    </div>
  )
}
```

### **4.2 Layout Component Update**
```tsx
// src/renderer/src/components/Layout.tsx
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <CustomTitleBar />
      <div className="app-content">
        {/* Existing sidebar and main content */}
        <div className="sidebar">...</div>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
```

---

## **⚡ PHASE 5: IPC BRIDGE SETUP**

### **5.1 Preload Script Extension**
```typescript
// src/preload/index.ts
const api = {
  // Existing APIs...
  windowControls: {
    close: () => ipcRenderer.invoke('window-close'),
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized')
  }
}

contextBridge.exposeInMainWorld('api', api)
```

### **5.2 Type Definitions Update**
```typescript
// src/common/types.ts
interface WindowControls {
  close: () => Promise<void>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  isMaximized: () => Promise<boolean>
}

interface ElectronAPI {
  // Existing APIs...
  windowControls: WindowControls
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
```

---

## **🎨 PHASE 6: DRAG REGION IMPLEMENTATION**

### **6.1 Draggable Title Bar**
```css
.custom-title-bar {
  -webkit-app-region: drag; /* Make title bar draggable */
  height: 40px;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.traffic-lights,
.title-bar-buttons {
  -webkit-app-region: no-drag; /* Allow button clicks */
}
```

---

## **📦 PHASE 7: BUILD INTEGRATION**

### **7.1 Icon Build Process**
- Install `electron-icon-builder` for automatic icon generation
- Create npm script for icon generation from logo.jpg
- Update build process to include custom icons

### **7.2 Testing Strategy**
- Test frameless window on macOS, Windows, Linux
- Verify traffic light functionality
- Test window dragging and resizing
- Validate custom icon in built applications

---

## **✅ IMPLEMENTATION CHECKLIST**

### **Phase 1: Icon Setup**
- [ ] Create `build/icons/` directory structure
- [ ] Add icon generation script
- [ ] Update build configuration
- [ ] Test icon in development and built app

### **Phase 2: Frameless Window**
- [ ] Update main window configuration
- [ ] Add IPC handlers for window controls
- [ ] Test window creation without frame

### **Phase 3: Traffic Lights**
- [ ] Create TrafficLights component
- [ ] Implement traffic light styling
- [ ] Add hover effects and icons

### **Phase 4: Layout Integration**
- [ ] Create CustomTitleBar component
- [ ] Update Layout component
- [ ] Implement drag region

### **Phase 5: IPC Bridge**
- [ ] Extend preload script
- [ ] Update type definitions
- [ ] Test window control functionality

### **Phase 6: Styling & Polish**
- [ ] Add CSS for draggable regions
- [ ] Implement responsive design
- [ ] Test on different screen sizes

### **Phase 7: Build & Test**
- [ ] Test development mode
- [ ] Build and test packaged app
- [ ] Verify cross-platform compatibility

---

## **🚀 EXPECTED RESULTS**

After implementation:
1. **Custom App Icon** - Your logo.jpg will appear as the app icon in dock/taskbar
2. **Frameless Window** - Clean, custom window without OS title bar
3. **Integrated Traffic Lights** - macOS-style controls inside the app interface
4. **Professional Look** - Seamless, native-feeling application experience

---

## **📁 FILE LOCATIONS**

**Place your logo.jpg here**: `build/icons/logo.jpg`

The implementation will automatically:
- Generate all required icon formats
- Configure build system to use custom icons
- Create frameless window with custom controls
- Integrate traffic lights into the app interface

---

**Ready to implement! Awaiting your approval to proceed.** 🎯
