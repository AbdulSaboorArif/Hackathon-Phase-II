# Data Model: AI-Powered Todo Chatbot

**Feature**: 001-ai-chatbot-mcp
**Date**: 2026-02-28
**Status**: Phase 1 Design
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## Overview

This document defines the database schema and entity relationships for the AI-powered todo chatbot feature. The data model extends the existing Phase II schema (User, Task) with two new tables (Conversation, Message) to support stateless conversation management.

**Design Principles**:
- Stateless architecture: All conversation state persisted to database
- User isolation: All queries filtered by user_id from JWT
- Referential integrity: Foreign keys with cascade behavior
- Performance: Strategic indexes on foreign keys and query patterns
- Backward compatibility: No changes to existing Phase II tables

---

## Entity Relationship Diagram

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                    │
│  ┌────────────────────┐              ┌────────────────────┐                │
│  │  Traditional UI    │              │    Chat UI         │                │
│  │  /dashboard        │              │    /chat           │                │
│  │  (Phase II)        │              │    (Phase III)     │                │
│  │  - Forms/Buttons   │              │    - ChatInterface │                │
│  │  - Task CRUD UI    │              │    - Natural Lang  │                │
│  └────────┬───────────┘              └─────────┬──────────┘                │
│           │                                     │                           │
│           │  JWT Token                          │  JWT Token                │
│           │  (Better Auth)                      │  (Better Auth)            │
└───────────┼─────────────────────────────────────┼───────────────────────────┘
            │                                     │
            │ REST API                            │ Chat API
            │ (Phase II)                          │ (Phase III)
            ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND LAYER                                     │
│  ┌────────────────────┐              ┌────────────────────────────────────┐│
│  │  REST Endpoints    │              │  Chat Endpoint                     ││
│  │  (Phase II)        │              │  POST /api/{user_id}/chat          ││
│  │  GET/POST/PUT/     │              │  (Phase III)                       ││
│  │  DELETE/PATCH      │              │                                    ││
│  │  /api/{user_id}/   │              │  ┌──────────────────────────────┐  ││
│  │  tasks             │              │  │  Stateless Request Cycle     │  ││
│  └────────┬───────────┘              │  │  1. Receive                  │  ││
│           │                          │  │  2. Fetch history (DB)       │  ││
│           │                          │  │  3. Build context            │  ││
│           │                          │  │  4. Store user msg (DB)      │  ││
│           │                          │  │  5. Run agent                │  ││
│           │                          │  │  6. Tools execute            │  ││
│           │                          │  │  7. Store AI response (DB)   │  ││
│           │                          │  │  8. Return response          │  ││
│           │                          │  │  9. NO STATE ⭐               │  ││
│           │                          │  └──────────┬───────────────────┘  ││
│           │                          │             │                      ││
│           │                          │             ▼                      ││
│           │                          │  ┌──────────────────────────────┐  ││
│           │                          │  │  OpenAI Agents SDK           │  ││
│           │                          │  │  - Agent Runner              │  ││
│           │                          │  │  - gpt-4o model              │  ││
│           │                          │  │  - Tool orchestration        │  ││
│           │                          │  │  - Context management        │  ││
│           │                          │  └──────────┬───────────────────┘  ││
│           │                          │             │                      ││
│           │                          │             ▼                      ││
│           │                          │  ┌──────────────────────────────┐  ││
│           │                          │  │  MCP Server                  │  ││
│           │                          │  │  (Official MCP SDK)          │  ││
│           │                          │  │                              │  ││
│           │                          │  │  Tools:                      │  ││
│           │                          │  │  - add_task                  │  ││
│           │                          │  │  - list_tasks                │  ││
│           │                          │  │  - complete_task             │  ││
│           │                          │  │  - delete_task               │  ││
│           │                          │  │  - update_task               │  ││
│           │                          │  └──────────┬───────────────────┘  ││
│           │                          └─────────────┼──────────────────────┘│
│           │                                        │                       │
│           │  Direct DB Access                      │  Via MCP Tools        │
│           │  (Phase II)                            │  (Phase III)          │
│           ▼                                        ▼                       │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    Business Logic Layer                            │   │
│  │  - Task CRUD operations                                            │   │
│  │  - User validation                                                 │   │
│  │  - Authorization checks                                            │   │
│  │  - Data transformations                                            │   │
│  └────────────────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                    │
│                        Neon Serverless PostgreSQL                           │
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │  users         │  │  tasks         │  │  conversations │              │
│  │  (Phase II)    │  │  (Phase II)    │  │  (Phase III)   │              │
│  │                │  │                │  │                │              │
│  │  - id          │  │  - id          │  │  - id          │              │
│  │  - email       │  │  - user_id FK  │  │  - user_id FK  │              │
│  │  - name        │  │  - title       │  │  - created_at  │              │
│  │  - created_at  │  │  - description │  │  - updated_at  │              │
│  └────────────────┘  │  - completed   │  └────────┬───────┘              │
│                      │  - created_at  │           │                       │
│                      │  - updated_at  │           │                       │
│                      └────────────────┘           │                       │
│                                                    ▼                       │
│                                          ┌────────────────┐                │
│                                          │  messages      │                │
│                                          │  (Phase III)   │                │
│                                          │                │                │
│                                          │  - id          │                │
│                                          │  - conv_id FK  │                │
│                                          │  - user_id FK  │                │
│                                          │  - role        │                │
│                                          │  - content     │                │
│                                          │  - created_at  │                │
│                                          └────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘




