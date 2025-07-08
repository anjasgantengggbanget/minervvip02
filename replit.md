# USDT Mining Bot - Telegram Mini App

## Overview

This is a Telegram Mini App for a crypto mining simulation game built with React, Express, and PostgreSQL. Users can mine virtual USDT tokens, complete tasks, refer friends, and manage their crypto earnings. The application features both user-facing functionality and an admin panel for management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom crypto theme variables
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens for admin access, Telegram ID for user auth
- **API Design**: RESTful endpoints with middleware-based authentication
- **External Services**: Telegram Bot API and Solana blockchain integration

## Key Components

### Database Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon serverless with WebSocket support
- **Migrations**: Managed through drizzle-kit
- **Schema**: Comprehensive relational design covering users, tasks, referrals, transactions, and boosts

### Authentication System
- **User Authentication**: Telegram ID-based identification
- **Admin Authentication**: JWT tokens with role-based access
- **Middleware**: Request validation and user context injection

### Mining System
- **Virtual Mining**: Time-based farming with configurable rates
- **Progress Tracking**: 24-hour cycles with real-time updates
- **Reward Distribution**: Automatic balance updates and earnings tracking

### Task System
- **Task Types**: Support for Telegram, Twitter, YouTube, and custom tasks
- **Completion Tracking**: User-specific task completion status
- **Reward Management**: Automatic balance updates on task completion

### Referral System
- **Multi-Level**: 3-tier referral structure (10%, 5%, 2% commissions)
- **Tracking**: Comprehensive referral relationship mapping
- **Earnings**: Separate tracking of referral-based earnings

## Data Flow

1. **User Registration**: Telegram users register through bot interaction
2. **Authentication**: Frontend identifies users via Telegram ID headers
3. **Mining Operations**: Time-based calculations for farming progress
4. **Task Completion**: User actions trigger backend validation and reward distribution
5. **Referral Processing**: New user registrations create referral chains
6. **Transaction Management**: All balance changes tracked in transaction history

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm for database operations
- **Authentication**: jsonwebtoken for admin session management
- **Telegram**: node-telegram-bot-api for bot integration
- **Solana**: @solana/web3.js for blockchain operations

### UI Dependencies
- **Components**: Comprehensive Radix UI component library
- **Styling**: Tailwind CSS with custom crypto theme
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Development**: Hot reloading and runtime error overlay
- **Code Quality**: TypeScript strict mode with path aliases

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Assets**: Static files served from Express in production

### Environment Configuration
- **Development**: Local database with hot reloading
- **Production**: Serverless deployment with environment variables
- **Database**: Neon PostgreSQL with connection pooling

### Scripts
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema synchronization

## User Preferences

Preferred communication style: Simple, everyday language.

## Vercel Deployment

The application is now ready for deployment to Vercel with the following setup:

### Configuration Files
- `vercel.json` - Vercel deployment configuration
- `api/index.ts` - Serverless function handler for all API routes
- `.vercelignore` - Files to exclude from deployment
- `DEPLOYMENT.md` - Comprehensive deployment guide

### Environment Variables Required
```
DATABASE_URL=postgresql://username:password@host:port/database
TELEGRAM_BOT_TOKEN=7872550878:AAEu1SGb4OO5bmp7fka9gsrjCyLywgmbT2w
SOLANA_DEPOSIT_WALLET=EE9UQfmRtvTHq4TkawiMdqET4gaia32MuEoCwjCuz1cr
ADMIN_PASSWORD=SecureAdmin2024!
JWT_SECRET=your_random_jwt_secret_key_here
```

### Deployment Steps
1. Upload project to GitHub/GitLab
2. Connect to Vercel Dashboard
3. Set environment variables
4. Deploy

### Key Features
- Secure admin panel with hidden endpoint
- PostgreSQL database with automatic initialization
- Demo user with realistic data
- Complete mining, referral, and task systems
- Telegram bot integration ready
- Solana blockchain integration

## Changelog

Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Added Vercel deployment configuration and comprehensive deployment guide