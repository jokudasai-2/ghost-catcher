# Firebase Firestore Rules Setup

The extension requires proper Firestore security rules to write data to your database.

## Quick Setup (For Testing)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **ghost-catcher-deel**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read and write ghosts (for testing)
    match /ghosts/{ghostId} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

## ⚠️ IMPORTANT: Production Rules

The rules above are for TESTING ONLY. They allow anyone to read and write to your database.

For production, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ghosts/{ghostId} {
      // Anyone can read ghosts
      allow read: if true;

      // Only allow writes with valid data structure
      allow create: if request.resource.data.keys().hasAll([
        'id', 'title', 'description', 'category',
        'impact', 'email', 'timestamp', 'status'
      ])
      && request.resource.data.status == 'New'
      && request.resource.data.impact >= 1
      && request.resource.data.impact <= 5;

      // Only allow status updates
      allow update: if request.resource.data.diff(resource.data)
        .affectedKeys().hasOnly(['status', 'assignedTo', 'resolutionNotes']);

      // Don't allow deletes
      allow delete: if false;
    }
  }
}
```

## Verify Rules Are Working

### Test 1: Check Write Permissions

1. Open the extension popup
2. Fill out the form
3. Click "Report Ghost"
4. Check the console (F12)

If you see: `Error: Missing or insufficient permissions`
→ Your rules are too restrictive or not published

### Test 2: Check Firebase Console

1. Go to Firestore Database
2. Look for the `ghosts` collection
3. Try to view documents
4. If you can see them, read rules are working

### Test 3: Check Dashboard

1. Open your Ghost Catcher dashboard
2. If ghosts appear, read rules are working
3. Try changing a ghost status
4. If it updates, update rules are working

## Common Rule Issues

### Issue: "Missing or insufficient permissions"
**Cause**: Rules are blocking writes

**Fix**: Make sure rules allow `create` on the ghosts collection

### Issue: Data validation failed
**Cause**: Data structure doesn't match rules

**Fix**: Check that your form data includes all required fields

### Issue: "Permission denied"
**Cause**: Rules require authentication but extension isn't authenticated

**Fix**: Use `if true` for testing, or add authentication to the extension

## Current Configuration

Your Firebase project:
- **Project ID**: ghost-catcher-deel
- **API Key**: AIzaSyBgGG_ChCi4e_2SOFzNgQNYFzZdyZVuAUE
- **Auth Domain**: ghost-catcher-deel.firebaseapp.com

## Need Help?

1. Check TROUBLESHOOTING.md for common issues
2. Look at the Firestore Rules simulator in Firebase Console
3. Test rules directly in the Firebase Console Rules tab
