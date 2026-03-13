# Feature Specification: AI-Powered Todo Chatbot

**Feature Branch**: `001-ai-chatbot-mcp`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "Transform the Phase II multi-user todo web application into an AI-powered conversational interface by integrating OpenAI Agents SDK and implementing Model Context Protocol (MCP) server architecture. Users will manage tasks through natural language while maintaining full Phase II functionality. The server will be stateless, persisting all conversation state to the database."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Tasks via Natural Language (Priority: P1)

Users can create new tasks by describing them in natural language without needing to fill out forms or click buttons. The system understands various phrasings and extracts task information automatically.

**Why this priority**: This is the foundational capability that demonstrates the chatbot's core value - making task creation faster and more intuitive than traditional UI forms.

**Independent Test**: Can be fully tested by sending natural language messages like "Add buy milk" or "I need to remember to pay bills" and verifying tasks are created with correct titles. Delivers immediate value by simplifying the most common user action.

**Acceptance Scenarios**:

1. **Given** user is authenticated and in chat interface, **When** user types "Add buy milk", **Then** system creates task with title "Buy milk" and confirms "I've added 'Buy milk' to your task list!"
2. **Given** user is authenticated, **When** user types "I need to remember to pay bills", **Then** system creates task with title "Pay bills" and provides confirmation
3. **Given** user types "Add buy milk and call mom", **When** system processes message, **Then** two separate tasks are created ("Buy milk" and "Call mom")
4. **Given** user provides task with description, **When** user types "Add buy milk - get organic from Whole Foods", **Then** system creates task with title "Buy milk" and description "get organic from Whole Foods"

---

### User Story 2 - List and Filter Tasks via Conversation (Priority: P1)

Users can view their tasks by asking in natural language, with support for filtering by status (all, pending, completed). The system presents tasks in a clear, numbered format.

**Why this priority**: Essential for users to see what they've created and understand their current workload. Part of the core MVP alongside task creation.

**Independent Test**: Can be tested by creating several tasks with different statuses, then asking "Show my tasks", "What's pending?", and "What have I completed?" to verify correct filtering and formatting.

**Acceptance Scenarios**:

1. **Given** user has 3 tasks (2 pending, 1 completed), **When** user types "Show my tasks", **Then** system displays all 3 tasks with numbers: "You have 3 tasks:\n1. Buy milk\n2. Call mom\n3. Pay bills"
2. **Given** user has mixed task statuses, **When** user types "What's pending?", **Then** system shows only incomplete tasks
3. **Given** user has completed tasks, **When** user types "What have I completed?", **Then** system shows only completed tasks with confirmation
4. **Given** user has no tasks, **When** user asks to see tasks, **Then** system responds "You don't have any tasks yet. Would you like to add one?"

---

### User Story 3 - Mark Tasks Complete via Natural Language (Priority: P2)

Users can mark tasks as complete by referencing them by number or description. The system provides encouraging feedback when tasks are completed.

**Why this priority**: Completing tasks is a core workflow, but users can still use the traditional UI for this. This enhances the experience but isn't required for basic chatbot functionality.

**Independent Test**: Can be tested by creating tasks, then marking them complete using "Mark task 3 as complete" or "I finished buying milk" and verifying status changes and confirmation messages.

**Acceptance Scenarios**:

1. **Given** user has task with ID 3, **When** user types "Mark task 3 as complete", **Then** system marks task complete and responds "Great! I've marked 'Buy milk' as complete. Well done!"
2. **Given** user has task titled "Buy milk", **When** user types "I finished buying milk", **Then** system finds task by description, marks complete, and provides encouraging confirmation
3. **Given** user references ambiguous task description, **When** multiple tasks match, **Then** system asks for clarification: "I found 2 tasks matching 'meeting'. Which one? 1. Team meeting, 2. Client meeting"
4. **Given** user tries to complete non-existent task, **When** system cannot find task, **Then** system responds "I couldn't find that task. Would you like to see your list?"

---

### User Story 4 - Delete Tasks via Conversation (Priority: P2)

Users can remove tasks by referencing them by number or description. The system asks for confirmation when the reference is ambiguous to prevent accidental deletions.

**Why this priority**: Task deletion is important but less frequent than creation or completion. Users can fall back to traditional UI if needed.

**Independent Test**: Can be tested by creating tasks, then deleting them using "Delete task 2" or "Delete the meeting task" and verifying removal and confirmation messages.

**Acceptance Scenarios**:

1. **Given** user has task with ID 2, **When** user types "Delete task 2", **Then** system removes task and confirms "I've deleted 'Call mom' from your list"
2. **Given** user references task by description, **When** user types "Delete the meeting task", **Then** system searches by description and asks for confirmation if ambiguous
3. **Given** multiple tasks match description, **When** system finds matches, **Then** system lists options and asks "Which one would you like to delete?"
4. **Given** user tries to delete non-existent task, **When** system cannot find task, **Then** system responds with helpful error message

---

### User Story 5 - Update Tasks via Natural Language (Priority: P3)

Users can modify existing tasks by changing titles or descriptions through conversational commands. The system supports partial updates (title only or description only).

**Why this priority**: Task updates are less common than other operations. This is a nice-to-have enhancement that improves the chatbot experience but isn't critical for MVP.

**Independent Test**: Can be tested by creating tasks, then updating them using "Change task 1 to 'Call mom tonight'" or "Update description of task 2" and verifying changes are applied.

