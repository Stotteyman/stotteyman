# Stotteyman - AI-Powered Digital Mentor

An immersive, game-like website featuring an AI-powered wireframe talking head that learns and adapts over time. Built with Next.js, Three.js, and cutting-edge web technologies.

## 🚀 Features

- **Fullscreen Intro Video**: Unskippable for first-time visitors, skippable for returning users
- **AI-Powered Conversation**: Dynamic dialogue with emotion-based responses
- **3D Wireframe Head**: Procedural wireframe visualization that reacts to AI emotions
- **Multi-Input Support**: Keyboard, mouse/touch, and gamepad navigation
- **Mobile-Optimized**: Dedicated mobile layout with lighter assets
- **Real-time Audio**: WebAudio UI sounds and Text-to-Speech
- **Learning System**: AI memory that adapts to user interactions
- **Performance Optimized**: Sub-200KB initial bundle, lazy loading
- **SEO Ready**: Automated sitemap, robots.txt, and Google ping

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Neon serverless Postgres
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **State Management**: XState for screen flow, Zustand for local state
- **Styling**: TailwindCSS with custom neon theme
- **Audio**: WebAudio API, Web Speech API
- **Testing**: Vitest, Playwright, Lighthouse CI
- **Deployment**: Netlify with `@netlify/plugin-nextjs`

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stotteyman.git
   cd stotteyman
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_SITE_URL=https://stotteyman.com
   ```

4. **Set up the database**
   ```bash
   pnpm db:setup
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Create a new project at [Neon Console](https://console.neon.tech)
2. Copy the connection string to your `.env.local`
3. Run the setup script:
   ```bash
   pnpm db:setup
   ```

### Manual Setup

1. Create a Postgres database
2. Run the schema from `lib/schema.sql`
3. Update your `DATABASE_URL` in `.env.local`

## 🧪 Testing

### Run All Tests
```bash
pnpm quality
```

### Individual Test Suites

**Type Checking**
```bash
pnpm type-check
```

**Linting**
```bash
pnpm lint
pnpm lint:css
```

**Unit Tests**
```bash
pnpm test
```

**E2E Tests**
```bash
pnpm test:e2e
```

**Lighthouse Performance**
```bash
pnpm lighthouse
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `pnpm build`
   - Publish directory: leave blank
   - Node version: `20`
3. **Add environment variables** in Netlify dashboard
4. **Deploy!**

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

## 📊 Performance Targets

- **Lighthouse Performance**: ≥ 95
- **Lighthouse SEO**: ≥ 100
- **Lighthouse Accessibility**: ≥ 95
- **Lighthouse Best Practices**: ≥ 95
- **LCP**: ≤ 2.5s on 4G
- **CLS**: ~0
- **Bundle Size**: ≤ 200KB (desktop), ≤ 140KB (mobile)

## 🎮 Controls

### Keyboard
- **Arrow Keys / WASD**: Navigate menus
- **Enter / Space**: Select option
- **Escape**: Go back

### Gamepad
- **D-Pad / Left Stick**: Navigate
- **A Button**: Select
- **B Button**: Back

### Touch / Mouse
- **Tap / Click**: Select option
- **Swipe**: Navigate (mobile)

## 🎨 Customization

### Themes
Edit `tailwind.config.js` to customize the neon color scheme:

```javascript
colors: {
  neon: {
    cyan: '#00ffff',
    pink: '#ff00ff',
    green: '#00ff00',
    // Add your colors
  }
}
```

### AI Personality
Modify `lib/persona.ts` to change Stotteyman's personality:

```typescript
export const STOTTEYMAN_PERSONA = {
  name: 'Stotteyman',
  traits: ['playful', 'actionable', 'tech-savvy'],
  // Customize speech patterns, topics, etc.
};
```

### 3D Wireframe
Replace the procedural wireframe in `components/WireHead.tsx` with your own GLTF model.

## 🔧 Development

### Project Structure
```
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
├── hooks/             # Custom hooks
├── lib/               # Utilities and configurations
├── public/            # Static assets
├── scripts/           # Database and build scripts
└── test/              # Test files
```

### Adding New Features

1. **New Screen**: Add state to `lib/machine.ts`
2. **New Component**: Create in `components/`
3. **New API Endpoint**: Add to `app/api/`
4. **New Test**: Add to `test/`

## 📈 Analytics

The app includes built-in analytics tracking:

- **User interactions**: Clicks, navigation, choices
- **Performance metrics**: Load times, errors
- **AI interactions**: Conversation turns, emotions
- **Device information**: Type, capabilities

## 🔒 Security

- **CSP Headers**: Strict Content Security Policy
- **Input Validation**: All API inputs are validated
- **Rate Limiting**: API endpoints are rate-limited
- **Environment Variables**: Sensitive data in env vars only

## 🌐 SEO

- **Meta Tags**: Dynamic Open Graph and Twitter cards
- **Sitemap**: Auto-generated at `/sitemap.xml`
- **Robots**: Auto-generated at `/robots.txt`
- **Google Ping**: Automatic sitemap submission
- **JSON-LD**: Structured data for search engines

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check your `DATABASE_URL` in `.env.local`
- Ensure your Neon database is active
- Run `pnpm db:setup` to initialize schema

**3D Wireframe Not Loading**
- Check browser WebGL support
- Verify Three.js dependencies are installed
- Check console for WebGL errors

**Audio Not Working**
- Ensure user interaction before audio plays
- Check browser audio permissions
- Verify WebAudio API support

**Performance Issues**
- Check bundle size with `pnpm build`
- Run Lighthouse audit
- Verify lazy loading is working

### Debug Mode

Set `NODE_ENV=development` to enable:
- Debug info overlay
- Console logging
- Hot reloading
- Source maps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** for 3D graphics
- **Next.js** for the React framework
- **Neon** for serverless Postgres
- **Netlify** for hosting and deployment
- **TailwindCSS** for styling
- **XState** for state management

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/stotteyman/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/stotteyman/discussions)
- **Email**: support@stotteyman.com

---

**Built with ❤️ by the Stotteyman team**
