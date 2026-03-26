---
id: 003
title: OpenAI ChatKit Integration Research
stage: misc
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 001-ai-chatbot-mcp
branch: 001-ai-chatbot-mcp
user: AbdulSaboorArif
command: research
labels: ["research", "chatkit", "authentication", "jwt", "openai", "phase-0"]
links:
  spec: specs/001-ai-chatbot-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-chatbot-mcp/research.md
tests:
  - None (research phase)
---

## Prompt

Research OpenAI ChatKit integration and authentication flow. Focus on:
1. How to integrate ChatKit into a Next.js application
2. Domain allowlist configuration in OpenAI dashboard
3. How to pass JWT tokens with chat requests
4. Best practices for conversation state management
5. Error handling and user experience patterns

Provide concrete implementation guidance with code examples where possible.

## Response snapshot

Created comprehensive research document covering:

**1. OpenAI ChatKit Integration**
- Two integration approaches: Hosted ChatKit Component vs Custom Chat UI
- Recommended starting with Custom UI for full control
- Complete integration architecture diagram showing frontend → backend → MCP → database flow

**2. Domain Allowlist Configuration**
- OpenAI dashboard configuration steps (hypothetical based on OAuth patterns)
- Backend API key security patterns
- Environment variable management

**3. JWT Token Authentication Flow**
- Analyzed existing Phase II authentication patterns from codebase
- Frontend: Token storage in localStorage, inclusion in Authorization header
- Backend: JWT verification middleware using PyJWT
- Token structure and payload format
- Chat endpoint authentication implementation

**4. Conversation State Management**
- Stateless architecture requirements (no server-side state)
- Database schema for conversations and messages (SQL + SQLModel)
- 9-step stateless request cycle with code examples
- Conversation history retrieval patterns

**5. Error Handling & UX Patterns**
- Error categories: 401 (auth), 403 (authorization), 429 (rate limit), 500 (server)
- Loading states, optimistic updates, retry logic
- Backend error handling with proper logging

**6. Best Practices**
- Security: JWT verification, user isolation, API key protection
- Performance: Connection pooling, indexing, pagination
- UX: Typing indicators, optimistic updates, error messages

**7. Implementation Checklist**
- 11 backend tasks
- 12 frontend tasks
- 7 infrastructure tasks

## Outcome

- ✅ Impact: Phase 0 research complete - provides concrete implementation guidance for Phase 1 design and Phase 2 tasks
- 🧪 Tests: No tests (research phase) - test strategies documented in research.md
- 📁 Files: Created specs/001-ai-chatbot-mcp/research.md (comprehensive 400+ line document)
- 🔁 Next prompts: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md), then run /sp.tasks
- 🧠 Reflection: Successfully analyzed existing Phase II authentication patterns and translated them into Phase III chat requirements. Unable to access OpenAI documentation directly, but provided implementation guidance based on codebase analysis and common patterns.

## Evaluation notes (flywheel)

- Failure modes observed: Web search and WebFetch tools failed (403 errors) - adapted by analyzing existing codebase patterns instead
- Graders run and results (PASS/FAIL): N/A (research phase)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate research findings during Phase 1 design phase
