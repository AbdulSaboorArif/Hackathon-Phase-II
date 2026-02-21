# Deployment Guide - Todo Full-Stack Web Application

## Overview
This guide covers deploying the Todo application with:
- **Frontend**: Next.js on Vercel
- **Backend**: FastAPI on Hugging Face Spaces
- **Database**: Neon Serverless PostgreSQL

---

## 🔧 Prerequisites

1. **Accounts Required**:
   - Vercel account (for frontend)
   - Hugging Face account (for backend)
   - Neon account (for database)
   - GitHub account (for repository)

2. **Local Setup Working**:
   - Ensure the app runs locally before deploying
   - Test login, task creation, and all features

---

## 📦 Backend Deployment (Hugging Face Spaces)

### Step 1: Prepare Backend for Deployment

1. **Verify `requirements.txt`** exists in `backend/` directory
2. **Create `app.py`** in the root of `backend/` folder:

```python
# backend/app.py
import sys
import os

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

3. **Create `Dockerfile`** in `backend/` folder:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 7860

# Run the application
CMD ["python", "app.py"]
```

### Step 2: Set Environment Variables on HF Spaces

Go to your Space settings and add these secrets:

```bash
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=your-production-secret-key-change-this
JWT_SECRET=your-production-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=10080
BACKEND_CORS_ORIGINS=https://hackathon-phase-ii-alpha.vercel.app,http://localhost:3000
LOG_LEVEL=INFO
ENVIRONMENT=production
```

**IMPORTANT**:
- Use strong, unique secrets for production (not the example values)
- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon
- Add your actual Vercel URL to `BACKEND_CORS_ORIGINS`

### Step 3: Deploy to HF Spaces

1. Push backend code to GitHub
2. Create new Space on Hugging Face
3. Select "Docker" as SDK
4. Connect your GitHub repository
5. Set the subdirectory to `backend/`
6. Add environment variables in Space settings
7. Deploy and wait for build to complete

### Step 4: Verify Backend Deployment

Test these endpoints:
```bash
# Health check
curl https://abdul-saboor-todo-web-application.hf.space/

# API docs
https://abdul-saboor-todo-web-application.hf.space/api/docs

# Test registration
curl -X POST https://abdul-saboor-todo-web-application.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Set Environment Variables on Vercel

In your Vercel project settings, add:

```bash
NEXT_PUBLIC_API_URL=https://abdul-saboor-todo-web-application.hf.space/api
NEXT_PUBLIC_ENVIRONMENT=production
```

**CRITICAL**: The URL must include `/api` at the end!

### Step 2: Deploy to Vercel

1. Push frontend code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend/`
4. Add environment variables
5. Deploy

### Step 3: Update CORS After First Deploy

After getting your Vercel URL, update backend CORS:

1. Go to HF Spaces settings
2. Update `BACKEND_CORS_ORIGINS` to include your Vercel URL:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
3. Restart the Space

---

## 🗄️ Database Setup (Neon)

### Step 1: Create Neon Database

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string

### Step 2: Initialize Database Tables

The backend automatically creates tables on startup via the `startup_event` in `main.py`.

To manually verify/initialize:

```python
# Run this locally with production DATABASE_URL
from backend.src.database import init_db
init_db()
```

Or use the provided script:
```bash
cd backend
python -c "from src.database import init_db; init_db()"
```

---

## 🔍 Troubleshooting

### Issue: 404 Not Found on `/auth/login`

**Cause**: Frontend not using `/api` prefix

**Fix**:
- Verify `NEXT_PUBLIC_API_URL` on Vercel includes `/api`
- Check `frontend/src/services/api.ts` has correct fallback URL

### Issue: 500 Internal Server Error on Login

**Causes**:
1. Database tables not initialized
2. Wrong DATABASE_URL
3. Database connection timeout

**Fixes**:
1. Check HF Spaces logs for database errors
2. Verify DATABASE_URL includes `?sslmode=require`
3. Test database connection:
   ```python
   from src.database import test_connection
   print(test_connection())
   ```

### Issue: CORS Errors

**Cause**: Frontend URL not in CORS allowed origins

**Fix**: Add your Vercel URL to `BACKEND_CORS_ORIGINS` on HF Spaces

### Issue: JWT Token Not Working

**Causes**:
1. `BETTER_AUTH_SECRET` mismatch between frontend and backend
2. Token not being sent in requests

**Fixes**:
1. Ensure same secret on both deployments
2. Check browser DevTools → Network → Request Headers for `Authorization: Bearer ...`

---

## ✅ Post-Deployment Checklist

- [ ] Backend health endpoint returns 200: `https://your-backend.hf.space/`
- [ ] API docs accessible: `https://your-backend.hf.space/api/docs`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works and redirects to dashboard
- [ ] Tasks can be created
- [ ] Tasks can be viewed
- [ ] Tasks can be updated
- [ ] Tasks can be deleted
- [ ] User isolation works (users only see their own tasks)
- [ ] Logout works

---

## 🔐 Security Recommendations

1. **Change Default Secrets**: Never use example secrets in production
2. **Use Strong Passwords**: Generate secrets with:
   ```bash
   openssl rand -hex 32
   ```
3. **Enable HTTPS Only**: Ensure all URLs use `https://`
4. **Rotate Secrets Regularly**: Update JWT secrets periodically
5. **Monitor Logs**: Check HF Spaces and Vercel logs for suspicious activity

---

## 📊 Monitoring

### Backend Logs (HF Spaces)
- View logs in Space settings → Logs tab
- Look for database connection errors
- Monitor API request errors

### Frontend Logs (Vercel)
- View logs in Vercel dashboard → Deployments → Function Logs
- Check browser console for client-side errors

### Database Monitoring (Neon)
- Monitor connection count in Neon dashboard
- Check query performance
- Set up alerts for connection limits

---

## 🚀 Performance Optimization

1. **Database Connection Pooling**: Already configured in `database.py`
2. **Neon Connection Settings**: Optimized for serverless with short recycling
3. **Frontend Caching**: Next.js automatically optimizes static assets
4. **API Response Caching**: Consider adding Redis for frequently accessed data

---

## 📝 Environment Variables Reference

### Frontend (Vercel)
| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://backend.hf.space/api` |
| `NEXT_PUBLIC_ENVIRONMENT` | No | `production` |

### Backend (HF Spaces)
| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Yes | `your-secret-key` |
| `JWT_SECRET` | Yes | `your-secret-key` |
| `JWT_ALGORITHM` | No | `HS256` |
| `JWT_EXPIRES_MINUTES` | No | `10080` (7 days) |
| `BACKEND_CORS_ORIGINS` | Yes | `https://frontend.vercel.app` |
| `ENVIRONMENT` | No | `production` |
| `LOG_LEVEL` | No | `INFO` |

---

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review HF Spaces and Vercel logs
3. Test endpoints individually with curl/Postman
4. Verify environment variables are set correctly
5. Ensure database is accessible from HF Spaces

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Neon Documentation](https://neon.tech/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
