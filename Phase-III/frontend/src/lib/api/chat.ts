import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ChatRequest {
  conversation_id?: number;
  message: string;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

interface ChatResponse {
  conversation_id: number;
  message_id: number;
  response: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

class ChatAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async sendMessage(
    message: string,
    conversationId?: number
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      ...(conversationId && { conversation_id: conversationId }),
    };
    const response = await this.client.post<ChatResponse>('/chat', request);
    return response.data;
  }

  async getConversations(
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    const response = await this.client.get<Conversation[]>('/conversations', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const response = await this.client.get<Message[]>(
      `/conversations/${conversationId}/messages`,
      {
        params: { limit, offset },
      }
    );
    return response.data;
  }

  async deleteConversation(conversationId: number): Promise<void> {
    await this.client.delete(`/conversations/${conversationId}`);
  }
}

export const chatAPI = new ChatAPIClient();

export type {
  ChatRequest,
  ChatResponse,
  Message,
  Conversation,
  ToolCall,
};
