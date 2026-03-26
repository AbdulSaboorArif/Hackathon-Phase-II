<!--
Sync Impact Report
==================
Version Change: 1.1.0 → 1.2.0

Modified Principles:
- Technology Stack Compliance: Extended with Phase III components (OpenAI Agents SDK, MCP SDK, ChatKit)
- Security-First Architecture: Extended with chat endpoint security, MCP tool authorization, conversation isolation
- Data Persistence Standards: Extended with Conversation and Message tables

Added Sections:
- Section VI: Stateless Architecture (CRITICAL)
- Section VII: MCP Architecture Principles
- Section VIII: AI Agent Behavior Standards
- Section IX: Natural Language Understanding
- Phase III Technology Stack additions
- Phase III Security Requirements
- Stateless Request Cycle documentation
- Repository Structure extensions

Removed Sections: None

Templates Requiring Updates:
✅ .specify/templates/plan-template.md - Constitution Check section aligns with new principles
✅ .specify/templates/spec-template.md - User story format supports Phase III features
✅ .specify/templates/tasks-template.md - Task categorization supports Phase III components

Follow-up TODOs: None
-->

# Todo AI Chatbot with MCP Architecture Constitution

**Project Name**: Todo AI Chatbot with MCP Architecture
**Phase**: III - Conversational AI Interface (Extends Phase II)
**Previous Phase**: Phase II - Full-Stack Web Application (Complete)

## Project Identity

Phase III extends the Todo application into an AI-powered chatbot that manages todos through natural language using an MCP (Model Context Protocol) server architecture. This constitution defines non-negotiable principles and constraints that all agents, skills, and specs must follow.

**Success Definition**:
- Chatbot understands natural language commands for all 5 basic CRUD operations
- Uses exactly the specified MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Maintains full conversation history across sessions via Neon DB
- Stateless servers (FastAPI chat endpoint + MCP server)
- Strict user isolation enforced via JWT + user_id filtering
- Responsive ChatKit UI integrated in frontend

No code may be written for Phase III unless it is traceable back to this constitution and the associated specs via the Spec-Kit / Agentic Dev Stack workflow.

---

## Core Principles (Unbreakable Rules)

### I. Spec-Driven Development (MANDATORY)

All functionality must originate from written specifications. No manual code writing by the developer. Claude Code is the sole code generator. Backend and frontend must be independently verifiable. Security and user isolation are non-negotiable.

**Workflow**: Write/update spec → Generate plan → Break into tasks → Implement via Claude Code

**Session Protocol**:
- Every session MUST begin with full re-analysis: read all specs, CLAUDE.md, existing code, then report Current Implementation Status
- Persistent progress: After every step, update status (completed / partial / remaining) and never assume prior context
- Do not stop implementation unless user explicitly says "stop", "pause", or "end session"

### II. Technology Stack Compliance (REQUIRED)

**Phase II Stack (Maintained - All Still Required)**

**Frontend:**
- Next.js 16+ (App Router - REQUIRED)
- TypeScript
- Tailwind CSS (core utility classes only)
- Better Auth with JWT tokens

**Backend:**
- Python FastAPI
- SQLModel
- Neon Serverless PostgreSQL
- RESTful JSON endpoints

**Development:**
- Spec Management: Spec-Kit Plus
- AI Coding: Claude Code
- Package Manager: UV (Python), npm (JavaScript)

**Phase III Additions (NEW)**

**AI & Conversational Interface:**
- AI Framework: OpenAI Agents SDK (agent + runner)
- MCP Server: Official MCP SDK
- Frontend Chat UI: OpenAI ChatKit (hosted)
- Natural Language Processing: OpenAI models via Agents SDK

**Integration Requirements:**
- ChatKit domain allowlist configured in OpenAI dashboard
- OpenAI API key secured in backend environment
- MCP tools expose exactly 5 stateless operations
- All Phase II components remain operational

### III. Security-First Architecture (NON-NEGOTIABLE)

**Phase II Security (Maintained)**:
- Every API request must include a valid JWT token
- Backend must verify JWT using shared secret (BETTER_AUTH_SECRET)
- Requests without valid authentication must return **401 Unauthorized**
- Task ownership must be enforced at API and database level
- User isolation is mandatory — users may only access their own tasks

