# Frontend - Todo App

Next.js 16+ frontend for the Todo Full-Stack Web Application with AI-powered chat interface.

## Features

### Phase II - Core UI
- Modern React with TypeScript
- Tailwind CSS for styling
- Better Auth for authentication
- Responsive design
- JWT token management
- User-friendly interface

### Phase III - AI Chat Interface
- Natural language task management via chat
- Real-time conversation interface
- Message history with user/assistant styling
- Auto-scroll to latest messages
- Loading states and error handling
- Character count and input validation

## Requirements

- Node.js 18+
- npm or yarn package manager

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_ENVIRONMENT="development"
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_ENABLE_DEBUG="true"
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run start`
Runs the built app in production mode.

### `npm run lint`
Runs ESLint to check for code quality issues.

## Project Structure

```
frontend/
├── app/                # Next.js App Router pages
│   ├── auth/          # Authentication pages
│   ├── tasks/         # Task management pages
│   └── chat/          # Phase III: Chat interface page
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── tasks/         # Task components
│   └── chat/          # Phase III: Chat components
│       ├── ChatLayout.tsx      # Chat page layout with header
│       ├── ChatInterface.tsx   # Main chat interface
│       ├── MessageList.tsx     # Message display component
│       └── MessageInput.tsx    # Message input with send button
├── lib/               # Utility functions and types
│   ├── api/           # API clients
│   │   └── chat.ts    # Phase III: Chat API client
│   ├── hooks/         # Custom React hooks
│   │   └── useChat.ts # Phase III: Chat state management hook
│   └── types/         # TypeScript types
│       └── chat.ts    # Phase III: Chat type definitions
├── public/            # Static assets
├── tests/             # Test suite
├── package.json       # Project configuration
└── .env.local.example # Environment variables template
```

## Development

### API Integration

The frontend communicates with the FastAPI backend at the URL specified in `NEXT_PUBLIC_API_URL`.

### Authentication

Authentication is handled by Better Auth with JWT tokens. The frontend automatically includes tokens in API requests.

## Phase III - Using the Chat Interface

### Navigation

Access the chat interface at `/chat` after logging in. The chat page provides a conversational interface for managing your tasks using natural language.

### Usage Examples

The AI chatbot understands various phrasings for task management operations:

**Adding Tasks:**
- "Add buy milk to my tasks"
- "Create a new task: finish the report"
- "I need to remember to call John"
- "Add task: schedule dentist appointment"

**Listing Tasks:**
- "Show me all my tasks"
- "What tasks do I have?"
- "List my pending tasks"
- "Show completed tasks"

**Completing Tasks:**
- "Mark task 1 as complete"
- "I finished task 3"
- "Complete the buy milk task"
- "Task 2 is done"

**Deleting Tasks:**
- "Delete task 5"
- "Remove the dentist appointment task"
- "Get rid of task 1"

**Updating Tasks:**
- "Change task 2 title to 'Buy groceries'"
- "Update task 3 description to 'Call at 3pm'"
- "Rename task 1 to 'Finish project report'"

### Chat Features

- **Enter to Send**: Press Enter to send a message, Shift+Enter for new line
- **Auto-scroll**: Messages automatically scroll to the latest
- **Loading States**: Visual feedback while the AI processes your request
- **Error Handling**: Clear error messages if something goes wrong
- **Character Limit**: 2000 characters per message with live counter
- **Conversation History**: All messages are persisted and loaded on page refresh

### Chat API Client

The chat functionality uses a dedicated API client (`lib/api/chat.ts`) that handles:
- Message sending with conversation tracking
- Automatic JWT token inclusion
- Error handling and retries
- Response parsing with tool call information

### State Management

The `useChat` hook (`lib/hooks/useChat.ts`) provides:
- Message state management
- Loading and error states
- Optimistic UI updates
- Conversation ID tracking
- Automatic message persistence

## Testing

```bash
npm run test
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other static hosting service that supports Next.js.

## License

This project is part of the Hackathon II Phase II Todo Full-Stack Web Application.