┌─────────────────────────────────────────────────────────────────┐
│                         User (Phase II)                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  id: INTEGER PRIMARY KEY                                  │ │
│  │  email: VARCHAR(255) UNIQUE NOT NULL                      │ │
│  │  password_hash: VARCHAR(255) NOT NULL                     │ │
│  │  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    │ 1:N                       │ 1:N
                    ▼                           ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│   Task (Phase II)            │   │   Conversation (NEW)         │
│  ┌────────────────────────┐  │   │  ┌────────────────────────┐  │
│  │  id: INTEGER PK        │  │   │  │  id: INTEGER PK        │  │
│  │  user_id: INTEGER FK   │  │   │  │  user_id: INTEGER FK   │  │
│  │  title: VARCHAR(255)   │  │   │  │  created_at: TIMESTAMP │  │
│  │  description: TEXT     │  │   │  │  updated_at: TIMESTAMP │  │
│  │  is_completed: BOOLEAN │  │   │  └────────────────────────┘  │
│  │  created_at: TIMESTAMP │  │   └──────────────────────────────┘
│  │  updated_at: TIMESTAMP │  │                   │
│  │  completed_at: TS      │  │                   │ 1:N
│  └────────────────────────┘  │                   ▼
└──────────────────────────────┘   ┌──────────────────────────────┐
                                    │   Message (NEW)              │
                                    │  ┌────────────────────────┐  │
                                    │  │  id: INTEGER PK        │  │
                                    │  │  conversation_id: FK   │  │
                                    │  │  user_id: INTEGER FK   │  │
                                    │  │  role: VARCHAR(20)     │  │
                                    │  │  content: TEXT         │  │
                                    │  │  created_at: TIMESTAMP │  │
                                    │  └────────────────────────┘  │
                                    └──────────────────────────────┘
```

**Relationships**:
- User → Task: One-to-Many (existing)
- User → Conversation: One-to-Many (new)
- Conversation → Message: One-to-Many (new)
- User → Message: One-to-Many (new, for direct user isolation)

---

## Table Definitions

### 1. Conversation Table (NEW)

**Purpose**: Represents a chat conversation between a user and the AI assistant.

**SQL DDL**:
```sql
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

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
```

**SQLModel Definition**:
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

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} user_id={self.user_id}>"


class ConversationCreate(SQLModel):
    """Schema for creating a new conversation"""
    pass  # No fields required - user_id comes from JWT


class ConversationResponse(SQLModel):
    """Schema for conversation API responses"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None
```

**Columns**:
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table (indexed for fast lookups)
- `created_at`: Timestamp when conversation was created
- `updated_at`: Timestamp when conversation was last updated (updated on new message)

**Constraints**:
- Primary key on `id`
- Foreign key on `user_id` with CASCADE delete (if user deleted, conversations deleted)
- NOT NULL on `user_id`, `created_at`, `updated_at`

**Indexes**:
- `idx_conversations_user_id`: Fast lookup of user's conversations
- `idx_conversations_updated_at`: Fast sorting by most recent activity

---

### 2. Message Table (NEW)

**Purpose**: Stores individual messages within a conversation (user messages and AI responses).

**SQL DDL**:
```sql
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

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
```

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, Literal

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: Literal["user", "assistant", "system"] = Field(max_length=20)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

    def __repr__(self) -> str:
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message id={self.id} role={self.role} content={preview!r}>"


class MessageCreate(SQLModel):
    """Schema for creating a new message"""
    conversation_id: int
    role: Literal["user", "assistant", "system"]
    content: str


class MessageResponse(SQLModel):
    """Schema for message API responses"""
    id: int
    conversation_id: int
    user_id: int
    role: str
    content: str
    created_at: datetime
