# Stotteyman Enterprises LLC - Investor Website

A cutting-edge, futuristic investor-facing website showcasing Stotteyman's venture portfolio and entrepreneurial journey.

## 🚀 Features

- **Futuristic Design**: Dark mode-first with neon gradients, glassmorphism, and liquid animations
- **Advanced Animations**: GSAP and Framer Motion for smooth, professional transitions
- **Responsive**: Optimized for all devices and screen sizes
- **SEO Optimized**: Meta tags, OpenGraph, and structured data
- **Accessibility**: WCAG 2.2 compliant with keyboard navigation and ARIA labels
- **Performance**: Optimized images, lazy loading, and edge caching ready

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS with custom animations
- **Animations**: Framer Motion + GSAP
- **Typography**: Inter, Playfair Display, JetBrains Mono
- **Deployment**: Netlify-ready with serverless functions

## 📁 Project Structure

```
├── app/
│   ├── about/page.tsx          # About Gary McCullouch
│   ├── blog/page.tsx           # AI-driven blog
│   ├── contact/page.tsx        # Contact & Calendly integration
│   ├── livestream/page.tsx     # Livestream involvement
│   ├── ventures/page.tsx       # Portfolio showcase
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── components/
│   ├── CTASection.tsx          # Call-to-action sections
│   ├── FloatingCTA.tsx         # Floating Calendly button
│   ├── HeroSection.tsx         # Homepage hero
│   ├── LivestreamPreview.tsx   # Livestream showcase
│   ├── Navigation.tsx          # Main navigation
│   └── VenturesPreview.tsx     # Ventures preview cards
└── public/                     # Static assets
```

## 🎨 Design Features

### Animations
- **Logo Reveal**: GSAP-powered animated logo entrance
- **Parallax Scrolling**: Smooth background movement
- **Hover States**: Interactive elements with micro-animations
- **Page Transitions**: Seamless navigation between pages
- **Scroll Triggers**: Content reveals on scroll

### Visual Elements
- **Glassmorphism**: Translucent cards with backdrop blur
- **Neon Glows**: Subtle lighting effects on interactive elements
- **Gradient Text**: Dynamic color transitions
- **Floating Particles**: Ambient background animations
- **Grid Overlays**: Futuristic background patterns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stotteyman-enterprises
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link your Git repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

3. **Deploy**
   - Automatic deployments on git push
   - Edge functions support for serverless features

## 📱 Pages Overview

### Homepage (`/`)
- Hero section with animated logo
- Ventures preview with interactive cards
- Livestream involvement showcase
- Call-to-action with Calendly integration

### About (`/about`)
- Gary's entrepreneurial journey
- Core values and principles
- Timeline of achievements
- Investment philosophy

### Ventures (`/ventures`)
- Detailed portfolio showcase
- Interactive venture cards
- Investment opportunities

### Livestream (`/livestream`)
- IRL culture involvement
- Key collaborator profiles
- Partnership opportunities

### Blog (`/blog`)
- AI-generated content
- Category filtering
- Search functionality
- Newsletter signup

### Contact (`/contact`)
- Multiple contact methods
- Calendly integration
- Contact form with validation
- Response time commitments

## 🎯 Key Features

### Calendly Integration
- Floating CTA button on all pages
- Modal popup with embedded calendar
- Direct booking links in navigation
- Investment-focused scheduling

### Performance Optimizations
- Image optimization with Next.js
- Lazy loading for animations
- Code splitting by route
- Edge-ready deployment

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- ARIA labels and roles

### SEO Features
- Dynamic meta tags
- OpenGraph images
- Structured data markup
- Sitemap generation

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to modify the color palette:
```javascript
colors: {
  primary: { /* your colors */ },
  neon: { /* neon variants */ }
}
```

### Animations
Modify animations in `globals.css` and component files:
```css
@keyframes customAnimation {
  /* your keyframes */
}
```

### Content
Update venture data in `/app/ventures/page.tsx`:
```javascript
const ventures = [
  // your venture data
]
```

## 📊 Analytics & Tracking

Ready for integration with:
- Google Analytics 4
- Facebook Pixel
- LinkedIn Insight Tag
- Custom event tracking

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- CSRF protection
- Secure headers configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary and confidential. All rights reserved by Stotteyman Enterprises LLC.

## 📞 Support

For technical support or questions:
- Email: gary@stotteyman.com
- Schedule a call: https://calendly.com/garymccullouch

---

Built with ❤️ for the future of investment and innovation.