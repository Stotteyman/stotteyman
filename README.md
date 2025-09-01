# Stotteyman Enterprises - Portfolio & Referral Platform

A modern, mobile-optimized portfolio website with comprehensive admin functionality, referral management, and real-time chat features.

## 🚀 Features

### Core Features
- **Responsive Design**: Mobile-first approach with app-like experience
- **Portfolio Showcase**: Professional presentation of work and achievements
- **Contact Integration**: Easy ways for visitors to get in touch
- **SEO Optimized**: Built for search engine visibility

### Authentication & User Management
- **Google OAuth**: Secure authentication with Google accounts
- **Role-Based Access**: User, Moderator, Admin, and Owner roles
- **Session Management**: Persistent login sessions
- **Protected Routes**: Secure access to admin features

### Admin Dashboard
- **User Management**: View, edit, and manage user roles
- **Content Management**: Manage blog posts and referrals
- **Analytics Overview**: Dashboard with key metrics
- **Real-time Updates**: Live data updates and notifications

### Referral System
- **Referral Deals**: Curated selection of commission opportunities
- **Category Filtering**: Organized by industry and type
- **Search Functionality**: Find specific deals quickly
- **Commission Tracking**: Transparent commission rates and requirements

### Real-time Chat
- **Live Messaging**: Real-time chat with Socket.IO
- **User Presence**: See who's online
- **Message History**: Persistent chat history
- **Mobile Optimized**: Responsive chat interface

### Blog Management
- **Content Creation**: Rich text blog post creation
- **Status Management**: Draft, published, and archived states
- **SEO Optimization**: Slug-based URLs and meta tags
- **Admin Controls**: Full CRUD operations for blog posts

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Neon PostgreSQL with serverless driver
- **Real-time**: Socket.IO for chat functionality
- **Deployment**: Netlify (configured)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Google OAuth credentials

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stotteyman-enterprises
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database Configuration
DATABASE_URL="your-neon-postgresql-url"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-secret"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 4. Database Setup
```bash
# Run the database seeder to create tables and sample data
npm run db:setup
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Database Setup
1. Create a Neon PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run the seeder: `npm run db:setup`

## 📱 Mobile Optimization

The application is built with a mobile-first approach:
- Responsive design that works on all screen sizes
- Touch-friendly interface elements
- Optimized loading times
- PWA-ready configuration

## 🔐 Security Features

- **Authentication**: Secure OAuth flow with NextAuth.js
- **Role-Based Access**: Granular permissions system
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API rate limiting for security

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update colors in `app/globals.css`
- Customize components in the `components/` directory

### Content
- Update hero section in `components/HeroSection.tsx`
- Modify navigation in `components/Navigation.tsx`
- Add new pages in the `app/` directory

### Referrals
- Add new referral deals through the admin dashboard
- Update categories in `app/referrals/ReferralsClient.tsx`
- Modify commission structures as needed

## 📊 Admin Dashboard

Access the admin dashboard at `/dashboard` (requires admin/owner role):

### Features
- **User Management**: View and modify user roles
- **Referral Management**: Add, edit, and delete referral deals
- **Blog Management**: Create and manage blog posts
- **Chat Moderation**: Monitor and manage chat messages
- **Analytics**: View system statistics and user activity

### Admin Roles
- **Owner**: Full system access, can delete users
- **Admin**: Full content management access
- **Moderator**: Limited content management
- **User**: Basic access to public features

## 💬 Chat System

The real-time chat system includes:
- Live messaging with Socket.IO
- User presence indicators
- Message history persistence
- Mobile-optimized interface
- Admin moderation tools

## 🚀 Deployment

### Netlify Deployment
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_SOCKET_URL="https://your-socket-server.com"
```

## 📈 Performance

- **Lighthouse Score**: Optimized for 90+ performance score
- **Bundle Analysis**: Configured with webpack-bundle-analyzer
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Strategic caching for optimal performance

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Check accessibility
npm run test:accessibility
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:turbo        # Start with Turbo mode

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analysis

# Database
npm run db:seed          # Seed database with sample data
npm run db:setup         # Setup database (alias for db:seed)

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run Playwright E2E tests

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Type Checking
npm run type-check       # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact through the website contact form
- Email: support@stotteyman.com

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Following the repository
- Checking the changelog
- Monitoring the releases page

---

Built with ❤️ by Stotteyman Enterprises