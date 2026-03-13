# Deployment Guide - Todo Full-Stack Web Application

This guide covers deploying the Todo application with Phase III AI chatbot functionality to production environments.

## Prerequisites

- PostgreSQL database (Neon Serverless recommended)
- OpenAI API account with API key
- Node.js 18+ for frontend
- Python 3.11+ for backend
- Domain name (optional, for custom domains)

## Environment Setup

### 1. Database Setup (Neon Serverless PostgreSQL)

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Note: Neon provides automatic connection pooling and serverless scaling

### 2. OpenAI API Setup

1. Create an OpenAI account at https://platform.openai.com
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-`)
5. Ensure your account has sufficient credits

### 3. Better Auth Configuration

1. Generate a secure secret key:
   ```bash
   openssl rand -base64 32
   ```
2. Use the same secret for both frontend and backend

## Backend Deployment

### Option 1: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set DATABASE_URL="postgresql://..."
   railway variables set OPENAI_API_KEY="sk-..."
   railway variables set OPENAI_MODEL="gpt-4o"
   railway variables set BETTER_AUTH_SECRET="your-secret-here"
   railway variables set BACKEND_CORS_ORIGINS="https://your-frontend-domain.com"
   railway variables set LOG_LEVEL="INFO"
   railway variables set ENVIRONMENT="production"
   railway variables set SERVER_HOST="0.0.0.0"
   railway variables set SERVER_PORT="8000"
   ```

4. **Run database migrations:**
   ```bash
   # Connect to your Neon database
   psql $DATABASE_URL -f migrations/001_add_conversation_tables.sql
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get your backend URL:**
   ```bash
   railway domain
   ```

### Option 2: Deploy to Render

1. **Create a new Web Service** on Render dashboard

2. **Connect your repository**

3. **Configure build settings:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`

4. **Set environment variables** in Render dashboard:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `BETTER_AUTH_SECRET`
   - `BACKEND_CORS_ORIGINS`
   - `LOG_LEVEL`
   - `ENVIRONMENT`

5. **Run database migrations** via Render shell or locally:
   ```bash
   psql $DATABASE_URL -f migrations/001_add_conversation_tables.sql
   ```

### Option 3: Deploy to Docker

1. **Create Dockerfile** in backend directory:
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   EXPOSE 8000

   CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and run:**
   ```bash
   docker build -t todo-backend .
   docker run -p 8000:8000 --env-file .env todo-backend
   ```

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Set environment variables** in Vercel dashboard or via CLI:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter your backend URL: https://your-backend.railway.app

   vercel env add BETTER_AUTH_SECRET production
   # Enter the same secret used in backend

   vercel env add NEXT_PUBLIC_ENVIRONMENT production
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables** in Netlify dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_ENVIRONMENT`

### Option 3: Deploy to Docker

1. **Create Dockerfile** in frontend directory:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t todo-frontend .
   docker run -p 3000:3000 --env-file .env.local todo-frontend
   ```

## Database Migration

### Running Migrations

**For Neon Serverless PostgreSQL:**

1. **Get your connection string** from Neon dashboard

2. **Run the migration:**
   ```bash
   psql "postgresql://user:password@host/database" -f backend/migrations/001_add_conversation_tables.sql
   ```

3. **Verify tables were created:**
   ```bash
   psql "postgresql://user:password@host/database" -c "\dt"
   ```

   You should see:
   - `users`
   - `tasks`
   - `conversations` (Phase III)
   - `messages` (Phase III)

### Migration Rollback

If you need to rollback the Phase III migration:

```sql
-- Drop Phase III tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TRIGGER IF EXISTS update_conversation_timestamp ON conversations;
DROP FUNCTION IF EXISTS update_conversation_updated_at();
```

## OpenAI API Key Configuration

### Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days recommended)
4. **Set usage limits** in OpenAI dashboard to prevent unexpected charges
5. **Monitor usage** via OpenAI dashboard

### Cost Management

1. **Set monthly budget** in OpenAI dashboard
2. **Use gpt-4o-mini** for development/testing (cheaper)
3. **Use gpt-4o** for production (better quality)
4. **Monitor token usage** in application logs
5. **Implement rate limiting** to prevent abuse

### Configuration

In backend `.env`:
```env
OPENAI_API_KEY="sk-your-api-key-here"
OPENAI_MODEL="gpt-4o"              # or "gpt-4o-mini" for lower cost
OPENAI_MAX_TOKENS="1000"           # Limit response length
OPENAI_TEMPERATURE="0.7"           # Control randomness (0.0-1.0)
```

