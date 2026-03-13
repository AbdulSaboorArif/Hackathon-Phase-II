/**
 * useChat hook for managing chat state and interactions.
 */

import { useState, useCallback, useEffect } from 'react';
import { chatAPI, Message, ChatResponse } from '../api/chat';

interface UseChatOptions {
  conversationId?: number;
  autoLoadHistory?: boolean;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  conversationId: number | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  loadHistory: () => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId: initialConversationId, autoLoadHistory = false } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(
    initialConversationId || null
  );

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const history = await chatAPI.getMessages(conversationId);
      setMessages(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation history';
      setError(errorMessage);
      console.error('Error loading conversation history:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        setError('Message cannot be empty');
        return;
      }
      if (message.length > 2000) {
        setError('Message cannot exceed 2000 characters');
        return;
      }
      setLoading(true);
      setError(null);
      const optimisticUserMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);
      try {
        const response: ChatResponse = await chatAPI.sendMessage(
          message,
          conversationId || undefined
        );
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }
        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (msg) => msg.id !== optimisticUserMessage.id
          );
          const assistantMessage: Message = {
            id: response.message_id,
            role: 'assistant',
            content: response.response,
            created_at: response.created_at,
          };
          return [...withoutOptimistic, optimisticUserMessage, assistantMessage];
        });
      } catch (err) {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticUserMessage.id)
        );
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        console.error('Error sending message:', err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoadHistory && conversationId) {
      loadHistory();
    }
  }, [autoLoadHistory, conversationId, loadHistory]);

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    clearError,
    loadHistory,
  };
}