**Phase III Security Extensions**:
- **Chat Endpoint Security**: POST /api/{user_id}/chat requires JWT token
- **MCP Tool Authorization**: Every tool execution MUST validate user_id from JWT matches requested user_id
- **Conversation Isolation**: Users only access their own conversations (filter by user_id on every query)
- **Input Sanitization**: Validate all user messages before passing to agent
- **XSS Prevention**: Sanitize AI responses before display
- **No Cross-User Access**: Raise 403 on user_id mismatch under any condition
- **Audit Logging**: Log only metadata (user_id, timestamp, tool called) — never full message content
- **OpenAI API Key Security**: Keep secret, never commit, never expose in frontend, never log in responses

### IV. Data Persistence Standards (REQUIRED)

**Phase II Standards (Maintained)**:
- Database: Neon Serverless PostgreSQL (REQUIRED)
- ORM: SQLModel for all database operations
- Migrations: All schema changes must be tracked
- Connection: Use `DATABASE_URL` environment variable
- User Isolation: All tasks associated with authenticated user ID

**Phase III Schema Extensions**:
- Reuse existing Task table (user_id enforced)
- Add **Conversation** table:
  - id: integer (PK)
  - user_id: string (FK → users.id)
  - created_at: timestamp
  - updated_at: timestamp
- Add **Message** table:
  - id: integer (PK)
  - user_id: string (FK → users.id)
  - conversation_id: integer (FK → conversations.id)
  - role: "user" | "assistant"
  - content: text
  - created_at: timestamp
- **Indexes**: messages.conversation_id, messages.user_id, conversations.user_id
- **Foreign Keys**: Enforce with appropriate cascade behavior
- **All Queries**: MUST include user_id filter from JWT
- **Async Sessions**: SQLModel + async sessions only

### V. Authentication Context Sharing (MANDATORY)

**Phase II Authentication (Maintained)**:
- User registration and authentication required
- Multi-user todo management
- Frontend and backend must share authentication context via JWT
- Frontend → API call includes JWT in `Authorization: Bearer <token>`
- Backend → Extracts token, verifies signature, identifies user

**Phase III Authentication Flow**:
- User logs in on Frontend → Better Auth creates session and issues JWT token
- Frontend makes chat API call → Includes JWT token in Authorization: Bearer header
- Backend receives request → Extracts token from header, verifies signature using shared secret
- Backend identifies user → Decodes token to get user ID, email, etc.
- Backend filters data → Returns only tasks and conversations belonging to that user
- MCP tools receive user_id → Enforce ownership on every tool invocation

### VI. Stateless Architecture (CRITICAL FOR PHASE III)

**Core Principle**: Server holds NO state between requests. All state persists to database.

**Why Stateless Matters**:
- ✅ Scalability: Any server instance handles any request
- ✅ Resilience: Server restarts don't lose conversations
- ✅ Horizontal Scaling: Load balancer routes to any backend
- ✅ Testability: Each request is independent

**Stateless Invariants**:
- Both FastAPI chat endpoint and MCP server MUST be completely stateless
- No server-side session, memory, or Redis — ALL conversation state (history) lives in Neon DB only
- Every /api/{user_id}/chat request is independent: fetch history → run agent → store new messages → return response

**Stateless Request Cycle (9 Steps)**:
1. Receive user message [HTTP Request]
2. Fetch conversation history from DB [Database Read]
3. Build message context array [In-Memory Processing]
4. Store user message in DB [Database Write]
5. Run agent with MCP tools [Agent Execution]
6. Agent invokes tool(s) [Tool Execution]
7. Store assistant response in DB [Database Write]
8. Return response to client [HTTP Response]
9. Server ready for next request [NO STATE RETAINED] ⭐

**Verification Test**:
1. Send message to chat endpoint → Get conversation_id
2. Send 5 more messages to same conversation
3. Restart server (kill and restart process)
4. Send message with same conversation_id
5. Verify: Conversation continues (history loaded from DB)

If step 5 works → Server is stateless ✅
If step 5 fails → Server has state ❌ (fix required)

### VII. MCP Architecture Principles (NEW FOR PHASE III)

**What is MCP?**
Model Context Protocol - A standardized way to expose application functionality as tools that AI agents can discover and use.

**MCP Design Principles**:
- **Tools as Interface**: All task operations exposed as MCP tools
- **Stateless Tools**: MCP tools read/write to database, hold NO state
- **Tool Discovery**: Agent automatically discovers available tools
- **Error Handling**: Tools return structured error messages
- **Type Safety**: Pydantic schemas for all tool parameters
- **Composability**: Tools can be chained by agent

