# Calendar Application

A full-stack calendar application with user authentication, event management, and multiple view modes (daily, weekly, monthly). Built with React, Express.js, PostgreSQL, and TypeScript.

## Features

- ✅ User registration and login with secure authentication
- ✅ Personal calendar with event management
- ✅ Multiple calendar views (Day, Week, Month)
- ✅ Event creation with categories and color coding
- ✅ Responsive design for mobile and desktop
- ✅ Real-time updates with React Query

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/UI, React Query
- **Backend**: Express.js, TypeScript, Passport.js for authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel (frontend) + Fly.io (backend)

## Quick Start (Development)

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## Deployment

### Frontend (Vercel)

1. Fork this repository
2. Connect to Vercel
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-app.fly.dev`
4. Deploy

### Backend (Fly.io)

1. Install Fly CLI: `https://fly.io/docs/getting-started/installing-flyctl/`
2. Login: `fly auth login`
3. Update `fly.toml` with your app name
4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL=your_postgres_url
   fly secrets set SESSION_SECRET=your_session_secret
   fly secrets set FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy: `fly deploy`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-app.fly.dev
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)

### Events Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `title`
- `startTime`
- `endTime`
- `location` (Optional)
- `type` (meeting, personal, work, health, other)

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `GET /api/events` - Get user events (with date filtering)
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Development

The application uses:
- Session-based authentication with PostgreSQL store
- Secure password hashing with scrypt
- CORS configuration for production deployment
- Real-time data synchronization with React Query
- Mobile-responsive design with TailwindCSS

## Production Notes

- The backend includes CORS configuration for production
- Frontend uses environment variables for API URL configuration
- Database migrations are handled by Drizzle Kit
- Session store uses PostgreSQL for persistence