# Ghost Catcher Deployment Guide

This guide covers deploying the Ghost Catcher web application to various hosting platforms.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to your Vercel account
   - Confirm project settings
   - Deploy!

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

Your app will be live at: `https://your-project.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy
   ```

3. **For production**:
   ```bash
   netlify deploy --prod
   ```

Your app will be live at: `https://your-project.netlify.app`

### Option 3: Firebase Hosting

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```

   When prompted:
   - Select your existing Firebase project: `ghost-catcher-deel`
   - Public directory: `dist`
   - Configure as SPA: `Yes`
   - Set up automatic builds: `No`
   - Don't overwrite index.html

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

Your app will be live at: `https://ghost-catcher-deel.web.app`

## Manual Deployment (Any Static Host)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - DigitalOcean App Platform
   - Or any other static hosting service

3. **Configure SPA routing**: Ensure all routes redirect to `index.html`

## Environment Variables

Your Firebase configuration is already in the code, but if you need to change it:

1. Update `src/firebase-config.ts` with your Firebase credentials
2. Rebuild: `npm run build`
3. Redeploy

## Post-Deployment

After deployment:

1. **Test the live site**: Make sure ghost reporting works
2. **Update extension**: If you deployed to a new domain, update the extension's reference to the web app
3. **Share the URL**: Give your team the deployment URL

## Troubleshooting

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (should be 16+)

### 404 errors on refresh
- Make sure SPA redirects are configured (see platform-specific guides above)

### Firebase connection issues
- Verify Firebase project ID and API key in `firebase-config.ts`
- Check browser console for specific errors
