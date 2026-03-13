# Troubleshooting Guide - Todo Full-Stack Web Application

This guide covers common issues and their solutions for both Phase II (core functionality) and Phase III (AI chatbot).

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [Phase III - Chatbot Issues](#phase-iii---chatbot-issues)
6. [Deployment Issues](#deployment-issues)
7. [Performance Issues](#performance-issues)

---

## Backend Issues

### Server Won't Start

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
cd backend
uv sync
```

---

**Error:**
```
uvicorn: command not found
```

**Cause:** Uvicorn not in PATH or not installed

**Solution:**
```bash
uv run uvicorn src.main:app --reload
```

---

### Port Already in Use

**Error:**
```
ERROR: [Errno 48] Address already in use
```

**Cause:** Port 8000 is already occupied

**Solution:**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uv run uvicorn src.main:app --reload --port 8001
```

---

### Import Errors

**Error:**
```
ImportError: attempted relative import with no known parent package
```

**Cause:** Running Python files directly instead of as a module

**Solution:**
```bash
# Don't run: python src/main.py
# Instead run:
uv run uvicorn src.main:app --reload
```

---

## Frontend Issues

### Dependencies Won't Install

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Cause:** Conflicting package versions

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Or use --legacy-peer-deps
npm install --legacy-peer-deps
```

---

### Page Not Found (404)

**Error:**
```
404 | This page could not be found
```

**Cause:** Incorrect route or missing page file

**Solution:**
1. Verify the route exists in `app/` directory
2. Check file naming (must be `page.tsx` for routes)
3. Restart dev server: `npm run dev`

---

### API Calls Fail

**Error:**
```
Network Error
```

**Cause:** Backend not running or incorrect API URL

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Ensure no trailing slash in API URL

---

### CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:8000/api/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** Backend CORS not configured for frontend origin

**Solution:**
```env
# In backend/.env
BACKEND_CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
```

Restart backend after changing environment variables.

---

## Database Issues

### Connection Refused

**Error:**
```
sqlalchemy.exc.OperationalError: could not connect to server: Connection refused
```

**Cause:** Database not running or incorrect connection string

**Solution:**
1. Verify `DATABASE_URL` in `.env`
2. For Neon: Check project is active in dashboard
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

---

### Authentication Failed

**Error:**
```
FATAL: password authentication failed for user "postgres"
```

**Cause:** Incorrect database credentials

**Solution:**
1. Verify username and password in `DATABASE_URL`
2. For Neon: Copy connection string from dashboard
3. Ensure no special characters need URL encoding

---

### Table Does Not Exist

**Error:**
```
sqlalchemy.exc.ProgrammingError: relation "tasks" does not exist
```

**Cause:** Database migrations not run

**Solution:**
```bash
# Run Phase II migrations (if not done)
psql $DATABASE_URL -f backend/migrations/create_tables.sql

# Run Phase III migrations
psql $DATABASE_URL -f backend/migrations/001_add_conversation_tables.sql
```

---

### Migration Fails

**Error:**
```
ERROR: relation "conversations" already exists
```

**Cause:** Migration already run or partial migration

**Solution:**
```bash
# Check existing tables
psql $DATABASE_URL -c "\dt"

# If tables exist, skip migration or drop and recreate
psql $DATABASE_URL -c "DROP TABLE IF EXISTS messages CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS conversations CASCADE;"
psql $DATABASE_URL -f backend/migrations/001_add_conversation_tables.sql
```

---

## Authentication Issues

### JWT Token Invalid

**Error:**
```
401 Unauthorized: Invalid token
```

**Cause:** Token expired or `BETTER_AUTH_SECRET` mismatch

**Solution:**
1. Verify `BETTER_AUTH_SECRET` matches in frontend and backend
2. Clear browser storage and log in again
3. Check token expiration settings

---

### Login Fails

**Error:**
```
400 Bad Request: Invalid credentials
```

**Cause:** Incorrect email/password or user doesn't exist

**Solution:**
1. Verify user exists in database: `SELECT * FROM users WHERE email = 'user@example.com';`
2. Try password reset flow
3. Check password hashing is working correctly

---

### Session Expires Immediately

**Cause:** `BETTER_AUTH_SECRET` not set or changing between requests

**Solution:**
```env
# Ensure this is set and consistent
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

Never change this value in production without migrating existing sessions.

---

## Phase III - Chatbot Issues

### OpenAI API Errors

**Error:**
```
openai.error.AuthenticationError: Incorrect API key provided
```

**Cause:** Invalid or missing OpenAI API key

**Solution:**
1. Verify `OPENAI_API_KEY` in backend `.env`
2. Check key starts with `sk-`
3. Verify key is active in OpenAI dashboard
4. Ensure no extra spaces or quotes in `.env` file

---

**Error:**
```
openai.error.RateLimitError: You exceeded your current quota
```

**Cause:** OpenAI account has insufficient credits

**Solution:**
1. Add credits to OpenAI account
2. Check usage in OpenAI dashboard
3. Set usage limits to prevent unexpected charges
4. Consider using `gpt-4o-mini` for development (cheaper)

---

**Error:**
```
openai.error.InvalidRequestError: The model 'gpt-4' does not exist
```

**Cause:** Incorrect model name

**Solution:**
```env
# Use correct model name
OPENAI_MODEL="gpt-4o"  # Not "gpt-4"
```

Valid models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`

---

### Chat Not Responding

**Symptom:** Message sent but no response received

**Possible Causes:**
1. OpenAI API timeout
2. Database connection lost
3. Agent configuration error

**Solution:**
```bash
# Check backend logs
tail -f backend/logs/app.log

# Look for errors in agent execution
grep "ERROR" backend/logs/app.log | tail -20

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### MCP Tools Not Working

**Error:**
```
Tool execution failed: add_task
```

**Cause:** Tool not registered or database error

**Solution:**
1. Verify tools are registered in `src/mcp/server.py`
2. Check database connection
3. Verify user_id is being passed correctly
4. Check logs for specific error:
   ```bash
   grep "add_task" backend/logs/app.log
   ```

---

### Conversation Not Persisting

**Symptom:** Messages disappear after page refresh

**Possible Causes:**
1. Database tables not created
2. Conversation ID not being tracked
3. Frontend not loading history

**Solution:**
```bash
# Verify tables exist
psql $DATABASE_URL -c "\dt"

# Check for conversations
psql $DATABASE_URL -c "SELECT * FROM conversations LIMIT 5;"

# Check for messages
psql $DATABASE_URL -c "SELECT * FROM messages LIMIT 5;"

# Verify frontend is sending conversation_id
# Check browser console for API requests
```

---

### Agent Calls Wrong Tool

**Symptom:** Agent uses incorrect tool for user request

**Cause:** System prompt not clear or ambiguous user input

**Solution:**
1. Review system prompt in `src/agent/config.py`
2. Add more examples to system prompt
3. Adjust `OPENAI_TEMPERATURE` (lower = more deterministic)
4. Provide clearer user instructions

---

## Deployment Issues

### Environment Variables Not Loading

**Symptom:** App works locally but fails in production

**Cause:** Environment variables not set in deployment platform

**Solution:**

**Railway:**
```bash
railway variables set OPENAI_API_KEY="sk-..."
railway variables set DATABASE_URL="postgresql://..."
```

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
```

**Render:**
Set variables in Render dashboard under Environment

---

### Database Connection Fails in Production

**Error:**
```
SSL connection required
```

**Cause:** Neon requires SSL connections

**Solution:**
```env
# Add SSL mode to connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

---

### CORS Errors in Production

**Error:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Cause:** Production frontend URL not in CORS origins

**Solution:**
```env
# Add production URL to CORS origins
BACKEND_CORS_ORIGINS="https://your-app.vercel.app,https://your-custom-domain.com"
```

---

### Build Fails

**Error:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Cause:** TypeScript errors in frontend

**Solution:**
```bash
# Run type check locally
npm run build

# Fix type errors
# Then commit and redeploy
```

---

## Performance Issues

### Slow API Response

**Symptom:** API requests take >2 seconds

**Possible Causes:**
1. Database queries not optimized
2. Missing indexes
3. N+1 query problem
4. OpenAI API latency

**Solution:**
```bash
# Check database query performance
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'user123';"

# Verify indexes exist
psql $DATABASE_URL -c "\d tasks"

# Monitor OpenAI API latency in logs
grep "openai" backend/logs/app.log | grep "duration"
```

---

### High OpenAI Costs

**Symptom:** Unexpected high API costs

**Cause:** Too many tokens per request or high request volume

**Solution:**
1. Reduce `OPENAI_MAX_TOKENS` in `.env`
2. Limit conversation history length
3. Use `gpt-4o-mini` instead of `gpt-4o`
4. Implement rate limiting
5. Set usage alerts in OpenAI dashboard

---

### Memory Leaks

**Symptom:** Backend memory usage grows over time

**Possible Causes:**
1. Database connections not closed
2. Large conversation histories in memory
3. Logging too verbose

**Solution:**
1. Verify database sessions are closed properly
2. Implement conversation history limits
3. Reduce log level in production: `LOG_LEVEL="WARNING"`
4. Monitor memory: `docker stats` or platform dashboard

---

## Debugging Tips

### Enable Debug Logging

**Backend:**
```env
LOG_LEVEL="DEBUG"
```

**Frontend:**
```env
NEXT_PUBLIC_ENABLE_DEBUG="true"
```

---

### Check API Health

```bash
# Backend health check
curl http://localhost:8000/health

# Check specific endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

### Inspect Database

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Check table structure
\d tasks
\d conversations
\d messages

# Query data
SELECT * FROM tasks WHERE user_id = 'user123';
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;
SELECT * FROM messages WHERE conversation_id = 1;
```

---

### Monitor Logs

**Backend:**
```bash
# Development
tail -f backend/logs/app.log

# Production (Railway)
railway logs --tail

# Production (Render)
# View in Render dashboard
```

**Frontend:**
```bash
# Development
# Check browser console (F12)

# Production (Vercel)
# View in Vercel dashboard under Deployments
```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs** for specific error messages
2. **Search GitHub issues** for similar problems
3. **Review documentation**:
   - Backend README: `backend/README.md`
   - Frontend README: `frontend/README.md`
   - MCP Tools: `backend/src/mcp/README.md`
   - Deployment Guide: `docs/deployment.md`
4. **Create a GitHub issue** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (OS, versions)
   - Relevant logs

---

## Common Fixes Checklist

When something isn't working, try these in order:

- [ ] Restart backend server
- [ ] Restart frontend dev server
- [ ] Clear browser cache and storage
- [ ] Verify all environment variables are set
- [ ] Check database connection
- [ ] Run database migrations
- [ ] Verify OpenAI API key is valid
- [ ] Check logs for specific errors
- [ ] Test API endpoints with curl
- [ ] Verify CORS configuration
- [ ] Check network connectivity
- [ ] Review recent code changes

---

**Last Updated:** 2026-02-28
**Version:** 1.0.0
