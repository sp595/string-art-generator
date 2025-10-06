# Placeholders to Replace Before Deployment

Before deploying your String Art Generator, replace these placeholders with your actual values:

## 🔴 Required Changes

### 1. Google AdSense Publisher ID

**File:** `index.html` (line ~31)

```html
<!-- FIND THIS: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"

<!-- REPLACE WITH: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
```

**How to get:**
1. Sign up at https://www.google.com/adsense
2. Wait for approval (1-2 weeks)
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

---

### 2. Google Analytics Measurement ID

**File:** `index.html` (lines ~35 and ~40)

```html
<!-- FIND THIS (2 places): -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_MEASUREMENT_ID"></script>
...
gtag('config', 'G-YOUR_MEASUREMENT_ID');

<!-- REPLACE WITH: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
...
gtag('config', 'G-XXXXXXXXXX');
```

**How to get:**
1. Go to https://analytics.google.com
2. Create new property
3. Copy Measurement ID (format: `G-XXXXXXXXXX`)

---

### 3. Domain URLs

**File:** `index.html` (multiple locations)

```html
<!-- FIND ALL INSTANCES OF: -->
https://yourdomain.com/

<!-- REPLACE WITH YOUR ACTUAL DOMAIN: -->
https://stringartgenerator.com/
```

**Locations to replace:**
- Line ~14: `<link rel="canonical" href="..."/>`
- Line ~26: `<meta property="og:url" content="..."/>`
- Line ~27: `<meta property="og:image" content=".../og-image.jpg"/>`
- Line ~29: `<meta property="twitter:image" content=".../og-image.jpg"/>`
- Line ~49: `"url": "..."`
- Line ~50: `"image": ".../og-image.jpg"`

---

### 4. Ad Slot IDs

**File:** `src/App.jsx` (3 locations)

```jsx
// FIND THESE:
<AdBanner slot="YOUR_TOP_BANNER_SLOT_ID" format="horizontal" />
<AdBanner slot="YOUR_SIDEBAR_AD_SLOT_ID" format="vertical" />
<AdBanner slot="YOUR_BOTTOM_BANNER_SLOT_ID" format="horizontal" />

// REPLACE WITH YOUR ACTUAL AD SLOT IDs:
<AdBanner slot="1234567890" format="horizontal" />
<AdBanner slot="0987654321" format="vertical" />
<AdBanner slot="5555555555" format="horizontal" />
```

**How to get:**
1. Log in to Google AdSense
2. Go to **Ads** → **Ad units** → **New ad unit**
3. Create 3 ad units:
   - "String Art - Top Banner" (Responsive)
   - "String Art - Sidebar" (Vertical/Responsive)
   - "String Art - Bottom Banner" (Responsive)
4. Copy each Ad Slot ID

---

## 📝 Files to Create

### 5. OG Image (Social Media Preview)

**Create:** `public/og-image.jpg`

- **Size:** 1200x630px
- **Content:** Example of string art output
- **Text:** "Free String Art Generator"
- **File size:** < 200KB
- **Format:** JPG or PNG

**Tools:**
- Canva.com (free)
- Photoshop
- GIMP (free)

---

### 6. Sitemap (Already in public/)

**File:** `public/sitemap.xml`

Update the date:
```xml
<lastmod>2025-10-06</lastmod>  <!-- Update to current date -->
```

And domain:
```xml
<loc>https://your-actual-domain.com/</loc>
```

---

### 7. Robots.txt (Already in public/)

**File:** `public/robots.txt`

Update domain:
```txt
Sitemap: https://your-actual-domain.com/sitemap.xml
```

---

## ✅ Quick Verification Checklist

Before deploying:

```
□ Google AdSense Publisher ID replaced in index.html
□ Google Analytics Measurement ID replaced in index.html (2 places)
□ Domain URLs replaced in index.html (~6 places)
□ Ad Slot IDs replaced in src/App.jsx (3 places)
□ OG image created in public/og-image.jpg
□ Sitemap.xml date and domain updated
□ Robots.txt domain updated
□ Built successfully (npm run build)
□ Tested locally (npm run dev)
```

---

## 🚀 After Replacing Placeholders

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Vercel: `vercel`
   - Netlify: Push to GitHub, deploy via dashboard
   - GitHub Pages: `npm run deploy`

3. **Submit to Google:**
   - Google Search Console: Submit sitemap
   - Verify site ownership
   - Wait 2-7 days for indexing

---

## 📚 Full Documentation

For complete deployment instructions, see:
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- `SEO_MONETIZATION_GUIDE.md` - Complete SEO and monetization guide
- `README_EN.md` - Full project documentation

---

## ❓ Need Help?

**AdSense Help:** https://support.google.com/adsense
**Analytics Help:** https://support.google.com/analytics
**Deployment Issues:** See DEPLOYMENT_CHECKLIST.md troubleshooting section
