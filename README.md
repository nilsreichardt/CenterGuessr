# CenterGuessr 🎓

A production-ready guessing game where CDTM alumni test their knowledge of fellow Centerlings! Guess which class your alumni were in and compete on the leaderboard.

## ✨ What's New in v2.0

This version has been completely rebuilt from the ground up with production-ready features:

### 🎮 Two Game Modes
- **Training Mode**: Practice without pressure, no points earned
- **Ranked Mode**: Compete for points and climb the leaderboard
  - +1 point per correct answer
  - +1 bonus point for every 3 correct answers in a row
  - Minimum 6 classes required to prevent easy wins

### 🏆 Competitive Features
- **Real-time Leaderboard**: See how you rank against other CDTM alumni
- **Points & Streaks**: Track your progress with detailed statistics
- **Animated Feedback**: Satisfying animations for points and achievements
- **Server-side Evaluation**: Cheat-proof scoring system

### 🔐 Secure Authentication
- **Google OAuth**: Sign in with your CDTM Google account
- **Domain Restriction**: Only @cdtm.com email addresses allowed
- **Profile Management**: Track your stats and achievements

## 🚀 Quick Start for Development

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Google Cloud Console project
- Access to CDTM Directus CMS

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Directus CMS Configuration
NEXT_PUBLIC_DIRECTUS_URL=https://cms.cdtm.com
DIRECTUS_TOKEN=your-directus-token
```

### 2. Get Directus API Access

1. **Login to the CMS**: Visit https://cms.cdtm.com and log in using your CDTM Google account.
2. **Access the User Directory**: On the left-hand sidebar, click on User Directory.
3. **Access the Applications Role**: Click on the `Applications` role.
4. **Create a New User**: Click the plus icon to create a new user with your name and add a "local" tag.
5. **Generate an API Key**: Click the plus icon in the Token field to generate your API key.

### 3. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Copy the SQL from `supabase/migrations/001_initial_schema.sql`
3. Run it in your Supabase SQL editor

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

### 5. Supabase Auth Configuration

1. In your Supabase project, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### 6. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Game Rules

### Training Mode
- Practice mode with unlimited attempts
- No points earned or penalties
- No minimum class requirement
- Perfect for learning and improving your alumni knowledge

### Ranked Mode
- Competitive mode affecting your leaderboard position
- +1 point for each correct answer
- +1 bonus point for every 3rd consecutive correct answer
- Minimum 6 classes must be selected to ensure fair difficulty
- All scoring handled server-side to prevent cheating

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### Backend
- **Supabase** for database and authentication
- **Next.js API Routes** for game logic
- **Directus CMS** for alumni data
- **PostgreSQL** with Row Level Security

### Security Features
- Server-side game evaluation
- Domain-restricted authentication (@cdtm.com only)
- Row Level Security for data protection
- CSRF protection

## 📊 Database Schema

The application uses a comprehensive schema for tracking:
- **User profiles** with stats and rankings
- **Game sessions** for individual games
- **Detailed answer tracking** for analytics
- **Materialized leaderboard view** for performance

All tables include Row Level Security policies to ensure users can only access their own data.

## 🚀 Deployment

### Recommended: Vercel
1. Connect your GitHub repository to Vercel
2. Set all environment variables in the Vercel dashboard
3. Deploy automatically on every push to main

### Environment Variables for Production
Ensure all variables from `.env.example` are set in your deployment platform.

## 🎯 Future Enhancements

- **Team Competitions**: Class vs class challenges
- **Achievement System**: Badges and milestones  
- **Advanced Analytics**: Detailed performance insights
- **Mobile App**: Native iOS/Android applications
- **Admin Dashboard**: Content management interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with a clear message
5. Push to your branch and create a Pull Request

### Development Tips

Set your CDTM email for commits:
```bash
git config user.email "first.last@cdtm.com"
```

Recommended VS Code extensions:
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 📝 License

This project is private and intended for CDTM internal use only.

---

Built with ❤️ by the CDTM community using [Claude Code](https://claude.ai/code)