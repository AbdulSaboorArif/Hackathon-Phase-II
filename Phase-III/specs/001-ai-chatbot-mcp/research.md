# Research: MCP Server Implementation & ChatKit Integration

**Feature**: AI-Powered Todo Chatbot (001-ai-chatbot-mcp)
**Date**: 2026-02-28
**Status**: Phase 0 Research Complete
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Executive Summary

This research document provides comprehensive implementation guidance for building an AI-powered todo chatbot using the Model Context Protocol (MCP) and OpenAI's Responses API. It covers MCP server architecture, tool registration, stateless design patterns, database integration, and frontend integration strategies.

**Key Findings**:
- **MCP Architecture**: FastMCP provides high-level Python SDK for stateless MCP servers with automatic schema generation
- **Tool Registration**: Simple decorator-based pattern with type inference and Pydantic validation
- **OpenAI Integration**: OpenAI Responses API (not Agents SDK) supports MCP servers for tool calling
- **Stateless Design**: All conversation state persists to database; server holds no state between requests
- **Database Integration**: FastMCP supports dependency injection for database sessions via Context
- **Authentication**: JWT bearer tokens passed via HTTP headers; tools access user context through token claims
- **Existing Patterns**: Phase II JWT authentication is fully compatible with MCP server requirements

---

## Part I: MCP Server Architecture & Implementation

### 1. MCP Server Architecture Overview

#### 1.1 Official MCP SDK Overview

The Model Context Protocol (MCP) is an open-source standard for connecting AI applications to external systems. It follows a client-server architecture where:

- **MCP Host**: AI application (e.g., Claude Code, OpenAI Responses API)
- **MCP Client**: Component that maintains connection to MCP server
- **MCP Server**: Program that provides context (tools, resources, prompts) to clients

**Key Architectural Principles**:
- Stateless by design (with HTTP transport)
- JSON-RPC 2.0 based protocol
- Capability negotiation during initialization
- Real-time notifications for dynamic updates

#### 1.2 FastMCP Framework

FastMCP is a high-level Python framework built on the official MCP SDK that simplifies server creation:

```python
from fastmcp import FastMCP

mcp = FastMCP(
    name="TodoMCPServer",
    instructions="Provides task management tools for todo operations"
)
```

**Key Features**:
- Automatic schema generation from type hints
- Built-in validation using Pydantic
- Support for both sync and async functions
- Dependency injection via Context
- Multiple transport options (STDIO, HTTP)

#### 1.3 Transport Options

**STDIO Transport** (default):
- Local process communication
- Used by Claude Desktop, Claude Code
- Single client per server instance

**HTTP Transport** (recommended for our use case):
- Remote server communication
- Multiple concurrent clients
- Supports authentication via bearer tokens
- Required for OpenAI Responses API integration

```python
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
```

### 2. Tool Registration & Schema Definition

#### 2.1 Basic Tool Registration

Tools are registered using the `@mcp.tool` decorator:

```python
@mcp.tool
def add_task(user_id: int, title: str, description: str | None = None) -> dict:
    """Create a new task for the user.

    Args:
        user_id: The ID of the user creating the task
        title: The task title (required)
        description: Optional task description

    Returns:
        Dictionary containing the created task details
    """
    # Implementation
    return {"id": 1, "title": title, "user_id": user_id}
```

**Automatic Schema Generation**:
- Function name becomes tool name
- Docstring becomes tool description
- Type hints generate JSON Schema for parameters
- Parameters without defaults are required
- Parameters with defaults are optional

#### 2.2 Advanced Tool Configuration

```python
from typing import Annotated
from pydantic import Field

@mcp.tool(
    name="list_tasks",
    description="List all tasks for a user with optional filtering",
    tags={"tasks", "read"},
    timeout=30.0,
    annotations={"readOnlyHint": True}
)
async def list_user_tasks(
    user_id: Annotated[int, "The user ID to fetch tasks for"],
    status: Annotated[
        str | None,
        Field(description="Filter by status: 'completed' or 'incomplete'")
    ] = None,
    limit: Annotated[int, Field(ge=1, le=100)] = 10
) -> list[dict]:
    """Implementation"""
    pass
```