**Acceptance Scenarios**:

1. **Given** user has task with ID 1, **When** user types "Change task 1 to 'Call mom tonight'", **Then** system updates title and confirms "I've updated task 1 to 'Call mom tonight'"
2. **Given** user wants to update description, **When** user types "Update description of task 2 to 'urgent - needs review'", **Then** system updates only description field
3. **Given** user references task by old title, **When** user types "Change 'buy milk' to 'buy organic milk'", **Then** system finds task and updates title
4. **Given** user tries to update non-existent task, **When** system cannot find task, **Then** system provides helpful error message

---

### User Story 6 - Access Chat Interface from Dashboard (Priority: P2)

Users can navigate between the traditional task management UI and the new chat interface seamlessly. Both interfaces remain fully functional and show the same data.

**Why this priority**: Navigation is essential for users to discover and use the chatbot, but the chatbot itself can function without perfect navigation initially.

**Independent Test**: Can be tested by navigating from dashboard to chat and back, verifying both UIs show the same tasks and that changes in one appear in the other.

**Acceptance Scenarios**:

1. **Given** user is on dashboard, **When** user clicks "Chat" link in header, **Then** user is taken to chat interface at /app/chat
2. **Given** user is in chat interface, **When** user clicks "Dashboard" link, **Then** user returns to traditional UI
3. **Given** user adds task in chat, **When** user navigates to dashboard, **Then** new task appears in traditional task list
4. **Given** user completes task in dashboard, **When** user returns to chat and asks "Show my tasks", **Then** task shows as completed

---

### User Story 7 - Maintain Conversation Context (Priority: P3)

Users can have multi-turn conversations where the system remembers previous messages and maintains context. Conversations persist across sessions and server restarts.

**Why this priority**: Context awareness improves the user experience but isn't required for basic task operations. Users can still accomplish all tasks without perfect context retention.

**Independent Test**: Can be tested by having a multi-turn conversation, restarting the server, then continuing the conversation and verifying history is preserved.

**Acceptance Scenarios**:

1. **Given** user starts conversation with "Add buy milk", **When** user follows up with "Also add call mom", **Then** system understands "also" refers to adding another task
2. **Given** user has ongoing conversation, **When** user closes browser and returns later, **Then** conversation history is preserved and displayed
3. **Given** server is restarted mid-conversation, **When** user sends next message, **Then** conversation continues without data loss
4. **Given** user asks follow-up question, **When** system has context from previous messages, **Then** system provides contextually relevant response

---

### Edge Cases

- What happens when user provides extremely long task titles (>200 characters)?
- How does system handle messages that are too long (>2000 characters)?
- What happens when user tries to chat without being authenticated?
- How does system respond to messages that don't match any task operation?
- What happens when database connection fails during conversation?
- How does system handle concurrent requests from same user?
- What happens when OpenAI API is unavailable or rate-limited?
- How does system handle typos and grammatical errors in natural language?
- What happens when user references task ID that belongs to another user?
- How does system handle multiple tool calls in single message (e.g., "add task and show list")?

## Requirements *(mandatory)*

### Functional Requirements

**Conversational Task Management**

- **FR-001**: System MUST accept natural language input for all 5 basic task operations (add, list, complete, delete, update)
- **FR-002**: System MUST understand at least 90% of common phrasings for task operations (e.g., "Add buy milk", "I need to remember to...", "Show my tasks", "What's pending?")
- **FR-003**: System MUST extract task titles from natural language with 1-200 character length validation
- **FR-004**: System MUST support optional task descriptions in natural language input
- **FR-005**: System MUST provide friendly, conversational confirmation messages for all operations
- **FR-006**: System MUST format task lists with clear numbering when displaying to users
- **FR-007**: System MUST support filtering tasks by status (all, pending, completed) via natural language
- **FR-008**: System MUST search tasks by description when user references task by content rather than ID
- **FR-009**: System MUST ask for clarification when multiple tasks match user's description
- **FR-010**: System MUST provide encouraging responses when users complete tasks

**Stateless Architecture**

- **FR-011**: System MUST persist all conversation state to database immediately after each message
- **FR-012**: System MUST NOT store conversation state in server memory between requests
- **FR-013**: System MUST load conversation history from database for each request (last 50 messages)
- **FR-014**: System MUST support server restart without losing any conversation data
- **FR-015**: System MUST support horizontal scaling with any server instance handling any request
- **FR-016**: System MUST complete full request cycle (receive, process, store, respond) within single HTTP request

**Chat Endpoint**

- **FR-017**: System MUST provide POST endpoint at /api/{user_id}/chat for all chat interactions
- **FR-018**: System MUST accept conversation_id (optional) and message (required, 1-2000 chars) in request
- **FR-019**: System MUST return conversation_id, response text, and optional tool_calls in response
- **FR-020**: System MUST validate JWT token on every chat request
- **FR-021**: System MUST verify URL user_id matches token user_id and return 403 on mismatch
- **FR-022**: System MUST return 400 for invalid requests (message too long, invalid format)
- **FR-023**: System MUST return 401 for missing or invalid JWT tokens
- **FR-024**: System MUST return 404 for non-existent conversation_id
- **FR-025**: System MUST return 500 for internal server errors with appropriate logging

**Tool Operations**