```

**Columns**:
- `id`: Auto-incrementing primary key
- `conversation_id`: Foreign key to conversations table (indexed)
- `user_id`: Foreign key to users table (indexed for user isolation)
- `role`: Message role - 'user', 'assistant', or 'system'
- `content`: Message text content
- `created_at`: Timestamp when message was created (indexed for ordering)

**Constraints**:
- Primary key on `id`
- Foreign key on `conversation_id` with CASCADE delete
- Foreign key on `user_id` with CASCADE delete
- CHECK constraint on `role` (must be 'user', 'assistant', or 'system')
- NOT NULL on all columns

**Indexes**:
- `idx_messages_conversation_id`: Fast lookup of conversation messages
- `idx_messages_user_id`: Fast user isolation queries
- `idx_messages_created_at`: Fast chronological ordering
- `idx_messages_conversation_created`: Composite index for conversation history queries

---

### 3. Task Table (Phase II - NO CHANGES)

**Purpose**: Represents a user's todo task (existing functionality maintained).

**SQL DDL** (reference only - already exists):
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT tasks_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Note**: Task table is accessed by MCP tools but NOT modified by this feature.

---

### 4. User Table (Phase II - NO CHANGES)

**Purpose**: Represents a registered user (existing functionality maintained).

**SQL DDL** (reference only - already exists):
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Note**: User table is NOT modified by this feature.

---

## Query Patterns

### 1. Create New Conversation

```python
# Backend: routes/chat.py
async def create_conversation(user_id: int, db: Session) -> Conversation:
    """Create a new conversation for user"""
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation
```

**SQL Generated**:
```sql
INSERT INTO conversations (user_id, created_at, updated_at)
VALUES (123, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, user_id, created_at, updated_at;
```

---

### 2. Fetch Conversation History

```python
# Backend: routes/chat.py
async def get_conversation_messages(
    conversation_id: int,
    user_id: int,
    db: Session,
    limit: int = 50
) -> List[Message]:
    """Fetch conversation messages with user isolation"""
    statement = (
        select(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id  # User isolation
        )
        .order_by(Message.created_at)
        .limit(limit)
    )
    return list(db.exec(statement).all())
```

**SQL Generated**:
```sql
SELECT id, conversation_id, user_id, role, content, created_at
FROM messages
WHERE conversation_id = 456 AND user_id = 123
ORDER BY created_at ASC
LIMIT 50;
```

**Index Used**: `idx_messages_conversation_created` (composite index)

---

### 3. Store User Message

```python
# Backend: routes/chat.py
async def store_message(
    conversation_id: int,
    user_id: int,
    role: str,
    content: str,
    db: Session
) -> Message:
    """Store a message in the database"""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Update conversation updated_at
    conversation = db.get(Conversation, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        db.add(conversation)
        db.commit()

    return message
```

**SQL Generated**:
```sql
-- Insert message
INSERT INTO messages (conversation_id, user_id, role, content, created_at)
VALUES (456, 123, 'user', 'Add buy milk', CURRENT_TIMESTAMP)
RETURNING id, conversation_id, user_id, role, content, created_at;

-- Update conversation timestamp
UPDATE conversations
SET updated_at = CURRENT_TIMESTAMP
WHERE id = 456;
```

---

### 4. List User Conversations

```python
# Backend: routes/conversations.py
async def list_user_conversations(
    user_id: int,
    db: Session,
    skip: int = 0,
    limit: int = 20
) -> List[Conversation]:
    """List user's conversations, most recent first"""
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.exec(statement).all())
```

**SQL Generated**:
```sql
SELECT id, user_id, created_at, updated_at
FROM conversations
WHERE user_id = 123
ORDER BY updated_at DESC
LIMIT 20 OFFSET 0;
```

**Index Used**: `idx_conversations_updated_at`

---

### 5. Delete Conversation (with cascade)

```python
# Backend: routes/conversations.py
async def delete_conversation(
    conversation_id: int,
    user_id: int,
    db: Session
) -> bool:
    """Delete conversation with user isolation"""
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id  # User isolation
    )
    conversation = db.exec(statement).first()

    if not conversation:
        return False

    db.delete(conversation)
    db.commit()
    return True
```

**SQL Generated**:
```sql
-- Fetch conversation
SELECT id, user_id, created_at, updated_at
FROM conversations
WHERE id = 456 AND user_id = 123;

-- Delete conversation (messages cascade automatically)
DELETE FROM conversations WHERE id = 456;

-- Cascade delete (automatic via foreign key)
DELETE FROM messages WHERE conversation_id = 456;
```

---

## Data Validation Rules

### Conversation Validation

- `user_id`: Must exist in users table (enforced by foreign key)
- `created_at`: Auto-generated, cannot be null
- `updated_at`: Auto-generated, updated on new message

### Message Validation

- `conversation_id`: Must exist in conversations table (enforced by foreign key)
- `user_id`: Must match conversation.user_id (enforced in application logic)
- `role`: Must be 'user', 'assistant', or 'system' (enforced by CHECK constraint)
- `content`: Cannot be empty string (enforced in application logic)
- `content`: Maximum length 10,000 characters (enforced in application logic)
- `created_at`: Auto-generated, cannot be null

---

## Migration Strategy

### Migration File: `001_add_conversation_tables.sql`

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

### Rollback File: `001_add_conversation_tables_rollback.sql`

```sql
-- Rollback: Remove conversation and message tables
-- Date: 2026-02-28
-- Feature: 001-ai-chatbot-mcp

