# Stotteyman Portfolio

A minimal, interactive portfolio website with the tagline "Life is what you make it."

## Features

### ✨ Interactive Experience
- **Animated Intro**: Clean animation with "Stotteyman" and "Life is what you make it"
- **Centered Menu**: Minimal navigation with smooth transitions
- **Keyboard Navigation**: Full keyboard support (arrow keys, WASD, Enter, Escape)

### 📱 Responsive Design
- Mobile-first approach
- Clean, minimal aesthetic
- Smooth animations and transitions
- Accessibility features included

### 🎨 Portfolio Sections

1. **Who am I** - Personal introduction and philosophy
2. **My Socials** - Links to social media and contact methods
3. **Blog** - Showcase of thoughts and articles
4. **Projects** - Portfolio of creative and technical work
5. **Contact** - Contact form and communication options

### 🖼️ Media Management
- **Media Upload**: Drag & drop or click to upload images/videos
- **Auto-optimization**: Images automatically optimized for web
- **Video Thumbnails**: Automatic thumbnail generation
- **Gallery View**: Clean grid layout with modal viewing
- **Admin Panel**: Access at `/admin/media` for media management

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom minimal theme
- **Fonts**: Orbitron (display), Fira Code (mono)
- **Media Processing**: Client-side optimization with Canvas API
- **State Management**: React hooks and local state

## File Structure

```
components/
├── IntroAnimation.tsx      # Animated intro component
├── PortfolioMenu.tsx       # Main navigation menu
├── AboutPage.tsx          # About/Who am I page
├── SocialsPage.tsx        # Social media links
├── BlogPage.tsx           # Blog posts showcase
├── ProjectsPage.tsx       # Portfolio projects
├── ContactPage.tsx        # Contact form and info
├── MediaUpload.tsx        # File upload component
└── MediaGallery.tsx       # Media display component

lib/
└── media-utils.ts         # Media processing utilities

app/
├── page.tsx               # Main portfolio app
├── layout.tsx             # Root layout
└── admin/
    └── media/
        └── page.tsx       # Media management admin
```

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Access the portfolio**:
   - Main site: `http://localhost:3000`
   - Media admin: `http://localhost:3000/admin/media`

## Customization

### Content Updates
- Edit content directly in component files
- Update social links in `SocialsPage.tsx`
- Modify blog posts in `BlogPage.tsx`
- Add/remove projects in `ProjectsPage.tsx`

### Styling
- Colors and theme in `tailwind.config.js`
- Global styles in `app/globals.css`
- Component-specific styles using Tailwind classes

### Media Management
- Upload files via `/admin/media`
- Supported formats: JPEG, PNG, GIF, WebP, MP4, WebM, OGG
- Maximum file size: 50MB per file
- Automatic optimization for web delivery

## Design Philosophy

The portfolio follows a **minimal design philosophy**:

- **Simplicity**: Clean, uncluttered interface
- **Focus**: Content is the hero, not the design
- **Performance**: Fast loading and smooth interactions
- **Accessibility**: Keyboard navigation and screen reader support
- **Responsive**: Works beautifully on all devices

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Performance Features

- Client-side image optimization
- Lazy loading for media
- Minimal JavaScript bundle
- Optimized fonts and assets
- Responsive images

## Accessibility

- Full keyboard navigation
- Screen reader friendly
- High contrast mode support
- Reduced motion support
- Semantic HTML structure

---

**Life is what you make it.** ✨
