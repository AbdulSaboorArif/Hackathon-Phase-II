/**
 * ConversationList component - Sidebar showing user's conversation history.
 *
 * Displays a list of conversations ordered by most recent activity.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { chatAPI, Conversation } from '@/lib/api/chat';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await chatAPI.getConversations(50, 0);
      setConversations(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (
    conversationId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent selecting the conversation

    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      // If deleted conversation was active, start new conversation
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header with New Conversation button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">Loading...</p>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadConversations}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="py-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-l-4 ${
                  conversation.id === currentConversationId
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Conversation {conversation.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete conversation"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with refresh button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={loadConversations}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
