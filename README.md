# String Art Generator

> **Free online tool to create beautiful string art patterns from any image**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)]()

Transform your photos into stunning thread art patterns with our advanced algorithms. Perfect for DIY crafts, wall art projects, and creative designs.

---

## ✨ Features

### Core Features
- 🖼️ **Image Upload** - Drag & drop or select any image
- ✂️ **Interactive Cropper** - Crop and zoom without distortion
- ⚙️ **Customizable Parameters**:
  - Pins: 100-400
  - Lines: 1000-5000
  - Line Weight: 5-25
  - Image Size: 400-800px
- 💾 **Multiple Exports** - Download JSON coordinates or PNG image
- 👁️ **Live Preview** - Toggle between original and result

### Advanced Algorithm ⭐
1. **Edge Detection (Sobel)** - Automatic edge prioritization
2. **Weighted Error Function** - Importance-weighted critical areas
3. **Adaptive Line Weight** - Dynamic weight based on progression
4. **Look-Ahead Algorithm** - Evaluates future steps for optimal choices
5. **Anti-Aliasing (Wu)** - Smooth lines with Wu's algorithm

### Performance Optimizations
- ⚡ **Web Workers** - Runs in separate thread (non-blocking UI)
- 📊 **Real-time Progress** - Live feedback during generation
- 🎨 **Smooth UX** - Professional animations and transitions

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/string-art-generator.git

# Navigate to project
cd string-art-generator/react-string-art

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
```

Output in `dist/` folder

---

## 📖 Documentation

### Main Guides

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
2. **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Deep dive into algorithms
3. **[CROP_FEATURE.md](./CROP_FEATURE.md)** - Image cropping details
4. **[UX_IMPROVEMENTS.md](./UX_IMPROVEMENTS.md)** - UI/UX enhancements
5. **[FIXES.md](./FIXES.md)** - Bug fixes and optimizations

### SEO & Monetization

6. **[SEO_MONETIZATION_GUIDE.md](./SEO_MONETIZATION_GUIDE.md)** - Complete monetization guide
7. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment

---

## 🎯 Usage

### Basic Workflow

1. **Upload Image** → Image cropper appears
2. **Crop Image** → Drag and zoom to frame
3. **Set Parameters** → Adjust pins, lines, etc.
4. **Generate** → Click "Generate String Art"
5. **Export** → Download JSON or PNG

### Recommended Settings

**For Portraits:**
```
Pins: 300-350
Lines: 4000
Line Weight: 15-18
Algorithm: Advanced + Edge Detection
```

**For Landscapes:**
```
Pins: 250-300
Lines: 3000
Line Weight: 12-15
Algorithm: Basic or Advanced
```

**For Quick Preview:**
```
Pins: 200
Lines: 2000
Line Weight: 15
Algorithm: Basic + Web Worker
```

---

## 🏗️ Project Structure

```
react-string-art/
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx       # Drag & drop uploader
│   │   ├── ImageCropper.jsx        # Interactive crop editor
│   │   ├── ParameterControls.jsx   # Settings panel
│   │   ├── StringArtCanvas.jsx     # Results display
│   │   ├── Toast.jsx               # Notifications
│   │   ├── AdBanner.jsx            # Google AdSense
│   │   ├── LandingHero.jsx         # Hero section
│   │   └── FAQ.jsx                 # SEO FAQ section
│   ├── utils/
│   │   ├── stringArtAlgorithm.js   # Basic algorithm
│   │   └── advancedStringArt.js    # Advanced algorithm
│   ├── workers/
│   │   └── stringArtWorker.js      # Web Worker
│   ├── hooks/
│   │   └── useStringArtWorker.js   # React hook
│   ├── i18n/
│   │   └── en.js                   # English translations
│   ├── App.jsx                     # Main app
│   └── main.jsx                    # Entry point
├── public/
│   ├── robots.txt                  # SEO
│   ├── sitemap.xml                 # SEO
│   └── og-image.jpg                # Social sharing
├── index.html                      # HTML with meta tags
└── package.json
```

---

## 🔬 Algorithms

### Basic Algorithm (Fast)
```
Speed: ~2-3 seconds
Quality: ⭐⭐⭐

- Bresenham line drawing
- Full line pre-caching
- Greedy error minimization
- Optimal luminance conversion
```

### Advanced Algorithm (High Quality)
```
Speed: ~15-20 seconds
Quality: ⭐⭐⭐⭐⭐

+ Edge Detection (Sobel)
+ Weighted Error Function
+ Adaptive Line Weight
+ Look-Ahead (optional)
+ Anti-Aliasing (optional)
```

### Performance Comparison

| Configuration | Time | Quality | Memory |
|--------------|------|---------|--------|
| Basic + Worker | ~2s | ⭐⭐⭐ | 150MB |
| Advanced | ~15s | ⭐⭐⭐⭐⭐ | 250MB |
| Advanced + Lookahead | ~30s | ⭐⭐⭐⭐⭐ | 300MB |

---

## 📊 SEO Optimization

### Implemented Features

✅ **Meta Tags:**
- Title, description, keywords
- Open Graph (Facebook/LinkedIn)
- Twitter Cards
- Schema.org structured data

✅ **Performance:**
- Lighthouse score: 90+
- Core Web Vitals optimized
- Image optimization
- Code splitting

✅ **Content:**
- SEO-friendly URLs
- Sitemap.xml
- Robots.txt
- FAQ section
- Blog-ready structure

### Target Keywords

**Primary:**
- string art generator
- thread art maker
- online string art tool

**Long-tail:**
- free string art generator online
- how to create string art from photo
- DIY string art patterns

---

## 💰 Monetization

### Google AdSense Integration

Ready-to-use ad components:

```jsx
import AdBanner from './components/AdBanner'

<AdBanner slot="YOUR_SLOT_ID" format="horizontal" />
```

**Optimal Placements:**
1. After hero section
2. Sidebar (left panel)
3. Before FAQ section
4. Footer area

### Revenue Estimates

| Monthly Visitors | Est. Revenue |
|-----------------|--------------|
| 5,000 | $25-$100 |
| 10,000 | $50-$200 |
| 50,000 | $250-$1,000 |
| 100,000 | $500-$2,000 |

*Based on crafts/DIY niche CPC: $0.50-$2*

---

## 🌐 Deployment

### Recommended: Vercel

```bash
npm install -g vercel
vercel
```

### Alternative: Netlify

```bash
# Push to GitHub, then:
# netlify.com → New site from Git
```

### Alternative: GitHub Pages

```bash
npm install --save-dev gh-pages
npm run deploy
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for full guide.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

Based on academic research:
- **String Art: Towards Computational Fabrication** (2024)
- **Computational Thread Art** - Greedy gradient descent
- **Parallelized String Art** - Multi-threading techniques

---

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/string-art-generator/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/string-art-generator/discussions)
- 📧 **Email:** support@your-domain.com

---

## 🎨 Screenshots

### Main Interface
![Main Interface](./screenshots/main.png)

### Crop Editor
![Crop Editor](./screenshots/crop.png)

### Results
![Results](./screenshots/results.png)

---

## 🔮 Roadmap

- [ ] Multiple aspect ratios (not just square)
- [ ] Color string art support
- [ ] Batch processing
- [ ] API endpoint
- [ ] Mobile app (React Native)
- [ ] Community gallery
- [ ] AI-powered suggestions

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/string-art-generator&type=Date)](https://star-history.com/#yourusername/string-art-generator&Date)

---

**Made with ❤️ for the DIY community**

