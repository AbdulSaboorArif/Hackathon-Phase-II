# Quickstart Guide: AI-Powered Todo Chatbot

**Feature**: 001-ai-chatbot-mcp
**Date**: 2026-02-28
**Status**: Phase 1 Design
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md) | [data-model.md](./data-model.md)

## Overview

This guide helps developers set up and run the AI-powered todo chatbot feature locally. Follow these steps to get the chat interface working with OpenAI Agents SDK and MCP tools.

**Prerequisites**:
- Phase II todo application already running
- OpenAI API key with access to GPT-4
- Python 3.11+ and Node.js 18+
- PostgreSQL database (Neon or local)

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Migration](#database-migration)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)

---

## 1. Environment Setup

### 1.1 Obtain OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-proj-...`)

**Important**: Never commit this key to git!

### 1.2 Update Backend Environment Variables

Edit `backend/.env`:

```bash
# Existing Phase II variables
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256

# NEW: Phase III variables
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4
MCP_SERVER_ENABLED=true
```

### 1.3 Update Frontend Environment Variables

Edit `frontend/.env.local`:

```bash
# Existing Phase II variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# NEW: Phase III variables (if needed)
NEXT_PUBLIC_CHAT_ENABLED=true
```

---

## 2. Database Migration

### 2.1 Create Migration File

Create `backend/migrations/001_add_conversation_tables.sql`:

```sql
-- Migration: Add conversation and message tables
-- Date: 2026-02-28
-- Feature: 001-ai-chatbot-mcp

BEGIN;

-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT conversations_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT messages_conversation_id_fkey
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT messages_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

COMMIT;
```

### 2.2 Run Migration

**Option A: Using psql (Neon or local PostgreSQL)**:
```bash
cd backend
psql $DATABASE_URL -f migrations/001_add_conversation_tables.sql
```

**Option B: Using Python script**:
```bash
cd backend
python -m scripts.run_migration migrations/001_add_conversation_tables.sql
```

### 2.3 Verify Migration

```bash
psql $DATABASE_URL -c "\dt"
```

Expected output should include:
- `conversations`
- `messages`
- `tasks` (existing)
- `users` (existing)

---

## 3. Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
pip install openai mcp pydantic-settings
```

**Required packages**:
- `openai>=1.0.0` - OpenAI Agents SDK
- `mcp>=0.1.0` - Model Context Protocol SDK
- `pydantic-settings>=2.0.0` - Settings management

### 3.2 Create SQLModel Models

Create `backend/src/models/conversation.py`:

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=20)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    conversation: Optional[Conversation] = Relationship(back_populates="messages")
```

### 3.3 Create MCP Server

Create `backend/src/mcp/server.py` and `backend/src/mcp/tools.py` (see [mcp-tools.yaml](./contracts/mcp-tools.yaml) for full implementation).

### 3.4 Create Chat Endpoint

Create `backend/src/routes/chat.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..middleware.auth import get_current_user_id
from ..database import get_db
from ..models.conversation import Conversation, Message
from ..agent.runner import run_agent_with_tools

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Validate conversation ownership
    conversation = db.get(Conversation, request.conversation_id)
    if not conversation or conversation.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch conversation history
    statement = select(Message).where(
        Message.conversation_id == request.conversation_id,
        Message.user_id == current_user_id
    ).order_by(Message.created_at)
    messages = list(db.exec(statement).all())

    # Build message context
    message_context = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
    message_context.append({"role": "user", "content": request.message})

    # Store user message
    user_msg = Message(
        conversation_id=request.conversation_id,
        user_id=current_user_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # Run agent
    response = await run_agent_with_tools(message_context, current_user_id)

    # Store assistant response
    assistant_msg = Message(
        conversation_id=request.conversation_id,
        user_id=current_user_id,
        role="assistant",
        content=response
    )
    db.add(assistant_msg)
    db.commit()

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    db.add(conversation)
    db.commit()

    return {
        "response": response,
        "conversation_id": request.conversation_id,
        "message_id": assistant_msg.id
    }
```

### 3.5 Register Routes

Update `backend/src/main.py`:

```python
from fastapi import FastAPI
from .routes import tasks, auth, chat  # Add chat

app = FastAPI()

# Register routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(chat.router, prefix="/api", tags=["chat"])  # NEW
```

### 3.6 Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

Verify server is running:
```bash
curl http://localhost:8000/health
```

---

## 4. Frontend Setup

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

No additional dependencies needed for Phase 1 (custom UI approach).

### 4.2 Create Chat API Client

Update `frontend/src/services/api.ts`:

```typescript
export const chatAPI = {
  async sendMessage(conversationId: number, message: string) {
    return api.post('/chat', {
      conversation_id: conversationId,
      message: message
    });
  },

  async listConversations() {
    return api.get('/conversations');
  },

  async createConversation() {
    return api.post('/conversations', {});
  },

  async getConversationMessages(conversationId: number) {
    return api.get(`/conversations/${conversationId}/messages`);
  },

  async deleteConversation(conversationId: number) {
    return api.delete(`/conversations/${conversationId}`);
  }
};
```

### 4.3 Create Chat Interface Component

Create `frontend/src/components/ChatInterface.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { chatAPI } from '@/services/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function ChatInterface() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Create new conversation on mount
    const initConversation = async () => {
      const conv = await chatAPI.createConversation();
      setConversationId(conv.id);
    };
    initConversation();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    setIsLoading(true);
    const userMessage = input;
    setInput('');

    // Optimistic update
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }]);

    try {
      const response = await chatAPI.sendMessage(conversationId, userMessage);

      // Add assistant response
      setMessages(prev => [...prev, {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <p className="text-sm">Typing...</p>
          </div>
        )}
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-lg"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### 4.4 Create Chat Page

Create `frontend/src/app/chat/page.tsx`:

```typescript
import { ChatInterface } from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      <ChatInterface />
    </div>
  );
}
```

### 4.5 Add Navigation Link

Update `frontend/src/app/layout.tsx` or navigation component:

```typescript
<nav>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/tasks">Tasks</Link>
  <Link href="/chat">Chat</Link>  {/* NEW */}
