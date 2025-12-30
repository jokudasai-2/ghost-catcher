# Ghost Catcher - Sharing Guide

This guide explains how to share the Ghost Catcher Chrome Extension with your team.

## Step 1: Generate Icons (First Time Only)

Before packaging, you need to create the extension icons:

1. Open `extension/icons/generate-icons.html` in your web browser
2. The page will automatically generate three icons
3. Download each icon:
   - icon16.png
   - icon48.png
   - icon128.png
4. Move all three files to the `extension/icons/` folder

## Step 2: Package the Extension

Run the packaging script:

```bash
cd /tmp/cc-agent/62029963/project
./scripts/package-extension.sh
```

This will create `ghost-catcher-extension.zip` ready to share.

## Step 3: Share with Your Team

### Option A: Direct Sharing (Private Team Use)

1. **Share the zip file** with your team members via:
   - Email
   - Slack/Teams
   - Shared drive
   - Internal file sharing system

2. **Provide instructions**:
   - Recipients unzip the file
   - Follow the INSTALLATION.md guide included in the zip
   - They'll install as an "unpacked extension" in developer mode

**Pros**:
- Instant deployment
- No review process
- Free

**Cons**:
- Users must enable Developer Mode
- Won't auto-update
- Chrome may show warnings about developer mode

### Option B: Chrome Web Store (Public Distribution)

For wider distribution or if you want automatic updates:

1. **Create a Chrome Web Store Developer Account**:
   - Visit: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time registration fee

2. **Prepare Store Listing**:
   - Extension name: Ghost Catcher
   - Short description: "Quickly report operational inefficiencies and broken processes"
   - Detailed description: See below
   - Screenshots: Take 1-5 screenshots of the extension in use
   - Category: Productivity
   - Privacy policy URL: (required if collecting user data)

3. **Upload**:
   - Upload the `ghost-catcher-extension.zip` file
   - Fill in all required fields
   - Submit for review

4. **Wait for Review**:
   - Typically takes 1-3 days
   - You'll be notified by email

5. **Share the Store Link**:
   - Once approved, share the Chrome Web Store URL
   - Users can install with one click

**Pros**:
- Professional distribution
- Automatic updates
- No developer mode warnings
- Easy one-click install for users

**Cons**:
- $5 fee
- Review process (1-3 days)
- Must comply with Chrome Web Store policies

## Suggested Store Description

```
Ghost Catcher helps teams identify and eliminate operational "ghosts" -
processes, meetings, emails, and communications that continue to exist
but serve no purpose.

KEY FEATURES:
✓ One-click ghost reporting from any webpage
✓ Automatic context capture (URL, timestamp)
✓ Optional screenshot capture
✓ Impact rating system (1-5 scale)
✓ Multiple categories (Process, Communication, Technical, etc.)
✓ Real-time sync with dashboard
✓ Email auto-save for faster reporting

HOW IT WORKS:
1. See an inefficiency? Click the Ghost Catcher icon
2. Fill out a quick form describing the ghost
3. Submit and get a tracking ID
4. View all ghosts in your team dashboard

Perfect for organizations practicing continuous improvement,
lean methodologies, or anyone wanting to eliminate waste
and inefficiency.
```

## Step 4: Deploy the Web Dashboard

Your team will need access to the web dashboard to view reported ghosts:

1. **Deploy the web app** using one of these options:
   ```bash
   # Vercel (recommended)
   vercel --prod

   # Or Netlify
   netlify deploy --prod

   # Or Firebase
   firebase deploy --only hosting
   ```

2. **Share the dashboard URL** with your team

See `DEPLOYMENT.md` for detailed deployment instructions.

## Updating the Extension

When you make changes:

1. **For direct sharing**:
   - Repackage: `./scripts/package-extension.sh`
   - Share new zip file
   - Users reload the extension in Chrome

2. **For Chrome Web Store**:
   - Repackage and upload new version
   - Submit for review
   - Updates push automatically to users

## Support & Troubleshooting

Common questions from users:

**Q: Chrome warns about Developer Mode**
A: This is normal for unpacked extensions. It's safe - you control the code.

**Q: Can I use this in other browsers?**
A: Currently Chrome only. Firefox support would require minor manifest changes.

**Q: Is my data secure?**
A: Yes. Reports are stored in your Firebase Firestore instance. You control all data.

**Q: Can I customize the extension?**
A: Yes! It's open source. Modify the code and repackage.

## Cost Overview

| Method | Cost | Time to Deploy |
|--------|------|----------------|
| Direct Sharing | Free | Immediate |
| Chrome Web Store | $5 one-time | 1-3 days |
| Web Hosting (Vercel) | Free | 5 minutes |
| Web Hosting (Netlify) | Free | 5 minutes |
| Firebase Hosting | Free tier available | 10 minutes |

## Next Steps

1. Generate icons
2. Run packaging script
3. Choose distribution method
4. Deploy web dashboard
5. Share with team
6. Start catching ghosts!
