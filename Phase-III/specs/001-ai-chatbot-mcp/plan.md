# Implementation Plan: AI-Powered Todo Chatbot with MCP Architecture

**Branch**: `001-ai-chatbot-mcp` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chatbot-mcp/spec.md`

## Summary

Transform the Phase II multi-user todo web application into an AI-powered conversational interface by integrating OpenAI Agents SDK and implementing Model Context Protocol (MCP) server architecture. Users will manage tasks through natural language while maintaining full Phase II functionality. The server will be stateless, persisting all conversation state to the database.

**Primary Requirement**: Enable natural language task management through an AI chatbot interface that understands user intent and executes CRUD operations via MCP tools.

**Technical Approach**:
- Extend database schema with Conversation and Message tables
- Implement stateless MCP server with 5 task operation tools
- Integrate OpenAI Agents SDK for natural language understanding
- Create stateless FastAPI chat endpoint that fetches history from DB
- Embed OpenAI ChatKit UI component in Next.js frontend
- Maintain JWT authentication and user isolation from Phase II

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, OpenAI Agents SDK, Official MCP SDK, PyJWT, python-dotenv
- Frontend: Next.js 16+, React 18+, TypeScript, Tailwind CSS, OpenAI ChatKit

**Storage**: Neon Serverless PostgreSQL (existing + Conversation/Message tables)
**Testing**: pytest (Backend), Jest + React Testing Library (Frontend)
**Target Platform**:
- Backend: Linux server / Docker container
- Frontend: Vercel / Node.js server
- Database: Neon Serverless PostgreSQL (cloud-hosted)

**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- Chat response latency: <2s p95 (including AI inference)
- Database query latency: <100ms p95
- Concurrent users: 100+ simultaneous conversations
- Message throughput: 10 messages/second per user

**Constraints**:
- Stateless server design (NO in-memory state)
- All conversation history persisted to database
- JWT authentication required on all chat endpoints
- User isolation enforced at database level
- OpenAI API rate limits (tier-dependent)
- Neon connection pooling limits

**Scale/Scope**:
- Multi-user system (100+ users)
- Conversation history: unlimited messages per conversation
- 5 MCP tools (add, list, complete, delete, update tasks)
- Single AI agent per user request (stateless execution)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Spec-Driven Development (MANDATORY)
- All functionality originates from written specification (spec.md)
- No manual code writing - Claude Code is sole generator
- Backend and frontend independently verifiable
- Security and user isolation non-negotiable

**Status**: PASS - This plan follows SDD workflow

### ✅ Technology Stack Compliance (REQUIRED)

**Phase II Stack (Maintained)**:
- Frontend: Next.js 16+ (App Router) ✅
- TypeScript ✅
- Tailwind CSS ✅
- Better Auth with JWT ✅
- Backend: Python FastAPI ✅
- SQLModel ✅
- Neon Serverless PostgreSQL ✅
- RESTful JSON endpoints ✅

**Phase III Additions**:
- AI Framework: OpenAI Agents SDK ✅
- MCP Server: Official MCP SDK ✅
- Frontend Chat UI: OpenAI ChatKit ✅
- Natural Language Processing: OpenAI models ✅

**Status**: PASS - All required technologies specified

### ✅ Security-First Architecture (NON-NEGOTIABLE)

**Phase II Security (Maintained)**:
- JWT authentication on all API requests ✅
- Backend verifies JWT using shared secret ✅
- 401 Unauthorized for invalid auth ✅
- Task ownership enforced at API and database level ✅
- User isolation mandatory ✅

**Phase III Security Extensions**:
- Chat endpoint requires JWT token ✅
- MCP tool authorization validates user_id ✅
- Conversation isolation by user_id ✅
- Input sanitization before agent processing ✅
- XSS prevention on AI responses ✅
- No cross-user access (403 on mismatch) ✅
- Audit logging (metadata only, no content) ✅
- OpenAI API key security (never exposed) ✅

**Status**: PASS - All security requirements addressed

### ✅ Data Persistence Standards (REQUIRED)

**Phase II Standards (Maintained)**:
- Database: Neon Serverless PostgreSQL ✅
- ORM: SQLModel for all operations ✅
- Migrations tracked ✅
- DATABASE_URL environment variable ✅
- User isolation on all tasks ✅

**Phase III Schema Extensions**:
- Conversation table (id, user_id, created_at, updated_at) ✅
- Message table (id, user_id, conversation_id, role, content, created_at) ✅
- Indexes on conversation_id, user_id ✅
- Foreign keys with cascade behavior ✅
- All queries filter by user_id from JWT ✅
- Async sessions only ✅

**Status**: PASS - Database design follows standards

### ✅ Authentication Context Sharing (MANDATORY)

**Phase II Authentication (Maintained)**:
- User registration and authentication ✅
- Multi-user todo management ✅
- JWT shared between frontend and backend ✅
- Frontend includes JWT in Authorization header ✅
- Backend extracts, verifies, identifies user ✅

**Phase III Authentication Flow**:
- User logs in → Better Auth issues JWT ✅
- Frontend chat API call includes JWT ✅
- Backend verifies JWT signature ✅
- Backend decodes user_id from token ✅
- Backend filters conversations/tasks by user_id ✅
- MCP tools receive user_id for enforcement ✅

**Status**: PASS - Authentication flow complete

### ✅ Stateless Architecture (CRITICAL FOR PHASE III)

**Core Principle**: Server holds NO state between requests. All state persists to database.

**Stateless Invariants**:
- FastAPI chat endpoint is stateless ✅
- MCP server is stateless ✅
- NO server-side session, memory, or Redis ✅
- ALL conversation state lives in Neon DB ✅
- Every request is independent ✅

**Stateless Request Cycle (9 Steps)**:
1. Receive user message [HTTP Request] ✅
2. Fetch conversation history from DB [Database Read] ✅
3. Build message context array [In-Memory Processing] ✅
4. Store user message in DB [Database Write] ✅
5. Run agent with MCP tools [Agent Execution] ✅
6. Agent invokes tool(s) [Tool Execution] ✅
7. Store assistant response in DB [Database Write] ✅
8. Return response to client [HTTP Response] ✅
9. Server ready for next request [NO STATE RETAINED] ✅

**Status**: PASS - Stateless design enforced

### ✅ MCP Architecture Principles (NEW FOR PHASE III)

**MCP Design Principles**:
- Tools as Interface ✅
- Stateless Tools (read/write DB, no state) ✅
- Tool Discovery (agent auto-discovers) ✅
- Error Handling (structured messages) ✅
- Type Safety (Pydantic schemas) ✅
- Composability (tools chainable) ✅

**MCP Tools (Non-Negotiable)**:
1. add_task(user_id, title, description?) ✅
2. list_tasks(user_id, status?) ✅
3. complete_task(user_id, task_id) ✅
4. delete_task(user_id, task_id) ✅
5. update_task(user_id, task_id, title?, description?) ✅

**Tool Enforcement**: Filter by user_id, no cross-user access ✅

**Status**: PASS - MCP architecture defined

### ✅ AI Agent Behavior Standards (NEW)

**AI Framework**: OpenAI Agents SDK ✅

**Agent Capabilities**:
- Understand natural language commands ✅
- Select appropriate MCP tool(s) ✅
- Chain multiple tools in one turn ✅
- Provide friendly confirmations ✅
- Handle errors gracefully ✅
- Ask for clarification when needed ✅

**Agent Limitations**:
- Cannot access web or external APIs ✅
- Cannot modify system settings ✅
- Cannot access other users' data ✅
- Cannot execute code directly ✅

**Agent MUST**:
- Confirm actions taken ✅
- Handle errors gracefully ✅
- Use fallback parsing if LLM fails ✅
- Produce natural language confirmations ✅
- Not leak internal errors ✅

**Status**: PASS - Agent behavior defined

### ✅ Natural Language Understanding (AGENT TRAINING)

**Command Categories**:
1. Task Creation (add/create/remind) ✅
2. Task Listing (show/list/what's) ✅
3. Task Completion (mark/complete/done) ✅
4. Task Deletion (delete/remove/cancel) ✅
5. Task Updates (change/update/rename/edit) ✅

**Multi-Action Commands**: Supported via tool chaining ✅

**Status**: PASS - NLU patterns documented

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot-mcp/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.yaml   # MCP tool definitions
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Backend Structure (Python FastAPI)
backend/
├── src/
│   ├── models/
│   │   ├── user.py              # ✅ Phase II (maintained)
│   │   ├── task.py              # ✅ Phase II (maintained)
│   │   ├── conversation.py      # ⭐ NEW - Conversation model
│   │   └── message.py           # ⭐ NEW - Message model
│   ├── api/
│   │   ├── auth/                # ✅ Phase II (maintained)
│   │   ├── tasks/               # ✅ Phase II (maintained)
│   │   └── chat/                # ⭐ NEW - Chat endpoint
│   │       ├── __init__.py
│   │       ├── routes.py        # POST /api/{user_id}/chat
│   │       └── schemas.py       # Request/response models
│   ├── mcp/                     # ⭐ NEW - MCP Server
│   │   ├── __init__.py
│   │   ├── server.py            # MCP server initialization
│   │   └── tools.py             # 5 MCP tools implementation
│   ├── agent/                   # ⭐ NEW - OpenAI Agent
│   │   ├── __init__.py
│   │   ├── config.py            # Agent configuration
│   │   └── runner.py            # Agent execution logic
│   ├── services/
│   │   ├── task_service.py      # ✅ Phase II (maintained)
│   │   ├── user_service.py      # ✅ Phase II (maintained)
│   │   ├── conversation_service.py  # ⭐ NEW
│   │   └── message_service.py   # ⭐ NEW
│   ├── middleware/
│   │   ├── auth.py              # ✅ Phase II (maintained)
│   │   └── logging.py           # ✅ Phase II (maintained)
│   ├── database.py              # 📝 UPDATED - Add new models
│   ├── config/
│   │   └── settings.py          # 📝 UPDATED - Add OpenAI config
│   └── main.py                  # 📝 UPDATED - Include chat router
└── tests/
    ├── unit/
    │   ├── test_mcp_tools.py    # ⭐ NEW
    │   └── test_agent.py        # ⭐ NEW
    ├── integration/
    │   └── test_chat_api.py     # ⭐ NEW
    └── contract/
        └── test_stateless.py    # ⭐ NEW - Verify stateless design

# Frontend Structure (Next.js 16+)
frontend/
├── app/
│   ├── (auth)/                  # ✅ Phase II (maintained)
│   ├── dashboard/               # ✅ Phase II (maintained)
│   └── chat/                    # ⭐ NEW - Chat interface
│       ├── page.tsx             # Chat page component
│       └── layout.tsx           # Chat layout
├── components/
│   ├── ui/                      # ✅ Phase II (maintained)
│   ├── tasks/                   # ✅ Phase II (maintained)
│   └── chat/                    # ⭐ NEW
│       ├── ChatInterface.tsx    # Main chat component
│       ├── MessageList.tsx      # Message display
│       ├── MessageInput.tsx     # Input field
│       └── ConversationList.tsx # Conversation sidebar
├── lib/
│   ├── api/
│   │   ├── tasks.ts             # ✅ Phase II (maintained)
│   │   └── chat.ts              # ⭐ NEW - Chat API client
│   ├── auth/                    # ✅ Phase II (maintained)
│   └── hooks/
│       ├── useTasks.ts          # ✅ Phase II (maintained)
│       └── useChat.ts           # ⭐ NEW - Chat hook
└── types/
    ├── task.ts                  # ✅ Phase II (maintained)
    ├── conversation.ts          # ⭐ NEW
    └── message.ts               # ⭐ NEW
```