**MCP vs REST API**:
```
REST API (Phase II)          MCP Tools (Phase III)
├── HTTP endpoints           ├── Function-based tools
├── Called by frontend       ├── Called by AI agent
├── Returns JSON             ├── Returns structured dict
├── User-facing              ├── Agent-facing
└── Manual integration       └── Auto-discovery
```

**Integration Rule**: MCP tools use the SAME database logic as REST API endpoints. No duplication - tools are wrappers around existing business logic.

**MCP Tools (Non-Negotiable Names & Semantics)**:

1. **add_task**
   - Purpose: create a new task
   - Parameters: `user_id: string`, `title: string`, `description?: string`
   - Returns: `task_id`, `status`, `title`

2. **list_tasks**
   - Purpose: retrieve tasks
   - Parameters: `user_id: string`, `status?: "all" | "pending" | "completed"`
   - Returns: array of task objects (`id`, `title`, `completed`, etc.)

3. **complete_task**
   - Purpose: mark a task as complete
   - Parameters: `user_id: string`, `task_id: integer`
   - Returns: `task_id`, `status`, `title`

4. **delete_task**
   - Purpose: delete a task
   - Parameters: `user_id: string`, `task_id: integer`
   - Returns: `task_id`, `status`, `title`

5. **update_task**
   - Purpose: update task title/description
   - Parameters: `user_id: string`, `task_id: integer`, `title?: string`, `description?: string`
   - Returns: `task_id`, `status`, `title`

**Tool Enforcement**: Tools must internally enforce ownership (filter by `user_id`), and never allow cross-user access.

### VIII. AI Agent Behavior Standards (NEW)

**AI Framework**: OpenAI Agents SDK (agent + runner) for natural language parsing and tool calling

**Agent Personality**:
- Friendly and conversational
- Helpful and proactive
- Clear and concise
- Professional but approachable

**Agent Capabilities**:
- Understand natural language commands
- Select appropriate MCP tool(s)
- Chain multiple tools in one turn
- Provide friendly confirmations
- Handle errors gracefully
- Ask for clarification when needed

**Agent Limitations**:
- Cannot access web or external APIs (only MCP tools)
- Cannot modify system settings
- Cannot access other users' data
- Cannot execute code directly

**Agent MUST**:
- Confirm actions ("Task 'Buy milk' created successfully")
- Handle errors gracefully ("Sorry, I couldn't find task #99")
- Use fallback rule-based parsing if LLM fails
- Produce natural language confirmation after calling tools
- Not leak internal errors or stack traces — messages remain user-friendly

**Response Guidelines**:
- Always confirm actions taken
- Format task lists clearly (numbered)
- Use natural language (not technical jargon)
- Provide helpful context
- Don't expose internal IDs unless necessary

### IX. Natural Language Understanding (AGENT TRAINING)

**Command Categories & Natural Language Triggers**:

1. **Task Creation**:
   - "Add a task to buy groceries"
   - "I need to remember to pay bills"
   - "Create a task for the meeting tomorrow"
   - "Remind me to call mom"
   - "New task: finish project report"
   - Trigger: add/create → `add_task` tool

2. **Task Listing**:
   - "Show me all my tasks"
   - "What's on my todo list?"
   - "What's pending?"
   - "What have I completed?"
   - "List my tasks"
   - Trigger: show/list → `list_tasks` tool

3. **Task Completion**:
   - "Mark task 3 as complete"
   - "I finished the meeting task"
   - "Task 5 is done"
   - "Complete the grocery task"
   - "Check off buy milk"
   - Trigger: mark/complete/done → `complete_task` tool

4. **Task Deletion**:
   - "Delete the meeting task"
   - "Remove task 2"
   - "Cancel the grocery task"
   - "Get rid of the old task"
   - Trigger: delete/remove/cancel → `delete_task` tool

5. **Task Updates**:
   - "Change task 1 to 'Call mom tonight'"
   - "Update the description of task 3"
   - "Rename the meeting task to 'Team standup'"
   - "Edit task 2"
   - Trigger: change/update/rename/edit → `update_task` tool

**Multi-Action Commands**:
- "Add buy milk and show my tasks" → Chain `add_task` + `list_tasks`
- "Mark task 1 as done and add a new task to buy eggs" → Chain `complete_task` + `add_task`
- "Delete all completed tasks" → Agent asks for confirmation first

