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
# Deployment Guide

## Hosting target

This project is a static-first Next.js portfolio and is ready to deploy on Netlify.

## Required environment variables

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Optional future environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_SITE_VERIFICATION=
```

## Netlify

1. Connect the repository.
2. Keep the build command as `pnpm build`.
3. Use Node `20`.
4. Add `NEXT_PUBLIC_SITE_URL` in the Netlify dashboard.
5. Deploy.

## Local production check

```bash
pnpm install
pnpm type-check
pnpm build
pnpm start
```

## Post-deploy checklist

- Confirm the home page and all route pages load.
- Confirm the livestream page embeds Kick successfully.
- Confirm `sitemap.xml` and `robots.txt` resolve.
- Confirm Open Graph assets load.

## Supabase later

When you are ready to add Supabase, keep the current route structure and replace the arrays in `lib/site-content.ts` with fetched content. The current site does not require any database setup.

