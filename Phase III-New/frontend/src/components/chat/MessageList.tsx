/**
 * MessageList component - Displays chat messages with user/assistant styling.
 *
 * Shows messages in chronological order with distinct styling for each role.
 * Implements XSS prevention by sanitizing AI assistant responses.
 */

import React from 'react';
import { Message } from '@/types/chat';
import { format } from 'date-fns';
import { sanitizeAIResponse } from '@/lib/utils/sanitize';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        // Sanitize AI assistant responses for XSS prevention (defense-in-depth)
        const displayContent = message.role === 'assistant'
          ? sanitizeAIResponse(message.content)
          : message.content;

        return (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Message content - React automatically escapes content in JSX */}
              <div className="whitespace-pre-wrap break-words">
                {displayContent}
              </div>

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {format(new Date(message.created_at), 'h:mm a')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
