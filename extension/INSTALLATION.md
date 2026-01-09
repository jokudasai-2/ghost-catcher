# Ghost Catcher Chrome Extension - Installation Guide

Quick guide to install Ghost Catcher in your Chrome browser.

## Installation Steps

### 1. Unzip the Extension
If you received a zip file, extract it to a location on your computer.

### 2. Open Chrome Extensions Page
1. Open Google Chrome
2. Go to `chrome://extensions/` in your address bar
3. Or click the three dots (⋮) → More Tools → Extensions

### 3. Enable Developer Mode
1. Look for the "Developer mode" toggle in the top-right corner
2. Turn it ON (you'll see additional buttons appear)

### 4. Load the Extension
1. Click the "Load unpacked" button
2. Navigate to and select the `ghost-catcher-extension` folder (the one you unzipped)
3. Click "Select" or "Open"

### 5. Pin the Extension (Recommended)
1. Click the puzzle piece icon in Chrome's toolbar
2. Find "Ghost Catcher" in the list
3. Click the pin icon to keep it visible

### 6. Verify Installation
You should see:
- Ghost Catcher extension card in your extensions list
- The extension icon in your Chrome toolbar (puzzle piece icon → pin Ghost Catcher)
- Status: "Errors" section should be empty

## Using the Extension

### Prerequisites
**Important**: You must be signed in to the Ghost Catcher web app before using the extension. The extension uses your authentication from the web app.

### Report a Ghost
1. Navigate to any webpage where you want to report an operational ghost
2. Click the Ghost Catcher icon in your toolbar
3. Fill out the basic form:
   - **Title**: Brief description of the ghost
   - **Description**: Detailed explanation
   - **Category**: Select appropriate category
   - **Email**: Your email address (saved for next time)
   - **Impact**: Rate 1-5 using the slider
   - **Effort to Fix**: Rate 1-5 using the slider
4. (Optional) Click "Advanced Options" to expand additional fields:
   - **Reporter Name**: Your full name
   - **Department**: Your department
   - **Geography**: Your region
   - **Risk Type**: Select relevant risk categories (Financial, Operational, etc.)
   - **URL**: Edit the auto-captured URL if needed
5. (Optional) Click to upload an image file for visual context
6. Click "Report Ghost"
7. You'll receive a tracking ID (e.g., GH-123456)

### View Your Reports
1. Open the Ghost Catcher dashboard at your deployed web app URL
2. All reported ghosts will appear in real-time
3. You can search, filter, and manage ghosts from the dashboard

## Troubleshooting

### Extension Won't Load
- Make sure icon files exist in the icons folder
- Check Chrome DevTools Console for errors
- Verify manifest.json is valid JSON

### Can't Report Ghosts
- **Make sure you're signed in** to the Ghost Catcher web app first
- Check your internet connection
- Open Chrome DevTools (F12) and look at the Console tab for errors
- Verify you have a valid authentication token

### Icons Not Appearing
- Make sure you have PNG files named exactly: icon16.png, icon48.png, icon128.png
- Files must be in the `extension/icons/` folder
- Try reloading the extension after adding icons

### Authentication Errors
- The extension requires you to be signed in to the web app
- Sign in to Ghost Catcher web app first
- The auth token is automatically synced to the extension
- If you sign out of the web app, you'll need to sign in again before using the extension

## Updating the Extension
After making changes to the extension files:
1. Go to `chrome://extensions/`
2. Find Ghost Catcher
3. Click the refresh icon (⟳) on the extension card
4. Or toggle the extension off and on again

## Uninstalling
1. Go to `chrome://extensions/`
2. Find Ghost Catcher
3. Click "Remove"
4. Confirm deletion

## Privacy & Data
- Ghost reports are stored in your Supabase database
- Media uploads are optional and stored as base64 data
- Your reporter information (email, name, department, geography) is saved locally in Chrome to pre-fill the form
- Authentication tokens are synced from the web app via Chrome storage
- All data is associated with your Supabase project
- All communication is over HTTPS