## CORS Configuration

Update `BACKEND_CORS_ORIGINS` to include your frontend domain:

```env
BACKEND_CORS_ORIGINS="https://your-frontend.vercel.app,https://your-custom-domain.com"
```

Multiple origins should be comma-separated.

## Health Checks

### Backend Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "openai": "configured"
}
```

### Frontend Health Check

Visit your frontend URL and verify:
- Login page loads
- Can authenticate
- Chat interface accessible at `/chat`
- Can send messages and receive responses

## Monitoring and Logging

### Backend Logs

**Railway:**
```bash
railway logs
```

**Render:**
View logs in Render dashboard

**Docker:**
```bash
docker logs <container-id>
```

### Frontend Logs

**Vercel:**
View logs in Vercel dashboard under Deployments

**Netlify:**
View logs in Netlify dashboard under Deploys

### Key Metrics to Monitor

- API response times
- OpenAI API latency
- Database query performance
- Error rates
- Token usage and costs
- Active user sessions

## Troubleshooting

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check Neon project is active
- Ensure IP allowlist includes your deployment platform

**OpenAI API errors:**
- Verify `OPENAI_API_KEY` is valid
- Check account has sufficient credits
- Ensure model name is correct (gpt-4o, not gpt-4)

**CORS errors:**
- Add frontend domain to `BACKEND_CORS_ORIGINS`
- Ensure no trailing slashes in URLs

### Frontend Issues

**API calls fail:**
- Verify `NEXT_PUBLIC_API_URL` points to backend
- Check backend is running and accessible
- Verify CORS configuration

**Authentication fails:**
- Ensure `BETTER_AUTH_SECRET` matches backend
- Check JWT token is being sent in headers

### Database Issues

**Migrations fail:**
- Check database user has CREATE TABLE permissions
- Verify connection string format
- Ensure database is accessible from your location

**Queries slow:**
- Check indexes are created (migration includes indexes)
- Monitor Neon dashboard for performance metrics
- Consider upgrading Neon plan for more resources

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] `BETTER_AUTH_SECRET` is strong and unique
- [ ] OpenAI API key has usage limits set
- [ ] Database uses SSL connections
- [ ] CORS configured with specific origins (not `*`)
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection protection via SQLModel ORM
- [ ] XSS protection via React's built-in escaping
- [ ] HTTPS enabled on all domains

## Post-Deployment Verification

1. **Test authentication flow:**
   - Sign up new user
   - Log in
   - Verify JWT token in browser storage

2. **Test chat functionality:**
   - Navigate to `/chat`
   - Send message: "Add buy milk to my tasks"
   - Verify task is created
   - Send message: "Show me all my tasks"
   - Verify task list is returned

3. **Test all MCP tools:**
   - Add task
   - List tasks
   - Complete task
   - Update task
   - Delete task

4. **Test conversation persistence:**
   - Send multiple messages
   - Refresh page
   - Verify conversation history loads

5. **Test error handling:**
   - Send invalid requests
   - Verify error messages are user-friendly
   - Check logs for proper error tracking

## Rollback Plan

If deployment fails or issues arise:

1. **Revert to previous version:**
   - Railway: `railway rollback`
   - Vercel: Revert to previous deployment in dashboard
   - Render: Redeploy previous commit

2. **Rollback database migration:**
   ```bash
   psql $DATABASE_URL -f backend/migrations/rollback_001.sql
   ```

3. **Disable Phase III features:**
   - Remove `/chat` route from frontend
   - Disable chat API endpoint in backend
   - Keep Phase II functionality intact

## Support and Resources

- **Neon Documentation:** https://neon.tech/docs
- **OpenAI API Documentation:** https://platform.openai.com/docs
- **Railway Documentation:** https://docs.railway.app
- **Vercel Documentation:** https://vercel.com/docs
- **FastAPI Documentation:** https://fastapi.tiangolo.com
- **Next.js Documentation:** https://nextjs.org/docs

## Maintenance

### Regular Tasks

- **Weekly:** Review OpenAI usage and costs
- **Monthly:** Rotate API keys and secrets
- **Quarterly:** Update dependencies and security patches
- **As needed:** Scale database resources based on usage

### Backup Strategy

1. **Database backups:** Neon provides automatic backups
2. **Code backups:** Use Git version control
3. **Environment variables:** Document in secure location (not in repo)

---

**Deployment Status:** Ready for production
**Last Updated:** 2026-02-28
