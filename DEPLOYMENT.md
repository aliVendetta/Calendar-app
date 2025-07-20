# Calendar Application - Setup & Deployment Guide

This comprehensive guide covers running the application locally and deploying to production with frontend on Vercel and backend on Fly.io.

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd calendar-app
npm install
```

### 2. Database Setup
You have two options for the database:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb calendar_app`
3. Set DATABASE_URL in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/calendar_app"
SESSION_SECRET="your-super-secret-session-key-for-local-dev"
```

#### Option B: Cloud Database (Recommended)
Use Neon Database (free tier):
1. Go to [neon.tech](https://neon.tech) and create account
2. Create a new project 
3. Copy the connection string
4. Set in `.env`:
```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="your-super-secret-session-key-for-local-dev"
```

### 3. Initialize Database
```bash
npm run db:push
```
This creates all the necessary tables (users, events, sessions).

### 4. Start Development Server
```bash
npm run dev
```
This starts both frontend (port 5000) and backend on the same port.

### 5. Test the Application
- Open http://localhost:5000
- Create a new account 
- Login and test calendar functionality
- Add some events to verify everything works

## 📦 Production Deployment

### Prerequisites for Deployment

- Git repository with your code on GitHub
- Vercel account (free at vercel.com)
- Fly.io account (free tier at fly.io)
- PostgreSQL database (Neon Database recommended)

## Step 1: Setup Database (Production)

### Option A: Neon Database (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech) and create account
2. Create a new project named "calendar-app"
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this - you'll need it for both Fly.io and local development

### Option B: Fly.io PostgreSQL
```bash
# After setting up Fly.io app (see Step 3)
fly postgres create --name calendar-db
fly postgres attach --app your-calendar-backend calendar-db
```

## Step 2: Deploy Backend to Fly.io

### Install Fly CLI
```bash
# macOS
brew install flyctl

# Windows
iwr https://fly.io/install.ps1 -useb | iex

# Linux
curl -L https://fly.io/install.sh | sh
```

### Login and Initialize
```bash
fly auth login
fly launch --no-deploy
```

Choose:
- App name: `your-calendar-backend` (must be unique)
- Region: Choose closest to your users
- PostgreSQL: **No** (if using Neon) or **Yes** (if using Fly.io Postgres)

### Configure fly.toml
Your `fly.toml` should look like this:
```toml
app = "your-calendar-backend"
primary_region = "dfw"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[deploy]
  release_command = "npm run db:push"
```

### Set Environment Secrets
```bash
# Database connection (use your Neon or Fly.io PostgreSQL URL)
fly secrets set DATABASE_URL="postgresql://username:password@hostname:port/database"

# Session secret (generate a secure random string)
fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"

# We'll set FRONTEND_URL after Vercel deployment
```

### Deploy Backend
```bash
fly deploy
```

Your backend will be available at: `https://your-calendar-backend.fly.dev`

## Step 3: Deploy Frontend to Vercel

### Option A: Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Set Environment Variables in Vercel
In your Vercel project settings → Environment Variables, add:
```
VITE_API_URL=https://your-calendar-backend.fly.dev
```

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 4: Connect Frontend and Backend

### Update Backend CORS Settings
Add your Vercel domain to the backend. You need to set this secret:
```bash
fly secrets set FRONTEND_URL="https://your-calendar-app.vercel.app"
```

### Redeploy Both Services
```bash
# Redeploy backend with new CORS settings
fly deploy

# Redeploy frontend (in Vercel dashboard or via CLI)
vercel --prod
```

## 🧪 Testing Your Deployment

1. Visit your Vercel app URL: `https://your-calendar-app.vercel.app`
2. Create a new account (register)
3. Login with your credentials
4. Test calendar functionality:
   - Switch between daily, weekly, monthly views
   - Add events with different types
   - Verify events display correctly
   - Test multiple events per day
5. Check that data persists after logout/login

## 🔧 Environment Variables Summary

### Local Development (.env file)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/calendar_app"
SESSION_SECRET="your-super-secret-session-key-for-local-dev"
NODE_ENV="development"
```

### Fly.io Secrets (Backend)
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"
fly secrets set FRONTEND_URL="https://your-calendar-app.vercel.app"
```

### Vercel Environment Variables (Frontend)
```
VITE_API_URL=https://your-calendar-backend.fly.dev
```

## 🚀 Quick Deploy Commands

### For Local Development
```bash
# Clone and setup
git clone <your-repo>
cd calendar-app
npm install

# Setup database (use Neon for easy setup)
echo 'DATABASE_URL="your-neon-connection-string"' > .env
echo 'SESSION_SECRET="local-dev-secret"' >> .env

# Initialize database and start
npm run db:push
npm run dev
```

### For Production Deploy
```bash
# Deploy backend to Fly.io
fly launch --no-deploy
fly secrets set DATABASE_URL="your-production-db-url"
fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"
fly deploy

# Deploy frontend to Vercel (via GitHub)
# 1. Push code to GitHub
# 2. Connect repository in Vercel dashboard
# 3. Set VITE_API_URL environment variable
# 4. Deploy automatically

# Connect them
fly secrets set FRONTEND_URL="https://your-vercel-app.vercel.app"
fly deploy
```

## Testing Your Deployment

1. Visit your Vercel app URL
2. Create a new account
3. Login and test calendar functionality
4. Add some events to verify everything works

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` is set correctly in Fly.io secrets
- Check that the Vercel domain matches in the CORS configuration

**Database Connection Issues**
- Verify `DATABASE_URL` is correct in Fly.io secrets
- Ensure your database allows connections from Fly.io

**Environment Variables Not Working**
- Check that all secrets are set: `fly secrets list`
- Ensure Vercel environment variables are set and deployed

### Helpful Commands

```bash
# View Fly.io logs
fly logs

# Check Fly.io app status
fly status

# View secrets
fly secrets list

# SSH into Fly.io app
fly ssh console

# Restart Fly.io app
fly restart
```

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Fly.io
- [ ] Database connected and migrations run
- [ ] Environment variables configured
- [ ] CORS configured for your domains
- [ ] SSL certificates working (automatic with both platforms)
- [ ] User registration and login working
- [ ] Calendar functionality tested
- [ ] Mobile responsiveness verified

## Monitoring

- **Vercel**: Built-in analytics and error tracking
- **Fly.io**: Use `fly logs` and `fly status` for monitoring
- **Database**: Monitor your PostgreSQL provider's dashboard

Your calendar application should now be fully deployed and accessible to users!