**Legend**:
- ✅ = Phase II (maintained)
- ⭐ = Phase III (new)
- 📝 = Updated for Phase III

**Structure Decision**: Web application structure (Option 2) selected. Backend and frontend are separate projects with clear API boundaries. This maintains Phase II architecture while adding new chat, MCP, and agent modules.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional requirements are satisfied.

## Phase 0: Research & Unknowns

**Status**: PENDING - Will be generated in research.md

### Research Tasks

1. **OpenAI Agents SDK Integration**
   - Research: How to initialize and configure OpenAI Agents SDK
   - Research: Agent runner execution patterns
   - Research: Tool registration and discovery
   - Research: Error handling and fallback strategies

2. **MCP Server Implementation**
   - Research: Official MCP SDK setup and configuration
   - Research: Tool definition schemas and validation
   - Research: MCP server lifecycle management
   - Research: Integration with FastAPI application

3. **Stateless Conversation Management**
   - Research: Efficient conversation history loading from DB
   - Research: Message context window management
   - Research: Pagination strategies for long conversations
   - Research: Performance optimization for history queries

4. **OpenAI ChatKit Integration**
   - Research: ChatKit component installation and setup
   - Research: Domain allowlist configuration
   - Research: Custom styling with Tailwind
   - Research: Event handling and state management

