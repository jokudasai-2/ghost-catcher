# 👻 Ghost Catcher Chrome Extension

A Chrome extension that allows employees to quickly report operational "ghosts" - processes, meetings, emails, and communications that continue to exist but serve no purpose.

## Quick Start

### Step 1: Generate Icons (Required)

The extension needs icon files before it can be loaded. Choose one method:

#### Method A: Use the Icon Generator (Easiest)
1. Open `icons/generate-icons.html` in your web browser
2. The page will automatically generate three icons
3. Click the download buttons for each icon:
   - icon16.png
   - icon48.png
   - icon128.png
4. Move the downloaded files to the `icons/` folder

#### Method B: Create Icons Manually
See `icons/README.md` for alternative methods.

### Step 2: Install the Extension

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in Chrome
   - Or: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" ON (top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select this `extension` folder
   - Click "Select" or "Open"

4. **Pin the Extension** (Optional but recommended)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Ghost Catcher" and click the pin icon

### Step 3: Use It!

1. Navigate to any webpage
2. Click the Ghost Catcher extension icon
3. Fill out the form and report a ghost
4. View all reports in your Ghost Catcher dashboard

## Features

- **Quick Reporting**: Report ghosts from any webpage with one click
- **Context Capture**: Automatically captures current URL and timestamp
- **Media Upload**: Upload images to provide visual context
- **Advanced Options**: Capture reporter name, department, geography, and risk types
- **Real-time Sync**: Reports instantly appear in your dashboard
- **Auto-Save**: Saves your reporter information for faster future reports
- **Dual Rating System**: Rate both impact (1-5) and effort to fix (1-5)
- **Multiple Categories**: Process Inefficiency, Communication Gap, Technical Issue, and more
- **Risk Classification**: Tag reports with Financial, Operational, Compliance, Reputational, or Strategic risk types

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Extension popup logic
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png       # 16x16 toolbar icon
│   ├── icon48.png       # 48x48 extension manager icon
│   ├── icon128.png      # 128x128 Chrome Web Store icon
│   ├── generate-icons.html  # Icon generator tool
│   └── README.md        # Icon instructions
├── README.md            # This file
└── INSTALLATION.md      # Detailed installation guide
```

## How It Works

1. **User Action**: Click extension icon → Fill form (basic + optional advanced fields) → Submit
2. **Data Capture**: Extension captures page URL, title, timestamp, and optional media
3. **Supabase Storage**: Report is sent to Supabase via Edge Function
4. **Authentication**: Uses auth token synced from web app login
5. **Real-time Sync**: Dashboard automatically updates with new ghost
6. **Notification**: User receives confirmation with tracking ID

## Configuration

The extension uses Supabase Edge Functions for secure data storage (Manifest V3 compatible). The configuration is already set up in `popup.js`:

```javascript
const SUPABASE_URL = "https://qjtfpkhlhaimhkxbaoos.supabase.co";
const API_URL = `${SUPABASE_URL}/functions/v1/submit-ghost`;
```

**Authentication**: The extension automatically syncs your authentication token when you sign in to the Ghost Catcher web app. You must be signed in to the web app before using the extension.

**Note**: This extension uses Supabase Edge Functions instead of direct database access to comply with Chrome Extension Manifest V3 security requirements.

## Permissions

The extension requires the following permissions:

- **activeTab**: To capture current page URL and title
- **storage**: To save user email preference
- **notifications**: To show success notifications
- **tabs**: To capture screenshots
- **host_permissions**: To work on all websites

## Troubleshooting

### Extension Won't Load
- ✅ Make sure icon files exist in the icons folder
- ✅ Check that manifest.json is valid (no syntax errors)
- ✅ Try reloading the extension page

### Can't Report Ghosts
- ✅ Check internet connection
- ✅ Open DevTools (F12) and check Console for errors
- ✅ Verify Firebase configuration

### Icons Not Showing
- ✅ Generate icons using `icons/generate-icons.html`
- ✅ Make sure files are named exactly: icon16.png, icon48.png, icon128.png
- ✅ Files must be in the icons folder

## Development

### Making Changes
1. Edit the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon (⟳) on Ghost Catcher
4. Test your changes

### Testing
- Open DevTools (F12) with the popup open to see console logs
- Check the background service worker logs in chrome://extensions/ (click "service worker")
- Test on various websites to ensure compatibility

## Using Advanced Options

The extension includes an "Advanced Options" section that can be expanded for additional context:

- **Reporter Name**: Your full name (optional)
- **Department**: Select your department (Engineering, Product, Marketing, etc.)
- **Geography**: Select your region (Global, North America, Europe, etc.)
- **Risk Type**: Select one or more risk categories:
  - Financial
  - Operational
  - Compliance
  - Reputational
  - Strategic
- **URL**: Edit the auto-captured URL if needed

Your reporter information (email, name, department, geography) is saved locally and auto-filled for future reports.

## Privacy & Security

- Reports are stored in your Supabase database
- Authentication required - you must sign in to the web app first
- Auth tokens are synced automatically via Chrome storage
- Media uploads are optional and stored as base64 data
- Reporter info is saved locally in Chrome's local storage
- No data is sent to third parties
- All communication is over HTTPS

## Support

For issues or questions:
1. Check INSTALLATION.md for detailed setup instructions
2. Review the troubleshooting section above
3. Check browser console for error messages

## Version

Current version: 1.0.0

## License

MIT