**Agent Response Patterns**:
```
User: "Add buy milk"
Agent: "I've added 'Buy milk' to your task list!"

User: "What's pending?"
Agent: "You have 3 pending tasks:
1. Buy milk
2. Call mom
3. Pay bills"

User: "Mark task 1 as done"
Agent: "Great! I've marked 'Buy milk' as complete. Well done!"
```

---

## Technology Stack Constitution

### Phase II Stack (Maintained)

| Component          | Technology                     | Rules / Constraints                                        |
|---------------------|--------------------------------|------------------------------------------------------------|
| Frontend Framework | Next.js 16+ (App Router)       | REQUIRED - No alternatives                                 |
| Frontend Language  | TypeScript                     | REQUIRED                                                   |
| Frontend Styling   | Tailwind CSS                   | Core utility classes only                                  |
| Frontend Auth      | Better Auth + JWT              | JWT tokens for API authentication                          |
| Backend Framework  | Python FastAPI                 | REQUIRED                                                   |
| Backend ORM        | SQLModel                       | REQUIRED for all database operations                       |
| Database           | Neon Serverless PostgreSQL     | REQUIRED - No alternatives                                 |
| API Style          | RESTful JSON                   | Stateless endpoints                                        |
| Spec Management    | Spec-Kit Plus                  | REQUIRED                                                   |
| AI Coding          | Claude Code                    | REQUIRED - No manual coding                                |
| Package Manager    | UV (Python), npm (JavaScript)  | REQUIRED                                                   |

### Phase III Stack (NEW)

| Component          | Technology                     | Phase III Rules / Constraints                              |
|---------------------|--------------------------------|------------------------------------------------------------|
| Frontend Chat UI   | Next.js 16+ + OpenAI ChatKit   | Domain allowlist required for hosted ChatKit               |
| Backend Chat       | Python FastAPI                 | Stateless POST /api/{user_id}/chat endpoint                |
| AI Logic           | OpenAI Agents SDK              | Parses message, calls MCP tools, generates natural reply   |
| MCP Tools Server   | Official MCP SDK               | 5 stateless tools, DB-backed, user_id enforced             |
| ORM / DB           | SQLModel + Neon PostgreSQL     | Conversation & Message tables added                        |
| Authentication     | Better Auth + JWT (asymmetric) | JWKS verification, user_id from 'sub' claim                |

**AI Framework (OpenAI Agents SDK)**:
- Runs the AI agent and decides when to call MCP tools
- Receives conversation history + latest user message
- Produces assistant message and tool calls

**MCP Server (Official MCP SDK)**:
- Implements stateless tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Talks to the same Neon PostgreSQL database (via SQLModel) to mutate or read tasks

---

## Security Requirements

### Phase II Security (Maintained)

**Authentication Rules**:
- Every API endpoint requires a valid JWT token
- Backend must verify JWT using shared secret (`BETTER_AUTH_SECRET`)
- Requests without valid authentication must return **401 Unauthorized**
- Task ownership must be enforced at API and database level

**Authorization Rules**:
- User isolation — users only see their own tasks
- All queries filtered by authenticated user ID
- Backend decodes token to obtain user ID, email, etc.
- User filtering enforced across all database queries

**General Security**:
- ✅ JWT authentication on all API endpoints
- ✅ Shared secret (BETTER_AUTH_SECRET)
- ✅ User data isolation
- ✅ Token validation on every request
- ✅ HTTPS in production
- ✅ No plain text passwords
- ✅ CORS properly configured

### Phase III Security Extensions

**Chat Endpoint Security**:
- POST /api/{user_id}/chat requires JWT token
- JWT (Authorization: Bearer) REQUIRED on all chat requests
- Every tool execution MUST validate user_id from JWT matches requested user_id

**MCP Tool Authorization**:
- Tools verify user_id matches authenticated user
- Conversation and Message records MUST be scoped to user_id (filter on every query)
- No cross-user access allowed under any condition — raise 403 on mismatch

**Data Protection**:
- **Conversation Isolation**: Users only access their own conversations
- **Input Sanitization**: Validate all user messages before passing to agent
- **XSS Prevention**: Sanitize AI responses before display
- **Audit Logging**: Never log full message content; audit logs only metadata (user_id, timestamp, tool called)

**OpenAI API Key Security**:
```bash
# Backend environment variable
OPENAI_API_KEY=sk-...   # Keep secret, never commit

# Never expose in frontend
# Never log in responses
# Rotate regularly
```

**Rate Limiting** (Optional but Recommended):
- Prevent abuse of chat endpoint
- Implement per-user rate limits

---