5. **Natural Language Processing**
   - Research: Prompt engineering for task management
   - Research: Intent classification patterns
   - Research: Entity extraction from user messages
   - Research: Fallback rule-based parsing

6. **Database Schema Design**
   - Research: Optimal indexing strategy for messages
   - Research: Foreign key cascade behavior
   - Research: Query optimization for conversation history
   - Research: Migration strategy from Phase II

7. **Security & Authorization**
   - Research: JWT validation in chat endpoint
   - Research: User_id enforcement in MCP tools
   - Research: Input sanitization best practices
   - Research: Rate limiting strategies

8. **Testing Strategy**
   - Research: Testing stateless architecture
   - Research: Mocking OpenAI API calls
   - Research: Integration testing with MCP tools
   - Research: End-to-end chat flow testing

**Output**: research.md with all findings and decisions

## Phase 1: Design & Contracts

**Status**: PENDING - Will be generated after Phase 0

### Deliverables

1. **data-model.md**
   - Conversation entity (fields, relationships, validation)
   - Message entity (fields, relationships, validation)
   - State transitions (conversation lifecycle)
   - Database indexes and constraints

2. **contracts/chat-api.yaml**
   - POST /api/{user_id}/chat endpoint specification
   - Request schema (conversation_id?, message)
   - Response schema (conversation_id, response, tool_calls?)
   - Error responses (401, 403, 500)

