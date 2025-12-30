# Extension Troubleshooting Guide

## Ghost Submission Not Working

If ghosts aren't being submitted or you're not getting a confirmation code, follow these steps:

### Step 1: Check Browser Console

1. Open the extension popup
2. Right-click anywhere in the popup
3. Select "Inspect" or press F12
4. Look at the Console tab

You should see these messages:
```
Ghost Catcher Extension: Loading...
Initializing Firebase...
Firebase initialized successfully!
DOM Content Loaded
```

### Step 2: Common Issues and Solutions

#### Issue: "Failed to load module script"
**Cause**: Content Security Policy is blocking Firebase CDN

**Solution**:
1. Make sure your manifest.json includes:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' https://www.gstatic.com; object-src 'self'"
}
```
2. Reload the extension in chrome://extensions/

#### Issue: "Firebase is not initialized!"
**Cause**: Firebase failed to load or initialize

**Solutions**:
1. Check your internet connection
2. Make sure www.gstatic.com is not blocked by firewall/proxy
3. Clear browser cache and reload the extension
4. Check the console for the actual error message

#### Issue: "Error: Missing or insufficient permissions"
**Cause**: Firebase Firestore security rules are blocking writes

**Solution**:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: ghost-catcher-deel
3. Go to Firestore Database → Rules
4. Make sure your rules allow writes. For testing, you can use:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ghosts/{ghostId} {
      allow read, write: if true;  // For testing only
    }
  }
}
```
5. Publish the rules

**IMPORTANT**: The above rules are for testing only. For production, use proper authentication.

#### Issue: Ghost ID shows but data doesn't appear in dashboard
**Cause**: Data was written but there's a sync delay

**Solution**:
1. Wait 2-3 seconds
2. Refresh your dashboard
3. Check Firebase Console to see if the document was created

### Step 3: Test Firebase Connection

1. Open the browser console (F12)
2. Run this test:
```javascript
// This should be in the extension popup console
console.log('Testing Firebase connection...');
console.log('Database:', db);
```

### Step 4: Check Network Requests

1. In the popup inspector, go to the Network tab
2. Try submitting a ghost
3. Look for requests to:
   - `firestore.googleapis.com`
   - Status should be 200 (success)
   - If you see errors, note the status code

### Step 5: Verify Form Data

Make sure all required fields are filled:
- ✅ Title (not empty)
- ✅ Description (not empty)
- ✅ Category (selected)
- ✅ Impact (1-5)
- ✅ Email (valid email format)

### Step 6: Reload Extension

After making any changes:
1. Go to chrome://extensions/
2. Find Ghost Catcher
3. Click the refresh icon (⟳)
4. Close and reopen the popup

### Step 7: Check Firebase Console

1. Go to https://console.firebase.google.com
2. Select: ghost-catcher-deel
3. Click: Firestore Database
4. Look for the `ghosts` collection
5. Check if new documents are being created when you submit

## Debug Mode

To enable detailed logging:

1. Open popup.js
2. All console.log statements will show in the popup inspector
3. Look for:
   - "Attempting to report ghost:"
   - "Ghost successfully reported to Firebase!"
   - "Document ID:" (this confirms success)

## Still Not Working?

### Check These:

1. **Extension Permissions**: Make sure all permissions are granted in chrome://extensions/
2. **Icons**: Extension needs icon files to load properly
3. **Internet**: Must be online to reach Firebase
4. **Browser Version**: Use latest Chrome (or Chromium-based browser)
5. **Firewall/Proxy**: Make sure googleapis.com and gstatic.com are not blocked

### Get More Help:

1. Check all console messages in the popup inspector
2. Check the background service worker console:
   - Go to chrome://extensions/
   - Find Ghost Catcher
   - Click "service worker" link
3. Look for any red error messages
4. Note the exact error message and search for it

## Success Indicators

When everything works correctly, you should see:

1. **In Console**:
   ```
   Attempting to report ghost: GH-XXXXXX
   Ghost successfully reported to Firebase!
   Document ID: [some ID]
   Ghost ID: GH-XXXXXX
   ```

2. **In Popup**:
   - Success screen with Ghost ID
   - Green checkmark
   - Auto-close after 3 seconds

3. **Notification**:
   - Chrome notification appears
   - Shows "Ghost Captured!"
   - Shows tracking ID

4. **In Dashboard**:
   - New ghost appears immediately
   - Notification banner shows at top
   - Ghost is listed with status "New"
