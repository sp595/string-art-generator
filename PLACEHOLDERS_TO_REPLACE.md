
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
