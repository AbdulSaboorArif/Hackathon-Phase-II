/**
 * ChatInterface component - Main chat interface with message list and input.
 *
 * Manages chat state and handles message sending with conversation history.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConversationList } from './ConversationList';

interface ChatInterfaceProps {
  showSidebar?: boolean;
}

export function ChatInterface({ showSidebar = true }: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);

  const {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    clearError,
    clearMessages,
    loadHistory,
  } = useChat({
    conversationId: selectedConversationId || undefined,
    autoLoadHistory: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update selected conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversationId !== selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId, selectedConversationId]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleSelectConversation = async (convId: number) => {
    setSelectedConversationId(convId);
    clearMessages();
    // History will be loaded automatically by useChat hook
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    clearMessages();
    clearError();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Conversation List Sidebar */}
      {sidebarOpen && showSidebar && (
        <ConversationList
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full">
        {/* Header with sidebar toggle */}
        {showSidebar && (
          <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {conversationId ? `Conversation ${conversationId}` : 'New Conversation'}
              </h2>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Ask me to add tasks, show your tasks, mark them complete, or anything else!
              </p>
              <div className="mt-6 text-xs text-gray-400">
                <p>Try saying:</p>
                <ul className="mt-2 space-y-1">
                  <li>"Add buy milk to my tasks"</li>
                  <li>"Show me all my tasks"</li>
                  <li>"Mark task 1 as complete"</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