**Configuration Options**:
- `name`: Override function name
- `description`: Override docstring
- `tags`: Categorization for filtering
- `timeout`: Execution timeout in seconds
- `annotations`: MCP hints (readOnlyHint, destructiveHint)
- `meta`: Custom metadata for clients

#### 2.3 Async Support

Both sync and async functions work as tools:

```python
@mcp.tool
async def async_tool(task_id: int) -> dict:
    """Async implementation - runs natively"""
    await asyncio.sleep(0.1)
    return {"id": task_id}

@mcp.tool
def sync_tool(task_id: int) -> dict:
    """Sync implementation - runs in threadpool automatically"""
    time.sleep(0.1)
    return {"id": task_id}
```

FastMCP automatically runs sync functions in a threadpool to avoid blocking the event loop.

### 3. Stateless Architecture & Database Integration

#### 3.1 Stateless Design Principles

**Core Requirement**: MCP server must be completely stateless when using HTTP transport.

**Stateless Request Cycle**:
1. Receive user message [HTTP Request]
2. Fetch conversation history from DB [Database Read]
3. Build message context array [In-Memory Processing]
4. Store user message in DB [Database Write]
5. Run agent with MCP tools [Agent Execution]
6. Agent invokes tool(s) [Tool Execution]
7. Store assistant response in DB [Database Write]
8. Return response to client [HTTP Response]
9. Server ready for next request [NO STATE RETAINED]

**Implications**:
- No server-side session storage
- No in-memory conversation state
- All state persists to database
- Each request is independent
- Database is single source of truth

#### 3.2 Database Session Management with FastMCP

FastMCP supports dependency injection for database sessions via Context:

```python
from fastmcp import FastMCP, Context
from fastmcp.dependencies import CurrentContext
from sqlmodel import Session, create_engine
from contextlib import asynccontextmanager

# Database setup
engine = create_engine(DATABASE_URL)

# Lifespan for resource management
@asynccontextmanager
async def lifespan(app):
    # Startup: initialize resources
    yield
    # Shutdown: cleanup resources
    engine.dispose()

mcp = FastMCP(name="TodoMCP", lifespan=lifespan)
```

#### 3.3 Integration with Existing Database Layer

Our existing Phase II backend uses:
- SQLModel for ORM
- Synchronous Session from SQLAlchemy
- TaskService for business logic
- `get_db()` dependency for session management

**Integration Strategy**:
1. Reuse existing `get_db()` function
2. Reuse existing TaskService methods
3. MCP tools call TaskService with database session
4. Maintain user isolation at database level

```python
from backend.src.database import get_db
from backend.src.services.task_service import TaskService
from backend.src.models.task import TaskCreate

@mcp.tool
def add_task(user_id: int, title: str, description: str | None = None) -> dict:
    """Create a new task for the user"""
    with next(get_db()) as db:
        task_data = TaskCreate(title=title, description=description)
        task = TaskService.create_task(db, task_data, user_id)
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed,
            "created_at": task.created_at.isoformat()
        }
```

### 4. Context & Dependency Injection

#### 4.1 MCP Context

Context provides access to MCP features within tools:

```python
from fastmcp import Context
from fastmcp.dependencies import CurrentContext

@mcp.tool
async def process_task(
    task_id: int,
    ctx: Context = CurrentContext()
) -> str:
    """Process a task with logging and progress"""
    await ctx.info(f"Processing task {task_id}")
    await ctx.report_progress(progress=50, total=100)
    return "Processed"
```

