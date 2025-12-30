# Ghost Catcher - Command Reference

Quick reference for common commands.

## Development

```bash
# Install dependencies
npm install

# Start development server (auto-opens browser)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Extension

```bash
# Package extension for sharing
npm run package-extension

# Manual packaging (if script fails)
cd extension
zip -r ../ghost-catcher-extension.zip . -x "*.md" -x ".DS_Store"
```

## Deployment

### Vercel
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Firebase
```bash
# Install CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time only)
firebase init hosting
# - Select existing project: ghost-catcher-deel
# - Public directory: dist
# - Configure as SPA: Yes
# - Don't overwrite index.html

# Build and deploy
npm run build
firebase deploy --only hosting
```

## Chrome Extension

### Load Extension in Chrome
1. Open: `chrome://extensions/`
2. Enable: "Developer mode"
3. Click: "Load unpacked"
4. Select: `extension` folder

### Reload Extension After Changes
1. Go to: `chrome://extensions/`
2. Find: "Ghost Catcher"
3. Click: Reload icon (⟳)

### Debug Extension
```bash
# View popup console
Right-click extension icon → Inspect

# View background worker console
chrome://extensions/ → Ghost Catcher → "service worker" link
```

## Testing

### Test Extension Locally
1. Load extension in Chrome
2. Navigate to any webpage
3. Click extension icon
4. Fill form and submit
5. Check for Ghost ID confirmation

### Test Dashboard
```bash
npm run dev
# Open http://localhost:5173
# Check that ghosts appear
```

### Test Full Flow
1. Load extension
2. Report a test ghost
3. Check dashboard for ghost
4. Verify all fields display correctly

## Troubleshooting

### Extension won't load
```bash
# Check icon files exist
ls extension/icons/icon*.png

# Should see:
# icon16.png  icon48.png  icon128.png
```

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase issues
```bash
# Check Firebase CLI version
firebase --version

# Re-login
firebase logout
firebase login

# Check project
firebase projects:list
```

## Quick Icons Setup

```bash
# Open icon generator in browser
open extension/icons/generate-icons.html

# Or on Linux
xdg-open extension/icons/generate-icons.html

# Or manually navigate to:
# file:///path/to/project/extension/icons/generate-icons.html
```

## Git Commands (if using version control)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial Ghost Catcher setup"

# Add remote (if you have a repo)
git remote add origin <your-repo-url>

# Push
git push -u origin main
```

## Environment Variables

Variables are in `.env` file:
```bash
# View current env vars (sensitive - don't share)
cat .env
```

## Package Info

```bash
# View installed packages
npm list --depth=0

# Check for outdated packages
npm outdated

# Update packages (careful!)
npm update
```

## Useful Chrome URLs

- Extensions: `chrome://extensions/`
- Version: `chrome://version/`
- Flags: `chrome://flags/`

## File Locations

| Item | Location |
|------|----------|
| Extension files | `extension/` |
| Web app source | `src/` |
| Built web app | `dist/` |
| Extension package | `ghost-catcher-extension.zip` |
| Firebase config | `src/firebase-config.ts` |
| Extension config | `extension/manifest.json` |

## Documentation

| Guide | Purpose |
|-------|---------|
| `README.md` | Project overview |
| `QUICKSTART.md` | Step-by-step launch guide |
| `DEPLOYMENT.md` | Detailed deployment instructions |
| `SHARING_GUIDE.md` | Extension distribution options |
| `COMMANDS.md` | This file - command reference |
| `extension/README.md` | Extension details |
| `extension/INSTALLATION.md` | User installation guide |

## Quick Deploy (Copy-Paste Ready)

```bash
# Complete deployment in 3 commands:
npm run build
vercel --prod
npm run package-extension

# Then share:
# 1. Dashboard URL from Vercel output
# 2. ghost-catcher-extension.zip file
```

## Emergency Reset

```bash
# If everything breaks, start fresh:
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Reload extension in Chrome:
# chrome://extensions/ → Ghost Catcher → Reload
```
