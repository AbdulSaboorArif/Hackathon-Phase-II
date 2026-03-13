# Tasks: AI-Powered Todo Chatbot with MCP Architecture

**Feature**: 001-ai-chatbot-mcp
**Branch**: `001-ai-chatbot-mcp`
**Input**: Design documents from `/specs/001-ai-chatbot-mcp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [x] T001 Install backend dependencies: fastapi, sqlmodel, asyncpg, python-jose, openai, fastmcp in backend/requirements.txt
- [x] T002 [P] Install frontend dependencies: @openai/chatkit, axios, date-fns in frontend/package.json
- [x] T003 [P] Configure environment variables: Add OPENAI_API_KEY, DATABASE_URL, BETTER_AUTH_SECRET to backend/.env.example
- [x] T004 [P] Update backend/src/config/settings.py to load OpenAI API key and validate required environment variables
- [x] T005 [P] Create backend/src/utils/logger.py for structured logging with user_id and conversation_id context

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema Extension

- [x] T006 Create Conversation model in backend/src/models/conversation.py with SQLModel (id, user_id, created_at, updated_at)
- [x] T007 Create Message model in backend/src/models/message.py with SQLModel (id, conversation_id, user_id, role, content, created_at)
- [x] T008 Update backend/src/database.py to import and register Conversation and Message models
- [x] T009 Create database migration script in backend/migrations/001_add_conversation_tables.sql with CREATE TABLE statements and indexes
- [ ] T010 Run migration to create conversations and messages tables in Neon PostgreSQL database (⚠️ Requires live database connection - manual step)

### MCP Server Foundation

- [x] T011 Create MCP server initialization in backend/src/mcp/server.py using FastMCP framework
- [x] T012 Create MCP tool base class in backend/src/mcp/base.py with user_id validation and error handling
- [x] T013 [P] Create backend/src/services/conversation_service.py with create_conversation, get_conversation, list_conversations methods
- [x] T014 [P] Create backend/src/services/message_service.py with add_message, get_messages, get_conversation_history methods

### OpenAI Agent Integration

- [x] T015 Create agent configuration in backend/src/agent/config.py with OpenAI API key, model selection (gpt-4o), and system prompt
- [x] T016 Create agent runner in backend/src/agent/runner.py with async execute_agent method that accepts conversation history and user message
- [x] T017 Implement conversation history loading in backend/src/agent/runner.py (fetch last 50 messages from database)
- [x] T018 Implement tool registration in backend/src/agent/runner.py to connect MCP tools with OpenAI agent

### Chat API Endpoint

- [x] T019 Create chat request/response schemas in backend/src/api/chat/schemas.py (ChatRequest, ChatResponse, MessageSchema)
- [x] T020 Create chat router in backend/src/api/chat/routes.py with POST /api/chat endpoint
- [x] T021 Implement JWT authentication dependency in backend/src/api/chat/routes.py using get_current_user_id (⚠️ Placeholder - needs Phase II JWT integration)
- [x] T022 Implement stateless request cycle in chat endpoint: fetch history → store user message → run agent → store assistant response → return
- [x] T023 Add chat router to backend/src/main.py FastAPI application
- [x] T024 [P] Add input validation in chat endpoint: message length (1-2000 chars), conversation_id existence check

### Frontend Chat Infrastructure

- [x] T025 Create chat API client in frontend/lib/api/chat.ts with sendMessage, getConversations, getMessages methods
- [x] T026 Create useChat hook in frontend/lib/hooks/useChat.ts with state management for messages, loading, errors
- [x] T027 Create chat types in frontend/types/chat.ts (Message, Conversation, ChatResponse interfaces)
- [x] T028 [P] Create ChatLayout component in frontend/components/chat/ChatLayout.tsx with header and navigation
- [x] T029 [P] Update frontend navigation to include /chat route link in header/sidebar

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Tasks via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks by typing natural language messages like "Add buy milk" or "I need to remember to pay bills"

**Independent Test**: Send message "Add buy milk" → Verify task created in database with title "Buy milk" → Verify confirmation response

### Implementation for User Story 1

- [x] T030 [P] [US1] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py with user_id, title, description parameters
- [x] T031 [P] [US1] Add Pydantic schema for add_task input in backend/src/mcp/tools/add_task.py (AddTaskInput with validation)
- [x] T032 [US1] Register add_task tool with MCP server in backend/src/mcp/server.py
- [x] T033 [US1] Integrate add_task tool with agent in backend/src/agent/runner.py
- [x] T034 [US1] Add natural language examples to agent system prompt for task creation: "Add X", "I need to remember X", "Create task X"
- [x] T035 [US1] Implement error handling in add_task tool for validation failures (title too long, empty title)
- [ ] T036 [US1] Test add_task tool: Send "Add buy milk" → Verify task created → Verify response "I've added 'Buy milk' to your task list!" (⚠️ Requires running server)

**Checkpoint**: User Story 1 complete - users can add tasks via natural language

---

## Phase 4: User Story 2 - List and Filter Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can view tasks by asking "Show my tasks", "What's pending?", or "What have I completed?"

**Independent Test**: Create 3 tasks (2 pending, 1 completed) → Send "Show my tasks" → Verify all 3 tasks displayed with numbers

### Implementation for User Story 2

- [x] T037 [P] [US2] Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py with user_id and status filter parameters
- [x] T038 [P] [US2] Add Pydantic schema for list_tasks input in backend/src/mcp/tools/list_tasks.py (ListTasksInput with status enum)
- [x] T039 [US2] Register list_tasks tool with MCP server in backend/src/mcp/server.py
- [x] T040 [US2] Integrate list_tasks tool with agent in backend/src/agent/runner.py
- [x] T041 [US2] Add natural language examples to agent system prompt for listing: "Show my tasks", "What's pending?", "List completed tasks"
- [x] T042 [US2] Implement task formatting in agent response: numbered list with status indicators (handled by AI model)
- [x] T043 [US2] Handle empty task list case: Return friendly message "You don't have any tasks yet. Would you like to add one?" (handled by AI model)
- [ ] T044 [US2] Test list_tasks tool: Create tasks → Send "Show my tasks" → Verify formatted list with numbers (⚠️ Requires running server)

**Checkpoint**: User Stories 1 & 2 complete - MVP functional (add and list tasks)

---

## Phase 5: User Story 3 - Mark Tasks Complete (Priority: P2)

**Goal**: Users can complete tasks by saying "Mark task 3 as complete" or "I finished buying milk"

**Independent Test**: Create task → Send "Mark task 1 as complete" → Verify task marked complete → Verify encouraging confirmation

### Implementation for User Story 3

- [x] T045 [P] [US3] Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py with user_id and task_id parameters
- [x] T046 [P] [US3] Add Pydantic schema for complete_task input in backend/src/mcp/tools/complete_task.py (CompleteTaskInput)
- [x] T047 [US3] Register complete_task tool with MCP server in backend/src/mcp/server.py
- [x] T048 [US3] Integrate complete_task tool with agent in backend/src/agent/runner.py
- [x] T049 [US3] Add natural language examples to agent system prompt: "Mark task X complete", "I finished X", "Task X is done"
- [x] T050 [US3] Implement task search by description in agent logic for phrases like "I finished buying milk" (handled by AI model)
- [x] T051 [US3] Add encouraging confirmation messages: "Great! I've marked 'X' as complete. Well done!" (handled by AI model)
- [x] T052 [US3] Handle ambiguous references: If multiple tasks match, ask "Which one? 1. X, 2. Y" (handled by AI model)
- [x] T053 [US3] Handle non-existent task: Return "I couldn't find that task. Would you like to see your list?" (handled by AI model)
- [ ] T054 [US3] Test complete_task tool: Create task → Complete by ID → Complete by description → Test error cases (⚠️ Requires running server)

**Checkpoint**: User Stories 1, 2, & 3 complete - core task management functional

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P2)

**Goal**: Users can delete tasks by saying "Delete task 2" or "Delete the meeting task"

**Independent Test**: Create task → Send "Delete task 1" → Verify task removed → Verify confirmation message

### Implementation for User Story 4

- [x] T055 [P] [US4] Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py with user_id and task_id parameters
- [x] T056 [P] [US4] Add Pydantic schema for delete_task input in backend/src/mcp/tools/delete_task.py (DeleteTaskInput)
- [x] T057 [US4] Register delete_task tool with MCP server in backend/src/mcp/server.py
- [x] T058 [US4] Integrate delete_task tool with agent in backend/src/agent/runner.py
- [x] T059 [US4] Add natural language examples to agent system prompt: "Delete task X", "Remove task X", "Cancel task X"
- [x] T060 [US4] Implement task search by description for deletion requests (handled by AI model)
- [x] T061 [US4] Add confirmation for ambiguous deletions: "Which one would you like to delete? 1. X, 2. Y" (handled by AI model)
- [x] T062 [US4] Add deletion confirmation message: "I've deleted 'X' from your list" (handled by AI model)
- [x] T063 [US4] Handle non-existent task: Return helpful error message (handled by AI model)
- [ ] T064 [US4] Test delete_task tool: Delete by ID → Delete by description → Test error cases (⚠️ Requires running server)

**Checkpoint**: User Stories 1-4 complete - full CRUD operations via chat

---

## Phase 7: User Story 5 - Update Tasks (Priority: P3)

**Goal**: Users can update tasks by saying "Change task 1 to 'Call mom tonight'" or "Update description of task 2"

**Independent Test**: Create task → Send "Change task 1 to 'New title'" → Verify title updated → Verify confirmation

### Implementation for User Story 5

- [x] T065 [P] [US5] Implement update_task MCP tool in backend/src/mcp/tools/update_task.py with user_id, task_id, title, description parameters
- [x] T066 [P] [US5] Add Pydantic schema for update_task input in backend/src/mcp/tools/update_task.py (UpdateTaskInput with optional fields)
- [x] T067 [US5] Register update_task tool with MCP server in backend/src/mcp/server.py
- [x] T068 [US5] Integrate update_task tool with agent in backend/src/agent/runner.py
- [x] T069 [US5] Add natural language examples to agent system prompt: "Change task X to Y", "Update description of task X", "Rename task X"
- [x] T070 [US5] Implement partial update logic: support title-only, description-only, or both updates
- [x] T071 [US5] Implement task search by old title for update requests (handled by AI model)
- [x] T072 [US5] Add update confirmation message: "I've updated task X to 'Y'" (handled by AI model)
- [x] T073 [US5] Handle non-existent task: Return helpful error message (handled by AI model)
- [ ] T074 [US5] Test update_task tool: Update title → Update description → Update both → Test error cases (⚠️ Requires running server)

**Checkpoint**: User Stories 1-5 complete - all task operations via natural language

---

## Phase 8: User Story 6 - Chat Interface UI (Priority: P2)

**Goal**: Users can access chat interface from dashboard and navigate between traditional UI and chat seamlessly

**Independent Test**: Navigate from dashboard to /chat → Send message → Navigate back to dashboard → Verify tasks sync

### Implementation for User Story 6

- [x] T075 [P] [US6] Create chat page in frontend/app/chat/page.tsx with authentication check and layout
- [x] T076 [P] [US6] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx with message list and input
- [x] T077 [P] [US6] Create MessageList component in frontend/components/chat/MessageList.tsx with user/assistant message styling
- [x] T078 [P] [US6] Create MessageInput component in frontend/components/chat/MessageInput.tsx with textarea and send button
- [x] T079 [US6] Implement message sending in ChatInterface: call chat API → update local state → scroll to bottom
- [x] T080 [US6] Add loading indicator while waiting for AI response (typing animation)
- [x] T081 [US6] Add error handling: display inline error messages for failed requests
- [x] T082 [US6] Implement auto-scroll to latest message when new messages arrive
- [x] T083 [US6] Add timestamp display on all messages using date-fns
- [x] T084 [US6] Style user messages (right-aligned, blue background) and assistant messages (left-aligned, gray background)
- [x] T085 [US6] Add navigation link to /chat in frontend header/sidebar
- [x] T086 [US6] Add navigation link back to /dashboard from chat page
- [x] T087 [US6] Highlight active route in navigation
- [x] T088 [US6] Make chat interface responsive: desktop (max-width 4xl centered), mobile (full-width)
- [x] T089 [US6] Add Enter key support to send messages (Shift+Enter for new line)
- [x] T090 [US6] Disable input while message is being sent
- [ ] T091 [US6] Test chat UI: Send messages → Verify styling → Test navigation → Test responsiveness (⚠️ Requires running frontend)

**Checkpoint**: User Story 6 complete - full chat UI functional

---

## Phase 9: User Story 7 - Conversation Context (Priority: P3)

**Goal**: System maintains conversation context across messages and persists across sessions/restarts

**Independent Test**: Start conversation → Send multiple messages → Restart server → Continue conversation → Verify history preserved

### Implementation for User Story 7

- [x] T092 [US7] Implement conversation creation on first message in backend/src/api/chat/routes.py
- [x] T093 [US7] Implement conversation_id persistence in frontend useChat hook state
- [x] T094 [US7] Add conversation history loading in frontend: fetch messages on mount if conversation_id exists
- [x] T095 [US7] Display conversation history in MessageList component on page load
- [x] T096 [US7] Implement context-aware agent responses: use conversation history for pronoun resolution ("also add X")
- [x] T097 [US7] Add conversation list sidebar in frontend/components/chat/ConversationList.tsx (optional enhancement)
- [x] T098 [US7] Implement "New Conversation" button to start fresh conversation
- [ ] T099 [US7] Test conversation persistence: Multi-turn conversation → Close browser → Reopen → Verify history (⚠️ Requires running system)
- [ ] T100 [US7] Test stateless architecture: Send message → Restart backend server → Send another message → Verify works (⚠️ Requires running system)

**Checkpoint**: User Story 7 complete - full conversation context maintained

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Security, performance, error handling, and production readiness

### Security Hardening

- [x] T101 [P] Implement input sanitization in backend/src/api/chat/routes.py: strip HTML tags, validate message length
- [x] T102 [P] Implement XSS prevention in frontend MessageList: sanitize AI responses before rendering
- [x] T103 [P] Add rate limiting to chat endpoint: 10 requests per minute per user
- [x] T104 [P] Implement audit logging in backend/src/utils/logger.py: log user_id, timestamp, tool_called (no message content)
- [ ] T105 Verify JWT validation on all chat endpoints: test with invalid token, expired token, missing token
- [ ] T106 Verify user isolation: test cross-user access attempts return 403
- [ ] T107 Verify OpenAI API key security: ensure never logged, never exposed in frontend, never committed to git

### Error Handling & Resilience

- [x] T108 [P] Implement graceful degradation when OpenAI API unavailable: return friendly error message
- [x] T109 [P] Add retry logic for transient database errors in conversation_service and message_service
- [x] T110 [P] Implement timeout handling for OpenAI API calls (30 second timeout)
- [x] T111 Add comprehensive error messages for all failure scenarios: auth errors, validation errors, database errors, API errors
- [ ] T112 Test error scenarios: invalid JWT → database down → OpenAI API down → rate limit exceeded

### Performance Optimization

- [x] T113 [P] Add database indexes verification: ensure indexes on messages.conversation_id, messages.user_id, conversations.user_id
- [x] T114 [P] Implement conversation history pagination: limit to last 50 messages per request
- [x] T115 [P] Add database connection pooling configuration in backend/src/database.py (pool_size=5, max_overflow=10)
- [ ] T116 Measure and optimize chat endpoint latency: target <2s p95 including AI inference
- [ ] T117 Test concurrent users: simulate 10 simultaneous conversations, verify no race conditions

### Documentation & Deployment

- [x] T118 [P] Update backend/README.md with Phase III setup instructions: environment variables, database migration, running server
- [x] T119 [P] Update frontend/README.md with chat feature documentation: navigation, usage examples
- [x] T120 [P] Create deployment guide in docs/deployment.md: environment setup, database migration, OpenAI API key configuration
- [x] T121 [P] Document MCP tools in backend/src/mcp/README.md: tool descriptions, parameters, examples
- [x] T122 Verify all environment variables documented in .env.example files
- [x] T123 Create troubleshooting guide in docs/troubleshooting.md: common errors and solutions

### Testing & Validation

- [ ] T124 Test stateless architecture: Send message → Restart server → Send message → Verify conversation continues
- [ ] T125 Test end-to-end chat flow: Login → Navigate to chat → Add task → List tasks → Complete task → Delete task → Update task
- [ ] T126 Test natural language understanding: Test 10 different phrasings for each operation (add, list, complete, delete, update)
- [ ] T127 Test multi-action commands: "Add buy milk and show my tasks" → Verify both actions executed
- [ ] T128 Test edge cases: empty message, very long message (>2000 chars), special characters, SQL injection attempts
- [ ] T129 Test Phase II compatibility: Verify traditional UI still works, verify data consistency between UIs
- [ ] T130 Test mobile responsiveness: Verify chat interface works on mobile devices

---

## Summary

**Total Tasks**: 130
**MVP Scope** (Recommended): Phase 1-4 (Tasks T001-T044) - Setup + US1 + US2
**Full Feature**: All phases (Tasks T001-T130)

### Task Count by Phase

- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 24 tasks
- Phase 3 (US1 - Add Tasks): 7 tasks
- Phase 4 (US2 - List Tasks): 8 tasks
- Phase 5 (US3 - Complete Tasks): 10 tasks
- Phase 6 (US4 - Delete Tasks): 10 tasks
- Phase 7 (US5 - Update Tasks): 10 tasks
- Phase 8 (US6 - Chat UI): 17 tasks
- Phase 9 (US7 - Context): 9 tasks
- Phase 10 (Polish): 30 tasks

### Parallel Execution Opportunities

**Phase 1**: T002, T003, T004, T005 can run in parallel (4 tasks)
**Phase 2**: T013-T014 (services), T024 (validation), T025-T029 (frontend) can run in parallel (7 tasks)
**Phase 3-7**: Tool implementation tasks marked [P] can run in parallel within each phase
**Phase 8**: T075-T078 (UI components) can run in parallel (4 tasks)
**Phase 10**: Most polish tasks marked [P] can run in parallel (15 tasks)

### Dependencies

- **Phase 2 blocks all user stories**: Must complete foundational infrastructure before any story work
- **US1 & US2 are independent**: Can be implemented in parallel after Phase 2
- **US3, US4, US5 depend on US1 & US2**: Need add_task and list_tasks tools working first
- **US6 depends on US1 & US2**: Need backend chat endpoint functional before building UI
- **US7 depends on US6**: Need chat UI before adding conversation persistence features

### Implementation Strategy

1. **MVP First** (Phases 1-4): Deliver core value - users can add and list tasks via chat
2. **Incremental Delivery**: Each user story is independently testable and deliverable
3. **Parallel Work**: After Phase 2, multiple user stories can be developed simultaneously
4. **Polish Last**: Security, performance, and documentation after core features work

---

**Status**: Ready for implementation via Claude Code
**Next Step**: Begin with Phase 1 (Setup) tasks T001-T005