- **FR-026**: System MUST provide add_task tool accepting user_id, title (1-200 chars), and optional description
- **FR-027**: System MUST provide list_tasks tool accepting user_id and status filter (all/pending/completed)
- **FR-028**: System MUST provide complete_task tool accepting user_id and task_id
- **FR-029**: System MUST provide delete_task tool accepting user_id and task_id
- **FR-030**: System MUST provide update_task tool accepting user_id, task_id, and optional title/description
- **FR-031**: All tools MUST be stateless with no memory between calls
- **FR-032**: All tools MUST read/write directly to database
- **FR-033**: All tools MUST return structured responses with status and relevant data
- **FR-034**: All tools MUST verify user ownership before any operation
- **FR-035**: All tools MUST handle errors gracefully with descriptive messages

**Database Schema**

- **FR-036**: System MUST add conversations table with id, user_id, created_at, updated_at fields
- **FR-037**: System MUST add messages table with id, conversation_id, user_id, role, content, created_at fields
- **FR-038**: System MUST enforce foreign key relationships (conversations.user_id → users.id, messages.conversation_id → conversations.id)
- **FR-039**: System MUST configure cascading deletes (delete user → delete conversations → delete messages)
- **FR-040**: System MUST create indexes on user_id and conversation_id for query performance
- **FR-041**: System MUST enforce role constraint (user or assistant only) on messages table
- **FR-042**: System MUST auto-populate timestamps on all records

**Frontend Chat Interface**

- **FR-043**: System MUST provide chat page at /app/chat with full-height layout
- **FR-044**: System MUST display messages with distinct styling (user: right-aligned blue, assistant: left-aligned gray)
- **FR-045**: System MUST auto-scroll to latest message when new messages arrive
- **FR-046**: System MUST show typing indicator while waiting for response
- **FR-047**: System MUST support Enter key to send messages
- **FR-048**: System MUST display timestamps on all messages
- **FR-049**: System MUST show error messages inline when operations fail
- **FR-050**: System MUST disable input while message is being sent
- **FR-051**: System MUST provide navigation links between chat and dashboard
- **FR-052**: System MUST highlight active route in navigation
- **FR-053**: System MUST redirect unauthenticated users to login page
- **FR-054**: System MUST be responsive (desktop: max-width 4xl centered, mobile: full-width)

**Phase II Compatibility**

- **FR-055**: System MUST maintain all existing Phase II REST API endpoints (GET/POST/PUT/DELETE/PATCH tasks)
- **FR-056**: System MUST maintain traditional web UI with forms and buttons
- **FR-057**: System MUST use same authentication mechanism (Better Auth + JWT)
- **FR-058**: System MUST use same database (Neon PostgreSQL) with no changes to existing tables
- **FR-059**: System MUST ensure data consistency between chat and traditional UI (changes in one appear in other)
- **FR-060**: System MUST maintain user isolation (users only see their own tasks and conversations)

**AI Agent Behavior**

- **FR-061**: System MUST chain multiple tools in single turn when appropriate (e.g., add task then list tasks)
- **FR-062**: System MUST maintain conversation context across messages within same conversation
- **FR-063**: System MUST ask clarifying questions when user intent is ambiguous
- **FR-064**: System MUST provide friendly, non-technical responses to users
- **FR-065**: System MUST handle typos and grammatical errors in user input
- **FR-066**: System MUST remember previous messages in conversation for context

### Key Entities

- **Conversation**: Represents a chat session between user and AI assistant. Contains user_id (owner), created_at, updated_at timestamps. One user can have multiple conversations. Each conversation contains many messages.

- **Message**: Represents a single message in a conversation. Contains conversation_id (parent), user_id (owner), role (user or assistant), content (message text), created_at timestamp. Messages alternate between user and assistant roles within a conversation.

- **Task** (existing): Represents a todo item. Contains user_id (owner), title, description, completed status, created_at, updated_at timestamps. Accessed by both traditional UI and chat interface via MCP tools.

- **User** (existing): Represents an authenticated user. Contains authentication credentials and profile information. Owns tasks and conversations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create tasks via natural language in under 10 seconds (from typing to confirmation)
- **SC-002**: System achieves 90% or higher accuracy in understanding natural language task commands
- **SC-003**: Chat responses are delivered in under 3 seconds for 90% of requests
- **SC-004**: System supports 100+ concurrent conversations without performance degradation
- **SC-005**: Server restart test passes (conversation continues after restart with full history preserved)
- **SC-006**: All Phase II functionality remains working with no regressions (100% of existing tests pass)
- **SC-007**: Users can complete all 5 task operations (add, list, complete, delete, update) via chat interface
- **SC-008**: Data consistency maintained between chat and traditional UI (changes in one appear in other within 1 second)
- **SC-009**: System handles errors gracefully with user-friendly messages (no technical error details exposed)
- **SC-010**: Chat interface loads in under 2 seconds on initial page load
- **SC-011**: Conversation history loads in under 1 second (last 50 messages)
- **SC-012**: Each MCP tool executes in under 500ms
- **SC-013**: System prevents cross-user data access (users only see their own tasks and conversations)
- **SC-014**: Multi-tool chaining works correctly (e.g., "add task and show list" executes both operations)
- **SC-015**: Mobile-responsive chat interface works on all screen sizes

## Assumptions *(optional)*