BEGIN;

-- Drop tables (cascade will drop foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

COMMIT;
```

---

## Performance Considerations

### Index Strategy

**Conversations Table**:
- `idx_conversations_user_id`: Supports `WHERE user_id = ?` queries
- `idx_conversations_updated_at`: Supports `ORDER BY updated_at DESC` queries

**Messages Table**:
- `idx_messages_conversation_id`: Supports `WHERE conversation_id = ?` queries
- `idx_messages_user_id`: Supports user isolation queries
- `idx_messages_created_at`: Supports chronological ordering
- `idx_messages_conversation_created`: Composite index for conversation history (most common query)

### Query Optimization

**Conversation History Query** (most frequent):
```sql
SELECT * FROM messages
WHERE conversation_id = ? AND user_id = ?
ORDER BY created_at ASC
LIMIT 50;
```
- Uses composite index `idx_messages_conversation_created`
- Expected performance: <10ms for 50 messages

**List Conversations Query**:
```sql
SELECT * FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 20;
```
- Uses index `idx_conversations_updated_at`
- Expected performance: <5ms for 20 conversations

### Pagination Strategy

**Messages**: Limit to last 50 messages per conversation (configurable)
**Conversations**: Paginate with offset/limit (20 per page)

---

## Security Considerations

### User Isolation

**Enforcement Points**:
1. All queries MUST include `WHERE user_id = ?` filter
2. `user_id` extracted from JWT token (never from request body)
3. Conversation ownership validated before message access
4. Foreign key constraints prevent orphaned records

**Example Secure Query**:
```python
# ✅ CORRECT: User isolation enforced
statement = select(Message).where(
    Message.conversation_id == conversation_id,
    Message.user_id == current_user_id  # From JWT
)

# ❌ WRONG: No user isolation
statement = select(Message).where(
    Message.conversation_id == conversation_id
)
```

### Data Retention

**Policy** (to be defined):
- Conversations: Retain indefinitely (user can delete)
- Messages: Retain indefinitely (cascade delete with conversation)
- Deleted users: Cascade delete all conversations and messages

---

## Testing Strategy

### Unit Tests

```python
# tests/test_models.py
def test_create_conversation():
    """Test conversation creation"""
    conversation = Conversation(user_id=1)
    assert conversation.user_id == 1
    assert conversation.created_at is not None

def test_create_message():
    """Test message creation"""
    message = Message(
        conversation_id=1,
        user_id=1,
        role="user",
        content="Test message"
    )
    assert message.role == "user"
    assert message.content == "Test message"

def test_message_role_validation():
    """Test role constraint"""
    with pytest.raises(ValidationError):
        Message(
            conversation_id=1,
            user_id=1,
            role="invalid",  # Should fail
            content="Test"
        )
```

### Integration Tests

```python
# tests/test_conversation_queries.py
async def test_fetch_conversation_history(db_session):
    """Test fetching conversation messages"""
    # Create conversation
    conv = Conversation(user_id=1)
    db_session.add(conv)
    db_session.commit()

    # Add messages
    msg1 = Message(conversation_id=conv.id, user_id=1, role="user", content="Hello")
    msg2 = Message(conversation_id=conv.id, user_id=1, role="assistant", content="Hi")
    db_session.add_all([msg1, msg2])
    db_session.commit()

    # Fetch messages
    messages = await get_conversation_messages(conv.id, 1, db_session)
    assert len(messages) == 2
    assert messages[0].role == "user"
    assert messages[1].role == "assistant"

async def test_user_isolation(db_session):
    """Test user cannot access other user's conversations"""
    # User 1 creates conversation
    conv = Conversation(user_id=1)
    db_session.add(conv)
    db_session.commit()

    # User 2 tries to access
    messages = await get_conversation_messages(conv.id, 2, db_session)
    assert len(messages) == 0  # Should return empty
```

---

## Summary

**New Tables**: 2 (conversations, messages)
**New Indexes**: 6 (optimized for common queries)
**Foreign Keys**: 3 (with CASCADE delete)
**Backward Compatibility**: 100% (no changes to existing tables)
**User Isolation**: Enforced at database and application level
**Performance**: <10ms for typical queries with proper indexing

**Next Steps**:
1. Review data model with team
2. Create API contracts (chat-api.yaml, mcp-tools.yaml)
3. Create quickstart.md for developer setup
4. Run /sp.tasks to generate implementation tasks
