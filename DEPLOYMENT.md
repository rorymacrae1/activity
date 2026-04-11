# PeakWise Web Deployment Guide

## Quick Start

### Option 1: Vercel (Recommended - Zero Config)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   npm run build:web
   vercel --prod
   ```

   Or use the shortcut:
   ```bash
   npm run deploy:vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to: Settings → Environment Variables
   - Add:
     - `EXPO_PUBLIC_SUPABASE_URL` = `https://xhfjeoynmcwaslzjxhdt.supabase.co`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_n6wiEkl-pNYI45aDfP776w_tITdNspI`

5. **Redeploy** after adding env vars:
   ```bash
   vercel --prod
   ```

---

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize Site:**
   ```bash
   netlify init
   ```

4. **Deploy:**
   ```bash
   npm run build:web
   netlify deploy --prod
   ```

   Or use the shortcut:
   ```bash
   npm run deploy:netlify
   ```

5. **Set Environment Variables:**
   ```bash
   netlify env:set EXPO_PUBLIC_SUPABASE_URL "https://xhfjeoynmcwaslzjxhdt.supabase.co"
   netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY "sb_publishable_n6wiEkl-pNYI45aDfP776w_tITdNspI"
   ```

---

### Option 3: GitHub Pages (Free, No Server-Side)

1. **Install GitHub Pages Package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   "homepage": "https://yourusername.github.io/peakwise",
   "scripts": {
     "predeploy": "npm run build:web",
     "deploy:gh-pages": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy:gh-pages
   ```

4. **Enable GitHub Pages:**
   - Go to: Repository → Settings → Pages
   - Source: `gh-pages` branch

**⚠️ Note:** Environment variables must be set at build time for GitHub Pages.

---

## Pre-Deployment Checklist

- [ ] Test production build locally: `npm run build:web`
- [ ] Verify environment variables are set
- [ ] Check all assets are loading (icons, images)
- [ ] Test authentication flow
- [ ] Verify Supabase connection works
- [ ] Test on mobile viewport
- [ ] Check SEO metadata (sitemap generated ✓)
- [ ] Verify all routes work (SPA routing configured ✓)

---

## Continuous Deployment

### Vercel (Automatic)
- Connect your GitHub repo in Vercel dashboard
- Every push to `main` = automatic deployment
- Pull requests get preview deployments

### Netlify (Automatic)
- Connect your GitHub repo in Netlify dashboard
- Configure build settings:
  - Build command: `npm run build:web`
  - Publish directory: `dist`
- Every push triggers deployment

---

## Monitoring & Analytics

After deployment, consider adding:
- **Vercel Analytics** (built-in, free tier)
- **Google Analytics** or **Plausible Analytics**
- **Sentry** for error tracking

---

## Custom Domain (Optional)

### Vercel:
```bash
vercel domains add peakwise.app
```

### Netlify:
- Dashboard → Domain Settings → Add custom domain

---

## Troubleshooting

### Build fails with "Module not found"
- Clear cache: `expo start --clear`
- Rebuild: `npm run build:web`

### Environment variables not working
- Ensure they start with `EXPO_PUBLIC_`
- Rebuild after setting env vars

### 404 on refresh
- Vercel: Already configured with `vercel.json` ✓
- Netlify: Already configured with `netlify.toml` ✓

### Assets not loading
- Check `public/` folder is being copied
- Verify asset paths are correct