- Users have completed Phase II implementation with working authentication and task management
- OpenAI API key is available and has sufficient quota for development and testing
- Neon PostgreSQL database is accessible and has capacity for new tables
- Users are familiar with basic chat interfaces and natural language interaction
- Network connectivity is reliable between frontend, backend, and external services
- Browser supports modern JavaScript features required by Next.js 16
- Users understand that chat is an alternative interface, not a replacement for traditional UI
- Development will use official OpenAI Agents SDK and Python MCP SDK
- All code will be generated via Claude Code following spec-driven development
- Performance targets assume reasonable hardware and network conditions

## Constraints *(optional)*

- Must use official OpenAI Agents SDK (no custom implementations)
- Must use official Python MCP SDK for tool implementation
- Must use gpt-4o model (no other models)
- Server must be completely stateless (no in-memory conversation state)
- Must maintain 100% backward compatibility with Phase II
- No changes allowed to existing database tables (users, tasks)
- Must support browser compatibility (Chrome, Firefox, Safari - last 2 versions)
- Message length limited to 2000 characters
- Task title limited to 200 characters
- Conversation history limited to last 50 messages per request
- Must use JWT authentication (same as Phase II)
- Must deploy to existing infrastructure (no new hosting requirements)
- All code must be generated via Claude Code (no manual coding)
- Must follow spec-driven development workflow (spec → plan → tasks → implement)

## Out of Scope *(optional)*

- Voice input/output for chat interface
- Multi-language support (English only for Phase III)
- Advanced NLP features beyond OpenAI's capabilities
- Custom AI model training or fine-tuning
- Real-time collaborative editing of tasks
- Push notifications for task updates
- Integration with external calendar or task management systems
- Advanced conversation management UI (list/search/delete conversations)
- Rate limiting implementation (optional for Phase III)
- Advanced error recovery mechanisms
- Markdown rendering in chat messages (optional)
- Message copy functionality (optional)
- Animated typing indicators (optional)
- Conversation export/import features
- Task attachments or file uploads via chat
- Bulk task operations via chat
- Task scheduling or reminders via chat
- Team collaboration features
- Admin dashboard for monitoring conversations
- Analytics and usage tracking

## Dependencies *(optional)*

- **Phase II Implementation**: Must be complete and functional with all features working
- **OpenAI API**: Requires valid API key with sufficient quota for gpt-4o model
- **Python MCP SDK**: Official SDK must be available and compatible with Python version
- **OpenAI Agents SDK**: Official Python package must be available
- **Neon PostgreSQL**: Database must be accessible and have capacity for new tables
- **Better Auth**: Existing authentication system must continue working
- **Next.js 16**: Frontend framework must support App Router and required features
- **FastAPI**: Backend framework must support async operations and middleware
- **SQLModel**: ORM must support new table definitions and relationships

## Related Features *(optional)*

- Phase II: Full-Stack Web Application (prerequisite)
- Phase I: Console Todo Application (foundation)
- Phase IV: Kubernetes Deployment (future)
- Phase V: Advanced Features + Kafka (future)

## Clarifications

### Session 2026-02-28

- Q: When the OpenAI API is unavailable or returns an error, how should the system respond to users? → A: Queue the message in database, retry automatically, notify user of delay


## Notes *(optional)*

- This feature represents a significant architectural shift from traditional request-response to conversational AI
- Stateless architecture is critical for horizontal scaling and reliability
- The 9-step request cycle must be strictly followed to ensure statelessness
- All conversation state must be persisted to database immediately
- Server restart test is the definitive validation of stateless architecture
- Natural language understanding accuracy target (90%) may require iterative prompt engineering
- Performance targets assume reasonable OpenAI API response times
- Phase II compatibility is non-negotiable - all existing features must continue working
- The chat interface is an enhancement, not a replacement for traditional UI
- Users should be able to seamlessly switch between chat and traditional UI
- Error handling must be user-friendly (no technical jargon or stack traces)
- Security is paramount - JWT validation on every request, user isolation enforced
- Database indexes are critical for performance with conversation history queries
- The feature should be developed incrementally following user story priorities
- Each user story should be independently testable and deployable
- Success criteria focus on user experience and system reliability, not implementation details

---

## Agent & Skill Architecture *(Phase III specific)*

### Overview

Phase III extends Phase II by adding AI chatbot capabilities while maintaining strict separation of concerns through specialized agents and skills. Each agent owns a specific domain and invokes skills to perform concrete operations.

**CRITICAL REQUIREMENT**: All agents and skills from Phase II MUST be reused and extended. No new implementations of existing functionality are allowed.

### Agents from Phase II (must continue to be used)

1. **Auth Agent** - Handles secure authentication flows, Better Auth configuration, JWT lifecycle management
   - Owns: User signup/signin flows, session management, token generation/validation
   - Invokes: Auth Skill for concrete operations
   - Phase III extension: Validates JWT tokens on chat endpoint requests

2. **Database Agent** - Manages Neon PostgreSQL schema, models, connections, migrations
   - Owns: Schema design, table creation, relationship management, migration scripts
   - Invokes: Database Skill for concrete operations
   - Phase III extension: Creates conversations and messages tables, manages indexes

3. **FastAPI Backend Agent** - Owns all backend routes, validation, auth integration, database interaction
   - Owns: REST API endpoints, request/response validation, middleware, error handling
   - Invokes: Backend Skill for concrete operations
   - Phase III extension: Implements /api/{user_id}/chat endpoint, integrates MCP tools