3. **contracts/mcp-tools.yaml**
   - add_task tool definition
   - list_tasks tool definition
   - complete_task tool definition
   - delete_task tool definition
   - update_task tool definition

4. **quickstart.md**
   - Development environment setup
   - OpenAI API key configuration
   - Database migration steps
   - Running the chat endpoint
   - Testing with ChatKit UI

5. **Agent Context Update**
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
   - Add Phase III technologies to agent context
   - Preserve manual additions

**Output**: Complete design artifacts ready for implementation

## Implementation Phases

### Phase 1: Database Schema Extension
**Goal**: Extend database with Conversation and Message tables

**Tasks**:
1. Create Conversation model (SQLModel)
2. Create Message model (SQLModel)
3. Add foreign key relationships
4. Create database migration script
5. Update database.py to include new models
6. Test schema creation and relationships

**Acceptance Criteria**:
- Conversation table created with correct schema
- Message table created with correct schema
- Foreign keys enforce referential integrity
- Indexes created on user_id and conversation_id
- Migration script runs successfully

### Phase 2: MCP Server Implementation
**Goal**: Implement stateless MCP server with 5 task tools

**Tasks**:
1. Install Official MCP SDK
2. Create MCP server initialization (backend/src/mcp/server.py)
3. Implement add_task tool
4. Implement list_tasks tool
5. Implement complete_task tool
6. Implement delete_task tool
7. Implement update_task tool
8. Add user_id validation to all tools
9. Write unit tests for each tool

