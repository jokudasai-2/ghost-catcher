# 👻 Ghost Catcher

A complete system for identifying and eliminating operational "ghosts" - inefficiencies, broken processes, and communication gaps that haunt organizations.

## System Overview

Ghost Catcher consists of two components:

1. **Chrome Extension** - Quick reporting tool for employees to capture ghosts as they encounter them
2. **Web Dashboard** - Real-time view of all reported ghosts with filtering and analytics

Both components sync in real-time using Firebase Firestore.

## Quick Start

### 1. Generate Extension Icons

```bash
# Open in browser and download the three icons
open extension/icons/generate-icons.html
```

Download icon16.png, icon48.png, and icon128.png and place them in `extension/icons/`

### 2. Deploy the Web Dashboard

Choose your preferred hosting platform:

```bash
# Vercel (recommended - fastest)
vercel --prod

# Or Netlify
netlify deploy --prod

# Or Firebase Hosting
firebase deploy --only hosting
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### 3. Package the Extension

```bash
npm run package-extension
```

This creates `ghost-catcher-extension.zip` ready to share.

### 4. Share with Your Team

See [SHARING_GUIDE.md](./SHARING_GUIDE.md) for distribution options:
- Direct sharing (instant, free)
- Chrome Web Store (professional distribution, $5 one-time)

## Features

### Chrome Extension
- One-click ghost reporting from any webpage
- Automatic context capture (URL, timestamp)
- Optional screenshot capture
- Impact rating system (1-5)
- Email auto-save for faster reporting
- Tracking ID for each report

### Web Dashboard
- Real-time ghost feed
- Search and filter by category, status, impact
- Detailed ghost view with context
- Visual statistics and charts
- Responsive design for mobile/desktop

## Project Structure

```
ghost-catcher/
├── src/                      # Web dashboard React app
│   ├── components/          # UI components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── firebase-config.ts  # Firebase setup
├── extension/              # Chrome extension
│   ├── manifest.json      # Extension config
│   ├── popup.html         # Extension UI
│   ├── popup.js           # Extension logic
│   ├── background.js      # Service worker
│   └── icons/            # Extension icons
├── scripts/              # Build and packaging scripts
├── DEPLOYMENT.md        # Deployment guide
└── SHARING_GUIDE.md    # Extension distribution guide
```

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase Firestore (serverless)
- **Extension**: Chrome Manifest V3, Firestore REST API
- **Icons**: Lucide React

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Load Extension Locally

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

## Firebase Setup

The project is already configured with Firebase. If you need to use your own Firebase project:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Update `src/firebase-config.ts` with your credentials
4. Update `extension/popup.js` with your credentials
5. Configure Firestore security rules

## Security

- Extension uses Firestore REST API (Manifest V3 compliant)
- All data stored in your Firebase project
- Row-level security through Firestore rules
- HTTPS for all connections
- No third-party data sharing

## Cost

| Component | Service | Cost |
|-----------|---------|------|
| Web Dashboard | Vercel/Netlify | Free |
| Database | Firebase | Free tier (generous limits) |
| Extension | Direct sharing | Free |
| Extension | Chrome Web Store | $5 one-time |

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Not supported (would require Manifest V2/V3 conversion)
- Safari: Not supported

## Support

### Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy the web dashboard
- [SHARING_GUIDE.md](./SHARING_GUIDE.md) - Share the extension
- [extension/README.md](./extension/README.md) - Extension details
- [extension/INSTALLATION.md](./extension/INSTALLATION.md) - User installation guide

### Troubleshooting

**Extension won't load**
- Ensure icon files exist in `extension/icons/`
- Check manifest.json for syntax errors
- Reload the extension page

**Ghosts not syncing**
- Check internet connection
- Verify Firebase configuration
- Check browser console for errors

**Build fails**
- Run `npm install`
- Check Node.js version (16+ required)

## Contributing

This is a working system ready for deployment. Customize as needed:

1. Modify categories in `src/types/ghost.ts`
2. Update styling in component files
3. Adjust Firebase rules for your security requirements
4. Customize extension branding

## License

MIT

## Version

1.0.0

---

Made with ❤️ for teams who want to eliminate operational inefficiency