4. **Frontend Agent** - Builds responsive Next.js UI, components, Tailwind styling, API calls
   - Owns: UI components, page layouts, client-side routing, API client
   - Invokes: Frontend Skill for concrete operations
   - Phase III extension: Creates chat interface at /app/chat, implements message display

### Skills from Phase II (must be explicitly invoked by agents)

1. **Auth Skill** - Signup/signin, password hashing, JWT tokens, Better Auth integration
   - Operations: Hash passwords, generate JWT tokens, verify tokens, manage sessions
   - Used by: Auth Agent, FastAPI Backend Agent
   - Phase III extension: Validates JWT on every chat request

2. **Database Skill** - Create tables, migrations, schema design, model definitions
   - Operations: Define SQLModel models, create migrations, execute DDL, manage indexes
   - Used by: Database Agent
   - Phase III extension: Creates conversations and messages tables with proper relationships

3. **Backend Skill** - Generate routes, handle requests/responses, DB connection, JWT verification (JWKS)
   - Operations: Define FastAPI routes, validate requests, connect to database, verify JWT
   - Used by: FastAPI Backend Agent
   - Phase III extension: Implements chat endpoint, integrates OpenAI Agents SDK

4. **Frontend Skill** - Build pages/components, Tailwind styling, API client with token attachment, protected routes
   - Operations: Create React components, style with Tailwind, make authenticated API calls
   - Used by: Frontend Agent
   - Phase III extension: Builds chat UI, implements message display, handles real-time updates

### New Agents for Phase III

5. **Backend Debugger Agent** - Diagnoses and resolves backend errors, stack traces, runtime exceptions
   - Owns: Error analysis, debugging, log interpretation, fix implementation
   - Invokes: Backend Skill for fixes
   - Phase III specific: Handles OpenAI API errors, MCP tool failures, database connection issues

### Agent Collaboration Pattern

```
User Request → Frontend Agent → API Call → FastAPI Backend Agent → Auth Agent (validate JWT)
                                                ↓
                                         OpenAI Agents SDK
                                                ↓
                                         MCP Tools (stateless)
                                                ↓
                                         Database Agent → Database Skill
                                                ↓
                                         Response → Frontend Agent → User
```

### Skill Invocation Rules

- Agents MUST invoke skills for concrete operations (no direct implementation)
- Skills MUST be stateless and reusable across agents
- Skills MUST return structured responses (success/failure with data/error)
- Skills MUST handle errors gracefully and return descriptive messages
- Skills MUST validate inputs before performing operations

---

## MCP Tools Full Specification *(Phase III specific)*

### Overview

Model Context Protocol (MCP) tools are stateless functions that the OpenAI agent can call to perform task operations. Each tool reads from and writes to the database directly, with no memory between calls.

### Tool 1: add_task

**Purpose**: Create a new task for the authenticated user

**Input Schema**:
```json
{
  "user_id": "string (UUID, required)",
  "title": "string (1-200 chars, required)",
  "description": "string (optional, max 1000 chars)"
}
```

**Output Schema**:
```json
{
  "status": "success | error",
  "task_id": "string (UUID, on success)",
  "message": "string (confirmation or error message)"
}
```

**Behavior**:
1. Validate user_id matches authenticated user
2. Validate title length (1-200 characters)
3. Validate description length if provided (max 1000 characters)
4. Create task record in database with user_id, title, description, completed=false
5. Return task_id and confirmation message

**Error Conditions**:
- Invalid user_id: Return 403 Forbidden
- Title too long/short: Return 400 Bad Request
- Database error: Return 500 Internal Server Error

**Example Usage**:
```
User: "Add buy milk"
Agent calls: add_task(user_id="123", title="Buy milk")
Response: {"status": "success", "task_id": "456", "message": "Task created"}
```

---

### Tool 2: list_tasks

**Purpose**: Retrieve tasks for the authenticated user with optional status filtering

**Input Schema**:
```json
{
  "user_id": "string (UUID, required)",
  "status": "string (all | pending | completed, default: all)"
}
```

**Output Schema**:
```json
{
  "status": "success | error",
  "tasks": [
    {
      "id": "string (UUID)",
      "title": "string",
      "description": "string | null",
      "completed": "boolean",
      "created_at": "string (ISO 8601)"
    }
  ],
  "count": "integer",
  "message": "string (optional)"
}
```

**Behavior**:
1. Validate user_id matches authenticated user
2. Query database for tasks belonging to user_id
3. Filter by status if specified (pending: completed=false, completed: completed=true)
4. Return tasks ordered by created_at descending
5. Include count of tasks returned

**Error Conditions**:
- Invalid user_id: Return 403 Forbidden
- Invalid status value: Return 400 Bad Request
- Database error: Return 500 Internal Server Error

**Example Usage**:
```
User: "Show my pending tasks"
Agent calls: list_tasks(user_id="123", status="pending")
Response: {"status": "success", "tasks": [...], "count": 5}
```

---

### Tool 3: complete_task

**Purpose**: Mark a task as completed for the authenticated user

**Input Schema**:
```json
{
  "user_id": "string (UUID, required)",
  "task_id": "string (UUID, required)"
}
```

**Output Schema**:
```json
{
  "status": "success | error",
  "task": {
    "id": "string (UUID)",
    "title": "string",
    "completed": "boolean (true)"
  },
  "message": "string (confirmation or error message)"
}
```

**Behavior**:
1. Validate user_id matches authenticated user
2. Query database for task with task_id
3. Verify task belongs to user_id (return 403 if not)
4. Update task.completed = true
5. Return updated task and confirmation message