**Acceptance Criteria**:
- MCP server initializes successfully
- All 5 tools registered and discoverable
- Tools enforce user_id ownership
- Tools return structured responses
- Unit tests pass with 100% coverage

### Phase 3: OpenAI Agent Integration
**Goal**: Integrate OpenAI Agents SDK for natural language understanding

**Tasks**:
1. Install OpenAI Agents SDK
2. Create agent configuration (backend/src/agent/config.py)
3. Implement agent runner (backend/src/agent/runner.py)
4. Register MCP tools with agent
5. Configure agent personality and behavior
6. Implement error handling and fallbacks
7. Write unit tests for agent execution

**Acceptance Criteria**:
- Agent initializes with OpenAI API key
- Agent discovers and uses MCP tools
- Agent produces natural language responses
- Error handling works gracefully
- Unit tests pass

### Phase 4: Stateless Chat API Endpoint
**Goal**: Create stateless FastAPI endpoint for chat

**Tasks**:
1. Create chat router (backend/src/api/chat/routes.py)
2. Create request/response schemas (backend/src/api/chat/schemas.py)
3. Implement POST /api/{user_id}/chat endpoint
4. Add JWT authentication dependency
5. Implement conversation history loading
6. Implement message persistence
7. Integrate agent execution
8. Add error handling and logging
9. Write integration tests

**Acceptance Criteria**:
- Endpoint requires valid JWT token
- Endpoint loads conversation history from DB
- Endpoint stores user message before processing
- Endpoint executes agent with MCP tools
- Endpoint stores assistant response
- Endpoint returns response to client
- Server remains stateless (verified by restart test)
- Integration tests pass

### Phase 5: Conversation & Message Services
**Goal**: Create service layer for conversation management

**Tasks**:
1. Create conversation_service.py
2. Implement create_conversation()
3. Implement get_conversation()
4. Implement list_user_conversations()
5. Create message_service.py
6. Implement add_message()
7. Implement get_conversation_messages()
8. Add user_id filtering to all queries
9. Write unit tests

**Acceptance Criteria**:
- Services enforce user_id isolation
- Services handle database errors gracefully
- Services return typed responses
- Unit tests pass with 100% coverage

### Phase 6: ChatKit Frontend Integration
**Goal**: Integrate OpenAI ChatKit UI in Next.js frontend

**Tasks**:
1. Install OpenAI ChatKit package
2. Create chat page (frontend/app/chat/page.tsx)
3. Create ChatInterface component
4. Create MessageList component
5. Create MessageInput component
6. Create ConversationList component
7. Implement chat API client (frontend/lib/api/chat.ts)
8. Create useChat hook
9. Add JWT token to all chat requests
10. Implement error handling and loading states
11. Style with Tailwind CSS
12. Write component tests

**Acceptance Criteria**:
- ChatKit component renders correctly
- Messages display in chronological order
- User can send messages
- Assistant responses appear
- JWT token included in all requests
- Error states handled gracefully
- Loading states displayed
- Responsive design works on mobile
- Component tests pass

### Phase 7: Security & Authentication Validation
**Goal**: Ensure security requirements are met

**Tasks**:
1. Verify JWT validation on chat endpoint
2. Verify user_id enforcement in MCP tools
3. Implement input sanitization
4. Implement XSS prevention on responses
5. Add rate limiting (optional)
6. Implement audit logging
7. Verify OpenAI API key security
8. Write security tests

**Acceptance Criteria**:
- Unauthorized requests return 401
- Cross-user access attempts return 403
- Input sanitization prevents injection
- XSS prevention works on AI responses
- Audit logs capture metadata only
- OpenAI API key never exposed
- Security tests pass

### Phase 8: Testing & Validation
**Goal**: Comprehensive testing of Phase III features

**Tasks**:
1. Write stateless architecture test (restart verification)
2. Write end-to-end chat flow test
3. Write natural language understanding tests
4. Write conversation history tests
5. Write multi-user isolation tests
6. Perform manual testing
7. Fix any discovered issues

