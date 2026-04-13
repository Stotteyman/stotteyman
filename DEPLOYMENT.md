# Deployment Guide

This guide covers deploying Stotteyman to various platforms with optimal configurations.

## 🚀 Netlify Deployment (Recommended)

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/stotteyman)

### Manual Deployment

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: pnpm build
   Publish directory: leave blank
   Node version: 20
   ```

3. **Environment Variables**
   Add these in Netlify dashboard under Site Settings > Environment Variables:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
   GOOGLE_SITE_VERIFICATION=your-verification-code
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live!

### Post-Deploy Setup

1. **Database Setup**
   ```bash
   # Run this after deployment
   pnpm db:setup
   ```

2. **Sitemap Ping**
   - The sitemap will be automatically pinged to Google and Bing
   - Check Netlify Functions logs for ping results

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=stotteyman
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## ☁️ Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   DATABASE_URL=your-database-url
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

## 🐙 GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select "GitHub Actions" as source

2. **Create Workflow**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install -g pnpm
         - run: pnpm install
         - run: pnpm build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

## 🔧 Environment Configuration

### Required Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Optional Variables
```env
# SEO
GOOGLE_SITE_VERIFICATION=your-verification-code

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
PLAUSIBLE_DOMAIN=your-domain.com

# Admin
ADMIN_SECRET_KEY=your-secret-key

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_TTS=true
ENABLE_GAMEPAD=true
ENABLE_3D=true
```

## 📊 Performance Optimization

### Bundle Analysis
```bash
pnpm analyze-bundle
```

### Lighthouse Audit
```bash
pnpm lighthouse
```

### Image Optimization
- Use WebP format for images
- Compress videos (target < 6MB total)
- Use Next.js Image component

### Code Splitting
- Lazy load 3D components
- Dynamic imports for heavy libraries
- Route-based code splitting

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Security headers set

## 📈 Monitoring

### Health Checks
- `/api/ai` - AI endpoint health
- `/api/track` - Analytics endpoint health
- `/sitemap.xml` - SEO sitemap

### Logs
- Check platform logs for errors
- Monitor database connections
- Track performance metrics

### Alerts
- Set up uptime monitoring
- Configure error alerts
- Monitor performance budgets

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

**Database Connection**
- Verify DATABASE_URL format
- Check database accessibility
- Run `pnpm db:setup`

**Performance Issues**
- Analyze bundle size
- Check Lighthouse scores
- Optimize images and videos

**SEO Issues**
- Verify sitemap generation
- Check robots.txt
- Test meta tags

### Debug Mode
Set `NODE_ENV=development` for:
- Detailed error messages
- Hot reloading
- Debug overlays
- Source maps

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/stotteyman/issues)
- **Documentation**: [README.md](./README.md)
- **Community**: [GitHub Discussions](https://github.com/your-username/stotteyman/discussions)