**Error Conditions**:
- Invalid user_id: Return 403 Forbidden
- Task not found: Return 404 Not Found
- Task belongs to different user: Return 403 Forbidden
- Database error: Return 500 Internal Server Error

**Example Usage**:
```
User: "Mark task 3 as complete"
Agent calls: complete_task(user_id="123", task_id="456")
Response: {"status": "success", "task": {...}, "message": "Task completed"}
```

---

### Tool 4: delete_task

**Purpose**: Delete a task for the authenticated user

**Input Schema**:
```json
{
  "user_id": "string (UUID, required)",
  "task_id": "string (UUID, required)"
}
```

**Output Schema**:
```json
{
  "status": "success | error",
  "message": "string (confirmation or error message)"
}
```

**Behavior**:
1. Validate user_id matches authenticated user
2. Query database for task with task_id
3. Verify task belongs to user_id (return 403 if not)
4. Delete task record from database
5. Return confirmation message

**Error Conditions**:
- Invalid user_id: Return 403 Forbidden
- Task not found: Return 404 Not Found
- Task belongs to different user: Return 403 Forbidden
- Database error: Return 500 Internal Server Error

**Example Usage**:
```
User: "Delete task 2"
Agent calls: delete_task(user_id="123", task_id="456")
Response: {"status": "success", "message": "Task deleted"}
```

---

### Tool 5: update_task

**Purpose**: Update task title and/or description for the authenticated user

**Input Schema**:
```json
{
  "user_id": "string (UUID, required)",
  "task_id": "string (UUID, required)",
  "title": "string (1-200 chars, optional)",
  "description": "string (max 1000 chars, optional)"
}
```

**Output Schema**:
```json
{
  "status": "success | error",
  "task": {
    "id": "string (UUID)",
    "title": "string",
    "description": "string | null",
    "completed": "boolean"
  },
  "message": "string (confirmation or error message)"
}
```

**Behavior**:
1. Validate user_id matches authenticated user
2. Query database for task with task_id
3. Verify task belongs to user_id (return 403 if not)
4. Validate title length if provided (1-200 characters)
5. Validate description length if provided (max 1000 characters)
6. Update task with provided fields (partial update supported)
7. Return updated task and confirmation message

**Error Conditions**:
- Invalid user_id: Return 403 Forbidden
- Task not found: Return 404 Not Found
- Task belongs to different user: Return 403 Forbidden
- Title too long/short: Return 400 Bad Request
- No fields provided: Return 400 Bad Request
- Database error: Return 500 Internal Server Error

**Example Usage**:
```
User: "Change task 1 to 'Call mom tonight'"
Agent calls: update_task(user_id="123", task_id="456", title="Call mom tonight")
Response: {"status": "success", "task": {...}, "message": "Task updated"}
```

---

### MCP Tool Implementation Requirements

- **Stateless**: No memory between tool calls, all state in database
- **Idempotent**: Same input produces same output (where applicable)
- **Fast**: Execute in under 500ms
- **Secure**: Validate user ownership on every operation
- **Descriptive**: Return clear error messages for all failure cases
- **Structured**: Use consistent response format across all tools
- **Logged**: Log all tool calls with user_id, tool name, and outcome

---

## Chat Flow (Stateless Cycle) *(Phase III specific)*

### 9-Step Stateless Request Cycle

Every chat request follows this exact cycle to ensure complete statelessness:

**Step 1: Receive Request**
- Frontend sends POST to /api/{user_id}/chat
- Request includes: conversation_id (optional), message (required), JWT token (header)

**Step 2: Validate Authentication**
- Extract JWT token from Authorization header
- Verify token signature using Better Auth JWKS
- Extract user_id from token payload
- Verify URL user_id matches token user_id
- Return 401 if token invalid, 403 if user_id mismatch

**Step 3: Load Conversation History**
- If conversation_id provided: Load existing conversation from database
- If conversation_id not provided: Create new conversation record
- Load last 50 messages from messages table for this conversation
- Order messages by created_at ascending
- Format messages as OpenAI chat history (role: user/assistant, content: text)

**Step 4: Store User Message**
- Create new message record in database
- Fields: conversation_id, user_id, role="user", content=message, created_at=now()
- Commit to database immediately

**Step 5: Call OpenAI Agents SDK**
- Initialize OpenAI agent with gpt-4o model
- Provide conversation history (last 50 messages)
- Provide MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Pass user_id to all tool calls for security
- Wait for agent response (max 30 seconds timeout)

**Step 6: Execute Tool Calls**
- Agent may call 0 or more MCP tools
- Each tool call is stateless and reads/writes database directly
- Tools validate user ownership before any operation
- Tools return structured responses (success/error with data)
- Agent uses tool responses to formulate final answer

**Step 7: Store Assistant Response**
- Create new message record in database
- Fields: conversation_id, user_id, role="assistant", content=agent_response, created_at=now()
- Commit to database immediately

**Step 8: Return Response**
- Return JSON response to frontend
- Include: conversation_id, response text, tool_calls (optional)
- HTTP 200 on success

**Step 9: Cleanup**
- Release all resources (database connections, OpenAI client)
- No state retained in server memory
- Server is ready for next request (any conversation, any user)

### Statelessness Validation