</nav>
```

### 4.6 Start Frontend Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000/chat

---

## 5. Testing the Integration

### 5.1 Manual Testing Flow

1. **Login**: Go to http://localhost:3000/login and sign in
2. **Navigate to Chat**: Click "Chat" in navigation
3. **Test Commands**:

```
You: Add buy milk to my tasks
Assistant: I've added 'Buy milk' to your task list!

You: Show me all my tasks
Assistant: You have 1 task:
1. Buy milk (incomplete)

You: Mark task 1 as complete
Assistant: Great! I've marked 'Buy milk' as complete.

You: Delete the milk task
Assistant: I've deleted the task 'Buy milk' from your list.
```

### 5.2 Verify Database

```bash
psql $DATABASE_URL

-- Check conversations
SELECT * FROM conversations;

-- Check messages
SELECT * FROM messages ORDER BY created_at;

-- Check tasks
SELECT * FROM tasks;
```

### 5.3 Check Backend Logs

```bash
# Backend terminal should show:
INFO: POST /api/chat - 200 OK
INFO: MCP tool invoked: add_task
INFO: MCP tool invoked: list_tasks
```

---

## 6. Troubleshooting

### Issue: "Invalid token" error

**Cause**: JWT token expired or invalid

**Solution**:
1. Log out and log back in
2. Check `BETTER_AUTH_SECRET` matches between frontend and backend
3. Verify token in browser localStorage

```javascript
// In browser console
localStorage.getItem('token')
```

### Issue: "OpenAI API error"

**Cause**: Invalid API key or rate limit

**Solution**:
1. Verify `OPENAI_API_KEY` in backend/.env
2. Check OpenAI dashboard for API key status
3. Verify account has credits

```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: "Conversation not found"

**Cause**: Conversation doesn't exist or user doesn't own it

**Solution**:
1. Create new conversation via frontend
2. Check database for conversation ownership

```sql
SELECT * FROM conversations WHERE user_id = YOUR_USER_ID;
```

### Issue: "Database connection error"

**Cause**: Invalid DATABASE_URL or database not running

**Solution**:
1. Verify DATABASE_URL in backend/.env
2. Test connection:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: MCP tools not working

**Cause**: Tools not registered or user_id not passed

**Solution**:
1. Check MCP server initialization in logs
2. Verify user_id is passed to tools
3. Add debug logging:

```python
# In mcp/tools.py
import logging
logger = logging.getLogger(__name__)

async def add_task(user_id: int, title: str, description: Optional[str] = None):
    logger.info(f"add_task called: user_id={user_id}, title={title}")
    # ... rest of implementation
```

### Issue: Frontend not showing messages

**Cause**: CORS error or API endpoint mismatch

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` in frontend/.env.local
3. Add CORS middleware to backend:

```python
# backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Development Tips

### 7.1 Hot Reload

Both servers support hot reload:
- **Backend**: `uvicorn --reload` automatically restarts on code changes
- **Frontend**: `npm run dev` automatically rebuilds on code changes

### 7.2 Debugging

**Backend debugging**:
```python
import pdb; pdb.set_trace()  # Add breakpoint
```

**Frontend debugging**:
```typescript
console.log('Debug:', variable);  // Browser console
debugger;  // Browser debugger
```

### 7.3 Database Inspection

```bash
# Connect to database
psql $DATABASE_URL

# Useful queries
\dt                                    # List tables
\d conversations                       # Describe table
SELECT * FROM messages LIMIT 10;       # View recent messages
```

### 7.4 API Testing with curl

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Create conversation
CONV_ID=$(curl -X POST http://localhost:8000/api/conversations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.id')

# Send message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversation_id\":$CONV_ID,\"message\":\"Add buy milk\"}"
```

---

## 8. Next Steps

After completing this quickstart:

1. **Run Tests**: Execute unit and integration tests
2. **Review Code**: Check implementation against spec
3. **Performance Testing**: Test with multiple concurrent users
4. **Security Audit**: Verify JWT validation and user isolation
5. **Documentation**: Update API docs with new endpoints

---

## 9. Additional Resources

- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/agents)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)

---

## 10. Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [spec.md](./spec.md) and [plan.md](./plan.md)
3. Check backend logs for error details
4. Verify all environment variables are set correctly

---

**Quickstart Status**: ✅ Complete
**Ready for Implementation**: Yes
**Estimated Setup Time**: 30-45 minutes