**Acceptance Criteria**:
- Stateless test passes (server restart doesn't lose state)
- E2E test covers full chat flow
- NLU tests verify intent recognition
- History tests verify correct loading
- Isolation tests verify no cross-user access
- All tests pass
- Manual testing confirms functionality

### Phase 9: Deployment Strategy
**Goal**: Deploy Phase III to production

**Tasks**:
1. Update environment variables documentation
2. Configure OpenAI API key in production
3. Run database migrations
4. Configure ChatKit domain allowlist
5. Deploy backend to production
6. Deploy frontend to production
7. Verify production functionality
8. Monitor for errors

**Acceptance Criteria**:
- Environment variables documented
- Database migrations applied
- ChatKit domain allowlist configured
- Backend deployed successfully
- Frontend deployed successfully
- Production chat works end-to-end
- No errors in production logs

## Risk Analysis

### Top 3 Risks

1. **OpenAI API Rate Limits**
   - **Impact**: Users may experience delays or failures during high traffic
   - **Mitigation**: Implement request queuing, user-facing rate limit messages, consider caching common responses
   - **Blast Radius**: Per-user (rate limits are per API key)
   - **Kill Switch**: Fallback to rule-based parsing if API unavailable

2. **Stateless Architecture Complexity**
   - **Impact**: Loading conversation history on every request may cause latency
   - **Mitigation**: Optimize database queries, add indexes, implement pagination, limit context window
   - **Blast Radius**: All users (affects every chat request)
   - **Kill Switch**: Implement aggressive caching if performance degrades

3. **Natural Language Understanding Accuracy**
   - **Impact**: Agent may misinterpret user intent, leading to wrong actions
   - **Mitigation**: Implement confirmation prompts for destructive actions, provide undo functionality, extensive testing
   - **Blast Radius**: Per-user (isolated to individual conversations)
   - **Kill Switch**: Fallback to traditional UI if NLU fails repeatedly

## Non-Functional Requirements

### Performance
- Chat response latency: <2s p95 (including AI inference)
- Database query latency: <100ms p95
- Conversation history loading: <500ms for 100 messages
- Concurrent users: 100+ simultaneous conversations

### Reliability
- Uptime: 99.9% (excluding OpenAI API downtime)
- Error rate: <0.1% of requests
- Graceful degradation if OpenAI API unavailable

### Security
- JWT authentication on all endpoints
- User isolation at database level
- Input sanitization and XSS prevention
- Audit logging (metadata only)
- OpenAI API key security

### Scalability
- Horizontal scaling (stateless design)
- Database connection pooling
- Efficient query patterns
- Pagination for long conversations

## Follow-Up Tasks

1. **Phase 0**: Generate research.md with all findings
2. **Phase 1**: Generate data-model.md, contracts/, quickstart.md
3. **Phase 2**: Run `/sp.tasks` to generate tasks.md
4. **Implementation**: Execute tasks via Claude Code
5. **Testing**: Verify stateless architecture and security
6. **Deployment**: Deploy to production with monitoring

## ADR Suggestions

📋 **Architectural decisions detected** - Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`

Suggested ADRs:
1. **Stateless Server Architecture** - Why stateless vs stateful, tradeoffs, implementation approach
2. **MCP Tool Design** - Why 5 specific tools, tool granularity, composability strategy
3. **OpenAI Agents SDK vs Custom NLU** - Why OpenAI vs building custom, cost/accuracy tradeoffs
4. **Database Schema for Conversations** - Why separate Conversation/Message tables, indexing strategy
5. **ChatKit vs Custom Chat UI** - Why OpenAI ChatKit vs building custom, integration complexity

---

**Plan Status**: COMPLETE - Ready for Phase 0 (Research)
**Next Command**: Generate research.md to resolve all unknowns
**Branch**: 001-ai-chatbot-mcp
**Constitution Check**: ✅ PASS (all gates satisfied)
