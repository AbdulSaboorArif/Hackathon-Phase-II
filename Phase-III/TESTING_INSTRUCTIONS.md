# Phase III Chatbot - Manual Testing Instructions

## ✅ Servers Status

Both servers are now running:
- **Backend**: http://localhost:8000 (FastAPI)
- **Frontend**: http://localhost:3000 (Next.js)

## 🧪 Testing Steps

### Step 1: Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. You should see the login page

### Step 2: Login

1. Enter your credentials (existing user from Phase II)
2. Click "Login"
3. You should be redirected to the dashboard

### Step 3: Verify Chatbot Widget Appears

**Look for the floating chat button in the bottom-right corner:**
- Purple/indigo gradient circular button
- Chat icon (speech bubble)
- Should be visible on the dashboard

**If you don't see it:**
- Check browser console (F12) for errors
- Verify you're logged in (check localStorage.getItem('token'))
- Refresh the page

### Step 4: Open Chat Widget

1. Click the floating chat button
2. Chat window should expand (400px wide, 600px tall)
3. You should see:
   - Header: "AI Assistant"
   - Empty state message
   - Suggestions: "Add buy groceries", "Show my tasks", etc.
   - Input box at the bottom

### Step 5: Test Task Creation

1. Type in the chat: **"Add buy groceries"**
2. Click Send (or press Enter)
3. Expected behavior:
   - Your message appears (blue, right-aligned)
   - Loading indicator shows
   - AI response appears (gray, left-aligned)
   - Response confirms task created

4. **Verify in UI:**
   - Navigate to /tasks page
   - "Buy groceries" should appear in the task list

### Step 6: Test Task Listing

1. In chat, type: **"Show my tasks"**
2. Send message
3. Expected: AI lists all your tasks with numbers
   - Format: "1. Buy groceries (pending)"

### Step 7: Test Task Completion

1. Type: **"Mark task 1 as complete"**
2. Send message
3. Expected: AI confirms task marked complete
4. Verify in /tasks page - task should show as completed

### Step 8: Test Task Deletion

1. Type: **"Delete task 1"**
2. Send message
3. Expected: AI confirms deletion
4. Verify in /tasks page - task should be gone

### Step 9: Test Conversation Persistence

1. Send 2-3 messages
2. Close the chat widget (click X)
3. Refresh the page (F5)
4. Open chat widget again
5. Expected: Previous messages still visible

### Step 10: Test Widget Controls

**Minimize:**
- Click minimize button (down arrow)
- Window collapses to header only
- Click again to expand

**New Conversation:**
- Click "+" button in header
- Messages clear
- New conversation starts

**Close:**
- Click X button
- Widget closes
- Floating button reappears

## 🔍 What to Check

### Browser Console (F12)

**Check for errors:**
- No red errors in console
- Network tab shows successful requests to /api/chat
- JWT token is being sent in Authorization header

**Verify API calls:**
1. Open DevTools → Network tab
2. Send a chat message
3. Look for POST request to `/api/chat`
4. Check:
   - Status: 200 OK
   - Request Headers: Authorization: Bearer <token>
   - Response: Contains conversation_id and response

### Database Verification

**Check conversations table:**
```sql
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;
```

**Check messages table:**
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

**Check tasks created via chat:**
```sql
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5;
```

## ⚠️ Troubleshooting

### Issue: Chat button not appearing

**Solutions:**
1. Check if you're logged in: `localStorage.getItem('token')` in console
2. Check browser console for errors
3. Verify ChatWidget is imported in layout.tsx
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: 401 Unauthorized errors

**Solutions:**
1. Check JWT token exists: `localStorage.getItem('token')`
2. Token might be expired - logout and login again
3. Verify BETTER_AUTH_SECRET matches in backend .env

### Issue: AI not responding

**Solutions:**
1. Check backend logs for errors
2. Verify GEMINI_API_KEY is set in backend/.env
3. Check if Gemini API key is valid
4. Look for errors in backend console

### Issue: Tasks not being created

**Solutions:**
1. Check backend logs for MCP tool errors
2. Verify database connection is working
3. Check if user_id is being passed correctly
4. Look for errors in agent runner

## 📊 Expected Results

✅ Chat widget visible on all authenticated pages
✅ Widget opens/closes/minimizes correctly
✅ Can send messages and receive AI responses
✅ Natural language commands work:
   - "Add buy milk" → Creates task
   - "Show my tasks" → Lists tasks
   - "Mark task 1 complete" → Updates task
   - "Delete task 2" → Removes task
✅ Conversation history persists
✅ JWT authentication working
✅ User isolation enforced

## 🎯 Success Criteria

The integration is successful if:
1. Chatbot widget appears on dashboard, tasks, and profile pages
2. Widget behaves like a banking website assistant
3. Natural language commands create/list/update/delete tasks
4. Tasks appear in both chat and traditional UI
5. Conversation history persists across page refreshes
6. No cross-user data access (test with multiple users)

## 📝 Report Issues

If you encounter any issues, please note:
1. What you were trying to do
2. What happened (error message, unexpected behavior)
3. Browser console errors (F12 → Console tab)
4. Network request details (F12 → Network tab)
5. Backend server logs

## 🚀 Next Steps After Testing

Once testing is complete:
1. Document any bugs found
2. Test with multiple users for isolation
3. Performance testing (response times)
4. Security testing (XSS, SQL injection attempts)
5. Mobile responsiveness testing