The server restart test validates statelessness:
1. User starts conversation, sends message
2. Server processes and responds
3. Server is restarted (kill process, start new process)
4. User sends follow-up message in same conversation
5. New server instance loads history from database
6. Conversation continues seamlessly with full context

**Pass Criteria**: User cannot tell server was restarted, full history preserved

---

## Database Models *(Phase III specific)*

### Conversations Table

**Purpose**: Represents a chat session between user and AI assistant

**Schema**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)
    user: "User" = Relationship(back_populates="conversations")
```

**Constraints**:
- user_id must reference existing user
- Cascade delete: deleting user deletes all conversations
- Index on user_id for fast user conversation queries

---

### Messages Table

**Purpose**: Represents a single message in a conversation (user or assistant)

**Schema**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    role: str = Field(nullable=False, sa_column=Column(String(20), CheckConstraint("role IN ('user', 'assistant')")))
    content: str = Field(nullable=False, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="messages")
```

**Constraints**:
- conversation_id must reference existing conversation
- user_id must reference existing user
- role must be 'user' or 'assistant' (enforced by CHECK constraint)
- content cannot be empty
- Cascade delete: deleting conversation deletes all messages
- Indexes on conversation_id, user_id, created_at for fast queries

---

### Existing Tables (Phase II - no changes)

**Users Table**: No changes required, existing schema maintained

**Tasks Table**: No changes required, existing schema maintained

---

## Chat Endpoint Contract *(Phase III specific)*

### POST /api/{user_id}/chat

**Purpose**: Send a message to the AI chatbot and receive a response

**Authentication**: Required (JWT token in Authorization header)

**Request**:
```
POST /api/{user_id}/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "conversation_id": "uuid (optional, omit for new conversation)",
  "message": "string (1-2000 chars, required)"
}
```

**Response (Success - 200 OK)**:
```json
{
  "conversation_id": "uuid",
  "response": "string (assistant's response)",
  "tool_calls": [
    {
      "tool": "string (tool name)",
      "input": "object (tool input)",
      "output": "object (tool output)"
    }
  ],
  "timestamp": "string (ISO 8601)"
}
```

**Response (Bad Request - 400)**:
```json
{
  "error": "string (error message)",
  "details": "string (specific validation error)"
}
```

**Response (Unauthorized - 401)**:
```json
{
  "error": "Unauthorized",
  "details": "Missing or invalid JWT token"
}
```

**Response (Forbidden - 403)**:
```json
{
  "error": "Forbidden",
  "details": "User ID in URL does not match authenticated user"
}
```

**Response (Not Found - 404)**:
```json
{
  "error": "Not Found",
  "details": "Conversation not found or does not belong to user"
}
```

**Response (Internal Server Error - 500)**:
```json
{
  "error": "Internal Server Error",
  "details": "string (generic error message, no stack traces)"
}
```

**Validation Rules**:
- JWT token must be valid and not expired
- URL user_id must match token user_id
- message must be 1-2000 characters
- conversation_id must exist and belong to user (if provided)
- Request must be valid JSON

**Performance Requirements**:
- Response time: < 3 seconds for 90% of requests
- Timeout: 30 seconds maximum
- Concurrent requests: Support 100+ simultaneous conversations

**Security Requirements**:
- Validate JWT on every request
- Verify user ownership of conversation
- Sanitize user input to prevent injection attacks
- Log all requests with user_id and outcome
- Rate limit: 60 requests per minute per user (optional for Phase III)

---

## Deliverables Checklist *(Phase III specific)*

### Backend Deliverables

- [ ] **Database Schema**
  - [ ] Create conversations table with proper indexes
  - [ ] Create messages table with proper indexes
  - [ ] Add foreign key relationships and cascade deletes
  - [ ] Create migration script for schema changes
  - [ ] Test migration on development database

- [ ] **MCP Tools Implementation**
  - [ ] Implement add_task tool with validation
  - [ ] Implement list_tasks tool with filtering
  - [ ] Implement complete_task tool with ownership check
  - [ ] Implement delete_task tool with ownership check
  - [ ] Implement update_task tool with partial update support
  - [ ] Add error handling to all tools
  - [ ] Add logging to all tool calls

- [ ] **Chat Endpoint**
  - [ ] Implement POST /api/{user_id}/chat endpoint
  - [ ] Add JWT validation middleware
  - [ ] Add user_id verification logic
  - [ ] Integrate OpenAI Agents SDK
  - [ ] Implement 9-step stateless cycle
  - [ ] Add conversation history loading (last 50 messages)
  - [ ] Add message persistence logic
  - [ ] Add error handling and logging
  - [ ] Add request/response validation

- [ ] **OpenAI Integration**
  - [ ] Install OpenAI Agents SDK
  - [ ] Configure gpt-4o model
  - [ ] Register MCP tools with agent
  - [ ] Implement tool call handling
  - [ ] Add timeout handling (30 seconds)
  - [ ] Add error handling for API failures

- [ ] **Testing**
  - [ ] Unit tests for each MCP tool
  - [ ] Integration tests for chat endpoint
  - [ ] Server restart test (statelessness validation)
  - [ ] Concurrent conversation test
  - [ ] Error handling tests
  - [ ] Performance tests (response time < 3s)

### Frontend Deliverables