**Context Capabilities**:
- **Logging**: `ctx.debug()`, `ctx.info()`, `ctx.warning()`, `ctx.error()`
- **Progress**: `ctx.report_progress(progress, total, message)`
- **Resources**: `ctx.list_resources()`, `ctx.read_resource(uri)`
- **Prompts**: `ctx.list_prompts()`, `ctx.get_prompt(name, args)`
- **LLM Sampling**: `ctx.sample(prompt, temperature)`
- **User Elicitation**: `ctx.elicit(prompt, response_type)`
- **Request Info**: `ctx.request_id`, `ctx.client_id`, `ctx.session_id`

**Important**: Dependency parameters are excluded from MCP schemas—clients never see them.

### 5. Authentication & Authorization

#### 5.1 JWT Authentication with HTTP Transport

MCP servers using HTTP transport support bearer token authentication:

```python
from fastmcp.auth import JWTVerifier
import os

# JWT verification setup
jwt_verifier = JWTVerifier(
    secret_key=os.getenv("BETTER_AUTH_SECRET"),
    algorithm="HS256"
)

mcp = FastMCP(
    name="TodoMCP",
    auth=jwt_verifier
)
```

**Authentication Flow**:
1. Client includes JWT in Authorization header: `Bearer <token>`
2. MCP server verifies token signature
3. Token claims extracted and available to tools
4. Invalid tokens return 401 Unauthorized

#### 5.2 Accessing User Context in Tools

Tools can access the authenticated user's token:

```python
from fastmcp.dependencies import get_access_token
from fastmcp.auth import AccessToken
from fastmcp.exceptions import ToolError

@mcp.tool
async def add_task(title: str) -> dict:
    """Create task for authenticated user"""
    token = get_access_token()

    if token is None:
        raise ToolError("Authentication required")

    # Extract user_id from token claims
    user_id = token.claims.get("user_id") or token.claims.get("sub")

    # Use user_id for database operations
    with next(get_db()) as db:
        task = TaskService.create_task(db, TaskCreate(title=title), user_id)
        return {"id": task.id, "title": task.title}
```

**AccessToken Properties**:
- `token`: Raw token string
- `client_id`: OAuth client identifier
- `scopes`: List of OAuth scopes
- `expires_at`: Token expiration timestamp
- `claims`: Dictionary of JWT claims (includes user_id, email, etc.)

### 6. OpenAI Responses API Integration

#### 6.1 OpenAI Responses API (Not Agents SDK)

**Important Clarification**: OpenAI's integration with MCP uses the **Responses API**, not an "Agents SDK". The Responses API is distinct from the Completions API and Assistants API.

**Current Limitations**:
- Only **tools** from MCP servers are supported
- Resources and prompts are NOT supported
- Requires publicly accessible HTTP endpoint

#### 6.2 Tool Calling Pattern

The OpenAI Responses API discovers and calls MCP tools:

```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.responses.create(
    model="gpt-4.1",
    input="Add a task to buy groceries",
    tools=[
        {
            "type": "mcp",
            "server_label": "todo_server",
            "server_url": "https://your-server.com/mcp/",
            "require_approval": "never",
            "headers": {
                "Authorization": f"Bearer {jwt_token}"
            }
        }
    ]
)
```

**Configuration Elements**:
- `type`: Must be "mcp"
- `server_label`: Identifier for the MCP server
- `server_url`: Public URL of MCP server (must end with /mcp/)
- `require_approval`: "never" | "always" | "auto"
- `headers`: Optional authentication headers (JWT bearer token)

#### 6.3 Agent Behavior

The OpenAI model:
1. Receives user input
2. Discovers available tools from MCP server
3. Decides which tool(s) to call based on input
4. Invokes tools with appropriate arguments
5. Processes tool results
6. Generates natural language response

**Multi-Tool Chaining**: The model can call multiple tools in sequence to accomplish complex tasks.

### 7. FastAPI Integration

#### 7.1 Mounting MCP Server in FastAPI

FastMCP can be mounted into an existing FastAPI application:

