# ⚫ Unlimited Void

> **A voice-activated domain expansion experience inspired by Jujutsu Kaisen**

A cutting-edge React application that transforms voice commands into an immersive visual spectacle. Speak the sacred words, and witness the void consume all.

![Status](https://img.shields.io/badge/status-active-00ff00?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)

---

## 🎯 Overview

**Unlimited Void** is an experimental web experience that combines speech recognition with dynamic animations to create an interactive domain expansion effect. Users can trigger the activation sequence by speaking specific keywords, unleashing a cascade of visual effects including video playback, particle animations, and immersive UI elements.

**Perfect for:**
- Jujutsu Kaisen fans
- Interactive art installations
- Event displays
- Creative coding portfolios
- Fan projects and tributes

---

## ✨ Features

### 🎤 Smart Speech Recognition
- **Multi-keyword detection** with support for variations:
  - "Ryoiki Tenkai"
  - "Domain Expansion"
  - "Unlimited Void"
- **Real-time volume visualization** showing audio input levels
- **Automatic language detection** (defaults to Indian English for better recognition)
- **Robust error handling** with user-friendly messages
- **Fallback mechanisms** for different browser environments

### 🎬 Immersive Visual Experience
- **Initial screen** with atmospheric background and animated text
- **Video phase** featuring full-screen void animation (21-second loop capable)
- **Static phase** with floating text particles and subscribe button
- **Smooth phase transitions** with framer-motion animations
- **Gradient overlays** for visual depth and readability
- **Particle system** with randomized trajectories and lifespans

### 📱 Cross-Platform Support
- Works on Chrome, Safari, Firefox, and Edge
- Mobile-responsive design using Tailwind CSS
- Touch-friendly interactions
- Graceful degradation for unsupported browsers

### 🔧 Developer-Friendly
- Clean, modular component architecture
- Comprehensive error logging and debugging
- Detailed status messages for microphone issues
- Configurable keywords and timing
- Well-documented code with inline comments

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- A microphone (physical or virtual)
- Modern browser with Web Audio API support

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/unlimited-void.git
cd unlimited-void

# Install dependencies
npm install

# Install required packages (if not included)
npm install framer-motion
npm install -D tailwindcss postcss autoprefixer
```

### Configuration

#### Initialize Tailwind (if needed):
```bash
npx tailwindcss init -p
```

#### Setup your media files:

1. **Place your video file** at:
```
   public/videos/unlimited-void-loop.mp4
```
   - Recommended length: 20-25 seconds
   - Format: MP4 (H.264 codec)
   - Resolution: 1920x1080 or higher

2. **Place your image assets** at:
```
   src/assets/
   ├── gojo-initial.jpg      # Initial screen background
   ├── void-static.png       # Static phase background
   └── channel-logo.jpeg     # Subscribe button logo
```

### Running the Project

#### Development:
```bash
npm run dev
```
The app will open at `http://localhost:5173`

#### Production Build:
```bash
npm run build
npm run preview
```

---

## 📋 Project Structure
```
unlimited-void/
├── src/
│   ├── components/
│   │   ├── AudioTrigger.jsx      # Speech recognition & microphone handling
│   │   ├── InitialScreen.jsx     # Opening sequence & instructions
│   │   └── VoidAnimation.jsx     # Main animation & effects
│   ├── assets/
│   │   ├── gojo-initial.jpg
│   │   ├── void-static.png
│   │   └── channel-logo.jpeg
│   ├── App.jsx                   # Main application logic
│   ├── App.css
│   ├── index.css                 # Tailwind & custom animations
│   └── main.jsx                  # React entry point
├── public/
│   ├── videos/
│   │   └── unlimited-void-loop.mp4
│   └── vite.svg
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎮 How It Works

### Phase 1: Initial Screen
The app launches with an atmospheric intro screen displaying:
- Animated title: "Unlimited Void"
- Instructions: "Speak 'Ryoiki Tenkai' to open"
- Microphone permission request

### Phase 2: Voice Activation
The AudioTrigger component:
1. Loads **Annyang** (speech recognition library)
2. Requests microphone access with optimal audio constraints
3. Sets up volume visualization
4. Listens for target keywords in real-time
5. Triggers activation on keyword detection

**Keywords detected:**
- Exact matches: "ryoiki tenkai", "domain expansion", "unlimited void"
- Partial matches: Detects keywords within longer phrases

### Phase 3: Video Playback (21 seconds)
Once triggered:
- Full-screen video begins playing
- Audio unmutes automatically (with fallback to muted on mobile)
- Gradient overlay creates visual depth
- All interactions trigger video restart

### Phase 4: Static Display
After video duration:
- Switches to static image background
- Continuous particle animations
- Floating text elements with randomized movement
- Subscribe button with hover effects

---

## 🔊 Audio Configuration

### Microphone Setup
The app requests these audio constraints:
```javascript
{
  audio: {
    echoCancellation: true,     // Remove background echo
    noiseSuppression: true,     // Reduce background noise
    autoGainControl: true       // Auto volume adjustment
  }
}
```

### Troubleshooting Audio Issues

| Issue | Solution |
|-------|----------|
| "No microphone detected" | Check System Settings, ensure microphone is enabled |
| "Permission denied" | Click lock icon in URL bar → Allow microphone access |
| "Microphone in use" | Close Discord, Zoom, or other apps using the mic |
| Audio not working | Try Safari or refresh the page |
| Muted audio | Click anywhere on the screen to unmute |

---

## 🎨 Customization

### Changing Keywords
Edit `AudioTrigger.jsx`:
```javascript
const KEYWORDS = [
  'your keyword 1',
  'your keyword 2',
  'your keyword 3'
];
```

### Adjusting Timing
Edit `App.jsx`:
```javascript
setTimeout(() => {
  setPhase('static');
}, 21000); // Adjust to match your video length
```

### Styling
All styles use **Tailwind CSS** utility classes. Edit classes directly in components or modify `index.css` for custom animations.

Custom animation example:
```css
@keyframes fracture {
  0% { transform: translate(0, 0); }
  50% { transform: translate(10px, 10px) rotate(5deg); }
  100% { transform: translate(0, 0); }
}
.animate-fracture {
  animation: fracture 0.5s infinite;
}
```

### Changing Colors
Update Tailwind color classes in components:
```jsx
<div className="bg-purple-900 text-blue-300">
  {/* Change purple-900 and blue-300 to your colors */}
</div>
```

### Video Fallback
To use a static image instead of video:
```jsx
// In VoidAnimation.jsx
{phase === 'video' ? (
  <img src="/path/to/image.png" alt="Void" className="w-full h-full object-cover" />
) : (
  // static phase
)}
```

---

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Recommended for best performance |
| Safari 14+ | ✅ Full | May require user interaction to unmute audio |
| Firefox 88+ | ✅ Full | Excellent speech recognition |
| Edge 90+ | ✅ Full | Chromium-based, same as Chrome |
| Mobile Safari | ⚠️ Partial | Limited microphone access on iOS |
| Chrome Mobile | ✅ Full | Works well with proper permissions |

---

## 📦 Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "framer-motion": "^10.0.0",
  "tailwindcss": "^3.0.0",
  "vite": "^4.0.0"
}
```

### External Libraries
- **Annyang** (v2.6.1): Speech recognition via CDN
```html
  https://cdnjs.cloudflare.com/ajax/libs/annyang/2.6.1/annyang.min.js
```

---

## 🐛 Debugging

### Enable Console Logging
Open browser DevTools (F12) and check the Console for:
- Keyword detection messages: `✨ KEYWORD DETECTED:`
- Phase transitions: `✨ DOMAIN EXPANSION ACTIVATED ✨`
- Microphone status: `✅ Microphone access granted!`
- Error details: Detailed error messages with solutions

### Common Issues & Fixes

**Issue: "Annyang not available"**
```
Solution: Check CDN is loaded → Check CORS → Clear cache
```

**Issue: Speech not recognized**
```
Solution: Speak clearly, adjust volume, check microphone in OS settings
```

**Issue: Video won't play**
```
Solution: Check video path in public/videos/, verify MP4 format
```

**Issue: Particles not moving**
```
Solution: Check GPU acceleration enabled, try different browser
```

---

## 🔐 Privacy & Permissions

This application:
- ✅ Only accesses microphone when explicitly granted
- ✅ Processes speech locally via browser
- ✅ Does NOT upload audio to external servers
- ✅ Speech recognition via Annyang (client-side)
- ✅ No analytics or tracking (unless added separately)

---

## 🎬 Media Guidelines

### Video Requirements
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1920x1080 minimum
- **Duration:** 20-25 seconds
- **Frame Rate:** 30fps or 60fps
- **File Size:** < 50MB for optimal loading

### Image Requirements
- **Format:** JPG or PNG
- **Resolution:** 1920x1080 minimum
- **File Size:** < 5MB for each asset

### Audio Codec
- **Format:** AAC or MP3 (embedded in MP4)
- **Sample Rate:** 48kHz or 44.1kHz
- **Bitrate:** 192kbps or higher

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
npm run build
# Drag and drop the 'dist' folder to Netlify
```

### GitHub Pages
1. Update `vite.config.js` with your repo name
2. Run `npm run build`
3. Push to GitHub with `/dist` folder

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📊 Performance Tips

- **Optimize videos:** Compress video files with FFmpeg
```bash
  ffmpeg -i input.mp4 -vcodec libx264 -crf 23 output.mp4
```

- **Image compression:** Use tools like TinyPNG or ImageMagick

- **Lazy loading:** Load assets only when phase changes

- **Disable animations on low-end devices:**
```javascript
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

**Attribution:** Inspired by Jujutsu Kaisen (© Gege Akutami)

---

## 🎬 Credits & Inspiration

- **Anime Reference:** Jujutsu Kaisen - Satoru Gojo's Unlimited Void
- **Animation Library:** Framer Motion
- **Speech Recognition:** Annyang
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

---

## 📞 Support

Having issues? Try these resources:

1. **Check the Troubleshooting section** above
2. **Review browser console** for error messages
3. **Verify all media files** are in correct locations
4. **Test microphone permissions** in OS settings
5. **Try a different browser** to isolate issues

**Report bugs:** Create an issue with:
- Browser and OS version
- Console error messages
- Steps to reproduce
- Screenshots/videos if applicable

---

## 🌟 Future Enhancements

- [ ] Mobile gesture controls
- [ ] Multiple language support
- [ ] Customizable themes
- [ ] Sound effects for actions
- [ ] Admin dashboard for configuration
- [ ] Real-time multiplayer features
- [ ] VR/AR integration
- [ ] User statistics tracking

---

## 💡 Pro Tips

- **Best experience:** Use Chrome on desktop with a good microphone
- **Event display:** Loop the static phase indefinitely
- **Customization:** Fork and modify for your own variations
- **Performance:** Test on target devices before deployment
- **Engagement:** Display at conventions or streaming events

---

<div align="center">

### ⚫ Now activate your domain expansion ⚫

**Speak the sacred words and witness the void consume all.**

[Report Issue](../../issues) • [Request Feature](../../issues) • [View Demo](https://demo-link.com)

</div>

---

*Last updated: February 2026 | Made with ✨ and lots of void energy*