- [ ] **Chat Interface**
  - [ ] Create /app/chat page with full-height layout
  - [ ] Implement message display (user: right blue, assistant: left gray)
  - [ ] Add message input with Enter key support
  - [ ] Add auto-scroll to latest message
  - [ ] Add typing indicator while waiting
  - [ ] Add timestamp display on messages
  - [ ] Add error message display
  - [ ] Add input disable while sending
  - [ ] Make responsive (desktop: max-width 4xl, mobile: full-width)

- [ ] **API Client**
  - [ ] Create chat API client with JWT token attachment
  - [ ] Implement POST /api/{user_id}/chat call
  - [ ] Add error handling for all response codes
  - [ ] Add loading state management
  - [ ] Add conversation_id persistence

- [ ] **Navigation**
  - [ ] Add "Chat" link to header/navigation
  - [ ] Add "Dashboard" link in chat interface
  - [ ] Highlight active route
  - [ ] Ensure protected routes (redirect to login if not authenticated)

- [ ] **Testing**
  - [ ] Component tests for chat UI
  - [ ] Integration tests for API client
  - [ ] E2E tests for full chat flow
  - [ ] Responsive design tests (mobile/desktop)
  - [ ] Accessibility tests

### Documentation Deliverables

- [ ] **API Documentation**
  - [ ] Document chat endpoint contract
  - [ ] Document MCP tools specification
  - [ ] Document error codes and messages
  - [ ] Document authentication requirements

- [ ] **Architecture Documentation**
  - [ ] Document stateless architecture
  - [ ] Document 9-step request cycle
  - [ ] Document agent and skill architecture
  - [ ] Document database schema

- [ ] **User Documentation**
  - [ ] Document how to use chat interface
  - [ ] Document natural language commands
  - [ ] Document error messages and troubleshooting

### Deployment Deliverables

- [ ] **Environment Configuration**
  - [ ] Add OPENAI_API_KEY to .env
  - [ ] Add OPENAI_MODEL=gpt-4o to .env
  - [ ] Update database connection string if needed

- [ ] **Database Migration**
  - [ ] Run migration script on production database
  - [ ] Verify tables created successfully
  - [ ] Verify indexes created successfully

- [ ] **Deployment**
  - [ ] Deploy backend with new chat endpoint
  - [ ] Deploy frontend with chat interface
  - [ ] Verify Phase II functionality still works
  - [ ] Run server restart test in production

---

## Phase II References *(Phase III specific)*

### Phase II Specification

- **Location**: `specs/[phase-ii-feature-number]-todo-full-stack/spec.md`
- **Key Sections**:
  - User authentication with Better Auth
  - Task CRUD operations
  - Database schema (users, tasks tables)
  - REST API endpoints
  - Frontend UI components

### Phase II Agents (must be reused)

1. **Auth Agent** - `specs/[phase-ii-feature-number]-todo-full-stack/agents/auth-agent.md`
2. **Database Agent** - `specs/[phase-ii-feature-number]-todo-full-stack/agents/database-agent.md`
3. **FastAPI Backend Agent** - `specs/[phase-ii-feature-number]-todo-full-stack/agents/backend-agent.md`
4. **Frontend Agent** - `specs/[phase-ii-feature-number]-todo-full-stack/agents/frontend-agent.md`

### Phase II Skills (must be reused)

1. **Auth Skill** - `specs/[phase-ii-feature-number]-todo-full-stack/skills/auth-skill.md`
2. **Database Skill** - `specs/[phase-ii-feature-number]-todo-full-stack/skills/database-skill.md`
3. **Backend Skill** - `specs/[phase-ii-feature-number]-todo-full-stack/skills/backend-skill.md`
4. **Frontend Skill** - `specs/[phase-ii-feature-number]-todo-full-stack/skills/frontend-skill.md`

### Phase II Database Schema (must not be modified)

**Users Table**:
- id (UUID, primary key)
- email (string, unique)
- password_hash (string)
- created_at (timestamp)
- updated_at (timestamp)

**Tasks Table**:
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- title (string, 1-200 chars)
- description (string, optional)
- completed (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

### Phase II API Endpoints (must remain functional)

- POST /api/auth/signup - User registration
- POST /api/auth/signin - User login
- GET /api/{user_id}/tasks - List all tasks
- POST /api/{user_id}/tasks - Create task
- GET /api/{user_id}/tasks/{task_id} - Get task details
- PUT /api/{user_id}/tasks/{task_id} - Update task
- PATCH /api/{user_id}/tasks/{task_id} - Partial update task
- DELETE /api/{user_id}/tasks/{task_id} - Delete task

### Phase II Frontend Routes (must remain functional)

- /auth/signup - Registration page
- /auth/signin - Login page
- /app/dashboard - Task management UI
- /app/tasks - Task list view
- /app/tasks/[id] - Task detail view

### Integration Points

Phase III integrates with Phase II at these points:

1. **Authentication**: Reuses Better Auth JWT tokens for chat endpoint
2. **Database**: Adds conversations and messages tables, references existing users table
3. **Task Operations**: MCP tools call same database operations as Phase II REST API
4. **Frontend**: Chat interface coexists with traditional UI, shares navigation
5. **User Isolation**: Same user_id validation logic ensures data security

### Backward Compatibility Requirements

- All Phase II endpoints must continue working without modification
- All Phase II frontend routes must remain accessible
- All Phase II database tables must remain unchanged
- All Phase II authentication flows must continue working
- Data created in Phase II must be accessible in Phase III (tasks visible in chat)
- Data created in Phase III must be accessible in Phase II (tasks created via chat visible in dashboard)