```python
from fastapi import FastAPI
from fastmcp import FastMCP
from fastmcp.utilities.lifespan import combine_lifespans
from contextlib import asynccontextmanager

# Existing FastAPI app
app = FastAPI()

# Create MCP server
mcp = FastMCP(name="TodoMCP")

# Register tools
@mcp.tool
def add_task(user_id: int, title: str) -> dict:
    pass

# Mount MCP server
mcp_app = mcp.http_app(path="/mcp")

# Combine lifespans if needed
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    # Your startup/shutdown logic
    yield

app = FastAPI(lifespan=combine_lifespans(app_lifespan, mcp_app.lifespan))
app.mount("/mcp", mcp_app)
```

#### 7.2 Deployment Architecture

**Option 1: Separate Processes**
- FastAPI app runs on port 8000 (REST API)
- MCP server runs on port 8001 (MCP tools)
- Both share same database

**Option 2: Single Process (Recommended)**
- FastAPI app with MCP mounted at /mcp
- REST API endpoints: /api/*
- MCP endpoint: /mcp/
- Shared database and authentication

### 8. MCP Error Handling

#### 8.1 Tool Errors

MCP defines two error types:

**Protocol Errors** (JSON-RPC):
- Handled automatically by FastMCP
- Unknown tool, invalid arguments, server errors

**Tool Execution Errors**:
```python
from fastmcp.exceptions import ToolError

@mcp.tool
def delete_task(user_id: int, task_id: int) -> dict:
    """Delete a task"""
    with next(get_db()) as db:
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            raise ToolError(f"Task {task_id} not found")

        TaskService.delete_task(db, task_id, user_id)
        return {"success": True, "message": f"Task {task_id} deleted"}
```

#### 8.2 Security Considerations

**Input Validation**:
- FastMCP validates inputs against JSON Schema automatically
- Use Pydantic Field constraints for additional validation
- Sanitize user inputs before database operations

**Access Control**:
- Verify JWT token on every request
- Extract user_id from token claims
- Enforce user_id matches requested user_id
- Return 403 Forbidden for unauthorized access

**Error Masking**:
```python
mcp = FastMCP(
    name="TodoMCP",
    mask_error_details=True  # Hide internal errors from clients
)
```

### 9. MCP Tool Design for Todo Application

**5 Required Tools**:

1. **add_task**
   - Parameters: user_id, title, description (optional)
   - Returns: Created task object
   - Validation: Title required, max lengths

2. **list_tasks**
   - Parameters: user_id, status (optional: "completed" | "incomplete")
   - Returns: Array of task objects
   - Filtering: By completion status

3. **complete_task**
   - Parameters: user_id, task_id
   - Returns: Updated task object
   - Validation: Task exists and belongs to user

4. **delete_task**
   - Parameters: user_id, task_id
   - Returns: Success confirmation
   - Validation: Task exists and belongs to user

5. **update_task**
   - Parameters: user_id, task_id, title (optional), description (optional)
   - Returns: Updated task object
   - Validation: At least one field to update

---

## Part II: Frontend Integration & Authentication

### 10. OpenAI ChatKit Integration into Next.js

#### 10.1 What is ChatKit?

OpenAI ChatKit is a hosted UI component that provides a conversational interface for chat applications. It handles:
- Message rendering (user and assistant messages)
- Input field with send button
- Typing indicators
- Error states
- Message history display

#### 10.2 Integration Approaches

**Option A: Hosted ChatKit Component (Recommended)**
```typescript
// frontend/components/ChatInterface.tsx
import { ChatKit } from '@openai/chatkit'; // Hypothetical import

export function ChatInterface() {
  const { token } = useAuth();

  return (
    <ChatKit
      apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/chat`}
      authToken={token}
      onMessage={handleMessage}
      onError={handleError}
    />
  );
}
```

**Option B: Custom Chat UI with OpenAI SDK**
```typescript
// frontend/components/CustomChat.tsx
import { useState } from 'react';
import { api } from '@/lib/api';

export function CustomChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await api.post('/chat', {
      message: input,
      conversation_id: conversationId
    });

    setMessages([...messages, response.data]);
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <MessageInput value={input} onChange={setInput} onSend={sendMessage} />
    </div>
  );
}
```

**Recommendation**: Start with Option B (Custom UI) for full control, then migrate to Option A if ChatKit becomes available.

#### 10.3 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chat Page (/chat)                                     │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  ChatInterface Component                         │ │ │
│  │  │  - Message display                               │ │ │
│  │  │  - Input field                                   │ │ │
│  │  │  - Send button                                   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ JWT Token in Header              │
│                           ▼                                  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/chat
                            │ Authorization: Bearer <JWT>
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  JWT Middleware (auth.py)                             │ │
│  │  - Verify token signature                             │ │
│  │  - Extract user_id from token                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chat Endpoint (routes/chat.py)                       │ │
│  │  1. Fetch conversation history from DB                │ │
│  │  2. Store user message                                │ │
│  │  3. Run OpenAI Agent with MCP tools                   │ │
│  │  4. Store assistant response                          │ │
│  │  5. Return response                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Server (mcp/server.py)                           │ │
│  │  - add_task(user_id, title, description)             │ │
│  │  - list_tasks(user_id, status)                       │ │
│  │  - complete_task(user_id, task_id)                   │ │
│  │  - delete_task(user_id, task_id)                     │ │
│  │  - update_task(user_id, task_id, ...)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Neon PostgreSQL │
                  │  - conversations │
                  │  - messages      │
                  │  - tasks         │
                  │  - users         │
                  └──────────────────┘
```

---

### 11. Domain Allowlist Configuration

#### 11.1 OpenAI Dashboard Configuration

**Purpose**: Restrict which domains can make requests to your OpenAI API key.

**Steps** (Hypothetical - based on common OAuth patterns):
1. Log into OpenAI Platform Dashboard
2. Navigate to API Keys section
3. Select your API key
4. Find "Domain Allowlist" or "CORS Origins" settings
5. Add allowed domains:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
   - `https://www.yourdomain.com` (production with www)

**Security Note**: Domain allowlisting is CLIENT-SIDE security only. Always validate requests on the backend.

#### 11.2 Backend API Key Security

**Critical**: OpenAI API key must NEVER be exposed to the frontend.

```python
# backend/src/config/settings.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")

    # JWT Configuration
    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
    JWT_ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**Environment Variables** (`.env`):
```bash
# NEVER commit this file to git
OPENAI_API_KEY=sk-proj-...
BETTER_AUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host/db
```

---

### 12. JWT Token Authentication Flow

#### 12.1 Current Phase II Authentication Pattern

Based on analysis of existing codebase:

**Frontend** (`frontend/src/services/auth.ts`):
```typescript
// User logs in
const response = await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
const token = data.access_token;

// Store token in localStorage
localStorage.setItem("token", token);
```

**Frontend API Client** (`frontend/src/services/api.ts`):
```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// All API requests include JWT
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  headers: {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  }
});
```

**Backend Middleware** (`backend/src/middleware/auth.py`):
```python
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer
import jwt
import os

security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Extract and verify JWT token, return user_id"""
    try:
        token = credentials.credentials
        secret = os.getenv("BETTER_AUTH_SECRET")
        algorithm = "HS256"

        payload = jwt.decode(token, secret, algorithms=[algorithm])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### 12.2 Chat Endpoint Authentication

**Same pattern applies to chat endpoint**:

```python
# backend/src/routes/chat.py
from fastapi import APIRouter, Depends
from ..middleware.auth import get_current_user_id

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Chat endpoint with JWT authentication
    - Extracts user_id from JWT token
    - Fetches conversation history for this user only
    - Runs agent with user_id context
    - Stores messages with user_id
    """
    # Fetch conversation history (filtered by user_id)
    messages = await get_conversation_messages(db, request.conversation_id, current_user_id)

    # Run agent with MCP tools (all tools receive user_id)
    response = await run_agent(request.message, messages, current_user_id)

    # Store messages (with user_id)
    await store_message(db, request.conversation_id, current_user_id, "user", request.message)
    await store_message(db, request.conversation_id, current_user_id, "assistant", response)

    return {"response": response}
```

#### 12.3 JWT Token Structure

**Token Payload** (decoded):
```json
{
  "sub": "123",           // user_id (subject)
  "email": "user@example.com",
  "iat": 1709251200,      // issued at
  "exp": 1709337600       // expiration
}
```

**Key Points**:
- `sub` field contains user_id
- Token is signed with `BETTER_AUTH_SECRET`
- Backend verifies signature on every request
- No server-side session storage (stateless)

---

### 13. Conversation State Management

#### 13.1 Stateless Architecture Requirements

**Core Principle**: Server holds NO state between requests.

**Implications**:
- No in-memory conversation storage
- No Redis/session cache
- ALL conversation state in database
- Every request is independent

#### 13.2 Database Schema for Conversations

```sql
-- Conversation table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Message table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
```

#### 13.3 SQLModel Definitions

```python
# backend/src/models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=20)  # 'user', 'assistant', 'system'
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
```

#### 13.4 Stateless Request Cycle (9 Steps)

```python
# backend/src/routes/chat.py
@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # STEP 1: Receive user message [HTTP Request]
    user_message = request.message
    conversation_id = request.conversation_id

    # STEP 2: Fetch conversation history from DB [Database Read]
    statement = select(Message).where(
        Message.conversation_id == conversation_id,
        Message.user_id == current_user_id  # User isolation
    ).order_by(Message.created_at)
    messages = db.exec(statement).all()

    # STEP 3: Build message context array [In-Memory Processing]
    message_context = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
    message_context.append({"role": "user", "content": user_message})

    # STEP 4: Store user message in DB [Database Write]
    user_msg = Message(
        conversation_id=conversation_id,
        user_id=current_user_id,
        role="user",
        content=user_message
    )
    db.add(user_msg)
    db.commit()

    # STEP 5: Run agent with MCP tools [Agent Execution]
    agent_response = await run_agent_with_tools(
        messages=message_context,
        user_id=current_user_id  # Pass to MCP tools
    )

    # STEP 6: Agent invokes tool(s) [Tool Execution]
    # (Handled internally by agent - tools receive user_id)

    # STEP 7: Store assistant response in DB [Database Write]
    assistant_msg = Message(
        conversation_id=conversation_id,
        user_id=current_user_id,
        role="assistant",
        content=agent_response
    )
    db.add(assistant_msg)
    db.commit()

    # STEP 8: Return response to client [HTTP Response]
    return {"response": agent_response}

    # STEP 9: Server ready for next request [NO STATE RETAINED]
    # Function exits, all local variables destroyed
    # Next request starts fresh from STEP 1
```

#### 13.5 Conversation History Retrieval

**Frontend Pattern**:
```typescript
// frontend/components/ChatInterface.tsx
const [conversationId, setConversationId] = useState<number | null>(null);
const [messages, setMessages] = useState<Message[]>([]);

// Load conversation history on mount
useEffect(() => {
  const loadConversation = async () => {
    if (conversationId) {
      const history = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(history);
    } else {
      // Create new conversation
      const newConv = await api.post('/conversations', {});
      setConversationId(newConv.id);
    }
  };

  loadConversation();
}, [conversationId]);

// Send message
const sendMessage = async (text: string) => {
  const response = await api.post('/chat', {
    conversation_id: conversationId,
    message: text
  });

  // Update local state
  setMessages([
    ...messages,
    { role: 'user', content: text },
    { role: 'assistant', content: response.response }
  ]);
};
```

---

### 14. Error Handling and User Experience Patterns

#### 14.1 Error Categories

**Authentication Errors (401)**:
```typescript
// frontend/lib/api.ts
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('token');
  router.push('/login');
  throw new Error('Session expired. Please log in again.');
}
```

**Authorization Errors (403)**:
```typescript
if (response.status === 403) {
  // User trying to access another user's conversation
  throw new Error('You do not have permission to access this conversation.');
}
```

**Rate Limit Errors (429)**:
```typescript
if (response.status === 429) {
  // OpenAI API rate limit
  throw new Error('Too many requests. Please wait a moment and try again.');
}
```

**Server Errors (500)**:
```typescript
if (response.status === 500) {
  // Backend error
  throw new Error('Something went wrong. Please try again later.');
}
```

#### 14.2 User Experience Patterns

**Loading States**:
```typescript
const [isLoading, setIsLoading] = useState(false);

const sendMessage = async (text: string) => {
  setIsLoading(true);
  try {
    const response = await api.post('/chat', { message: text });
    // Update UI
  } catch (error) {
    // Show error
  } finally {
    setIsLoading(false);
  }
};

// UI
{isLoading && <TypingIndicator />}
```

**Optimistic Updates**:
```typescript
const sendMessage = async (text: string) => {
  // Immediately show user message
  const tempMessage = { role: 'user', content: text, id: 'temp' };
  setMessages([...messages, tempMessage]);

  try {
    const response = await api.post('/chat', { message: text });
    // Replace temp message with real one
    setMessages(prev => [
      ...prev.filter(m => m.id !== 'temp'),
      { role: 'user', content: text, id: response.user_message_id },
      { role: 'assistant', content: response.response, id: response.assistant_message_id }
    ]);
  } catch (error) {
    // Remove temp message on error
    setMessages(prev => prev.filter(m => m.id !== 'temp'));
    showError(error.message);
  }
};
```

**Retry Logic**:
```typescript
const sendMessageWithRetry = async (text: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api.post('/chat', { message: text });
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

#### 14.3 Backend Error Handling

```python
# backend/src/routes/chat.py
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    try:
        # Validate conversation ownership
        conversation = db.get(Conversation, request.conversation_id)
        if not conversation or conversation.user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Process message
        response = await process_chat_message(request, current_user_id, db)
        return response

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except OpenAIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

---

---

## Part III: Best Practices & Implementation Guide

### 15. Best Practices Summary

#### 15.1 Security Best Practices

✅ **DO**:
- Store JWT in localStorage (or httpOnly cookies for enhanced security)
- Verify JWT signature on every backend request
- Filter all database queries by user_id from JWT
- Never expose OpenAI API key to frontend
- Use environment variables for secrets
- Implement rate limiting on chat endpoint
- Sanitize user input before passing to agent
- Escape AI responses to prevent XSS

❌ **DON'T**:
- Store JWT in URL parameters or query strings
- Trust user_id from request body (always use JWT)
- Allow cross-user conversation access
- Commit .env files to git
- Log sensitive data (tokens, API keys, message content)
- Skip JWT verification on any endpoint

#### 15.2 Performance Best Practices

✅ **DO**:
- Use database connection pooling
- Index conversation_id and user_id columns
- Limit conversation history to last N messages
- Implement pagination for message history
- Use async/await for all I/O operations
- Cache OpenAI agent configuration (not conversation state)
- Stream responses for long AI outputs (if supported)

❌ **DON'T**:
- Load entire conversation history on every request
- Store conversation state in memory
- Make synchronous database calls
- Create new database connections per request

#### 15.3 User Experience Best Practices

✅ **DO**:
- Show typing indicator while waiting for AI response
- Implement optimistic UI updates
- Display clear error messages
- Auto-scroll to latest message
- Save draft messages locally
- Support keyboard shortcuts (Enter to send)
- Show message timestamps
- Indicate message delivery status

❌ **DON'T**:
- Block UI while waiting for response
- Show technical error messages to users
- Lose user input on error
- Auto-submit on Enter without Shift modifier

---

### 16. Implementation Checklist

#### 16.1 Backend Tasks

- [ ] Create Conversation and Message SQLModel models
- [ ] Create database migration for new tables
- [ ] Implement chat endpoint with JWT authentication
- [ ] Implement MCP server with 5 tools
- [ ] Integrate OpenAI Agents SDK
- [ ] Add conversation history retrieval endpoint
- [ ] Add conversation creation endpoint
- [ ] Implement error handling and logging
- [ ] Add rate limiting middleware
- [ ] Write unit tests for chat endpoint
- [ ] Write integration tests for MCP tools

#### 16.2 Frontend Tasks

- [ ] Create ChatInterface component
- [ ] Create MessageList component
- [ ] Create MessageInput component
- [ ] Implement chat API client
- [ ] Add conversation state management
- [ ] Implement optimistic UI updates
- [ ] Add loading and error states
- [ ] Add typing indicator
- [ ] Create chat page route
- [ ] Add navigation to chat page
- [ ] Write component tests
- [ ] Write E2E tests for chat flow

#### 16.3 Infrastructure Tasks

- [ ] Add OPENAI_API_KEY to environment variables
- [ ] Configure domain allowlist in OpenAI dashboard
- [ ] Update deployment scripts
- [ ] Add monitoring for chat endpoint
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting rules
- [ ] Update API documentation

---

### 17. Open Questions & Risks

#### 17.1 Open Questions

1. **OpenAI Responses API Access**: Do we have access to the Responses API? (Currently in limited beta)
2. **Public URL Requirement**: How will we expose MCP server publicly? (ngrok for dev, proper hosting for prod)
3. **Conversation Context Window**: How many messages to include in context? (Recommend last 10-20 messages)
4. **Error Recovery**: How to handle OpenAI API failures? (Fallback to rule-based parsing)

#### 17.2 Risks

1. **OpenAI API Rate Limits**: May hit rate limits with multiple concurrent users
   - Mitigation: Implement request queuing and rate limiting

2. **Database Connection Pool**: Neon has aggressive idle timeouts
   - Mitigation: Already configured with pool_recycle=30

3. **Token Expiration**: JWT tokens may expire during long conversations
   - Mitigation: Frontend refreshes tokens automatically

4. **MCP Server Availability**: Single point of failure
   - Mitigation: Health checks and automatic restart

### 18. Next Steps

1. **Review this research document** with team
2. **Proceed to Phase 1**: Create data-model.md and contracts/
3. **Run /sp.tasks**: Generate detailed implementation tasks
4. **Begin implementation**: Use Claude Code agents and skills

---

### 19. References

#### 19.1 MCP & OpenAI Documentation
- [MCP Official Documentation](https://modelcontextprotocol.io/docs)
- [FastMCP Documentation](https://gofastmcp.com)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)

#### 19.2 Internal Documentation
- [spec.md](./spec.md) - Feature specification
- [plan.md](./plan.md) - Implementation plan
- [C:\Users\dell\Desktop\Hackathon II Phase II\Hackathon-Phase-II\Phase-III\backend\src\middleware\auth.py](../../backend/src/middleware/auth.py) - JWT authentication middleware
- [C:\Users\dell\Desktop\Hackathon II Phase II\Hackathon-Phase-II\Phase-III\frontend\src\services\api.ts](../../frontend/src/services/api.ts) - API client with JWT headers
- [C:\Users\dell\Desktop\Hackathon II Phase II\Hackathon-Phase-II\Phase-III\backend\src\api\tasks\tasks.py](../../backend/src/api/tasks/tasks.py) - Task CRUD operations pattern

#### 19.3 Framework Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [Better Auth Documentation](https://www.better-auth.com)

---

**Research Status**: ✅ Complete
**Ready for Phase 1**: Yes
**Blockers**: None