## API & Endpoint Rules

### Phase II REST API (Maintained)

**RESTful Endpoints**:
- All endpoints protected by JWT
- Stateless design
- JSON request/response format
- Standard HTTP status codes

### Phase III Chat API (NEW)

**Chat Endpoint**: POST /api/{user_id}/chat
- **Request Body**: `{conversation_id?: int, message: str}`
- **Response**: `{conversation_id: int, response: str, tool_calls?: array}`
- **Authentication**: JWT required (FastAPI dependency)
- **Stateless**: Fetch history from DB, process, store, return

**MCP Tools** (Not HTTP Endpoints - Agent Only):
```python
# These are functions, not REST endpoints
add_task(user_id, title, description?)
list_tasks(user_id, status?)
complete_task(user_id, task_id)
delete_task(user_id, task_id)
update_task(user_id, task_id, title?, description?)
```

**MCP Tools Exposed Via**: Official MCP SDK (JSON inputs/outputs)

---

## Frontend & ChatKit Rules

**UI**: OpenAI ChatKit (hosted) integrated into frontend (e.g., /chat page or sidebar)

**Requirements**:
- Domain allowlist MUST be configured in OpenAI dashboard for production URL
- All ChatKit API calls → POST /api/{user_id}/chat with JWT attached automatically
- Maintain conversation_id in UI state; create new conversation if none provided
- Responsive design (mobile-first, Tailwind) required

**Integration**:
- ChatKit component embedded in Next.js app
- JWT token passed with every chat request
- Conversation history managed via conversation_id
- Error handling for network failures and auth errors

---

## Repository Structure

### Phase II Structure (Maintained)

```
hackathon-todo/
├── .specify/
│   └── memory/
│       └── constitution.md ✅
├── specs/
│   ├── features/
│   │   ├── task-crud.md ✅
│   │   └── authentication.md ✅
│   ├── api/
│   │   └── rest-endpoints.md ✅
│   ├── database/
│   │   └── schema.md ✅
│   └── ui/
│       ├── components.md ✅
│       └── pages.md ✅
├── CLAUDE.md ✅
├── frontend/ ✅
│   ├── CLAUDE.md ✅
│   ├── app/ ✅
│   ├── components/ ✅
│   └── lib/ ✅
├── backend/ ✅
│   ├── CLAUDE.md ✅
│   ├── main.py ✅
│   ├── models.py ✅
│   └── routes/ ✅
└── README.md ✅
```

### Phase III Additions (NEW)

```
hackathon-todo/
├── specs/
│   ├── features/
│   │   └── chatbot.md          ⭐ NEW
│   ├── api/
│   │   └── mcp-tools.md        ⭐ NEW
│   ├── database/
│   │   └── schema.md           📝 UPDATED (add Conversation, Message)
│   └── ui/
│       └── chatkit.md          ⭐ NEW
├── frontend/
│   ├── app/
│   │   └── chat/               ⭐ NEW
│   │       └── page.tsx        ⭐ NEW
│   └── components/
│       └── ChatInterface.tsx   ⭐ NEW
├── backend/
│   ├── models.py               📝 UPDATED (add Conversation, Message)
│   ├── routes/
│   │   └── chat.py             ⭐ NEW
│   ├── schemas/
│   │   └── chat.py             ⭐ NEW
│   ├── mcp/                    ⭐ NEW
│   │   ├── __init__.py         ⭐ NEW
│   │   ├── server.py           ⭐ NEW
│   │   └── tools.py            ⭐ NEW
│   └── agent/                  ⭐ NEW
│       ├── __init__.py         ⭐ NEW
│       ├── config.py           ⭐ NEW
│       └── runner.py           ⭐ NEW
└── README.md                   📝 UPDATED (add Phase III section)
```

**Legend**:
- ✅ = Phase II (maintained)
- ⭐ = Phase III (new)
- 📝 = Updated for Phase III

---

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All pull requests and reviews must verify compliance. Complexity must be justified.

**Amendment Procedure**:
1. Propose changes via `/sp.constitution` command
2. Document rationale and impact
3. Update version according to semantic versioning
4. Propagate changes to dependent templates
5. Create Sync Impact Report

**Versioning Policy**:
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:
- All specs must reference constitution principles
- All plans must pass Constitution Check gate
- All tasks must align with constitutional constraints
- All code must be traceable to constitutional requirements

---

**Version:** 1.2.0
**Ratified:** 2026-02-03
**Last Amended:** 2026-02-26
