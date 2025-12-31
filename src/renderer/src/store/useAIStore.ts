import { create } from 'zustand';
import type { AISettings, AIChat, AIMessage, AIProvider, AIContextData } from '../../../common/types';

interface AIState {
  // Settings
  settings: AISettings | null;
  isConfigured: boolean;
  isLoadingSettings: boolean;

  // Chat state
  chats: AIChat[];
  activeChat: AIChat | null;
  messages: AIMessage[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Panel state
  isPanelOpen: boolean;
  isFullPage: boolean;

  // Error state
  error: string | null;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AISettings>) => Promise<void>;
  validateKey: (provider: AIProvider, apiKey: string, ollamaUrl?: string) => Promise<boolean>;
  getModels: (provider: AIProvider, apiKey?: string, ollamaUrl?: string) => Promise<string[]>;

  // Actions - Chats
  loadChats: () => Promise<void>;
  createChat: (title?: string, context?: string) => Promise<AIChat | null>;
  selectChat: (chatId: number) => Promise<void>;
  updateChatTitle: (chatId: number, title: string) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  deleteAllChats: () => Promise<void>;

  // Actions - Messages
  sendMessage: (content: string) => Promise<void>;

  // Actions - Panel
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setFullPage: (isFullPage: boolean) => void;

  // Actions - Context
  getContextData: () => Promise<AIContextData | null>;

  // Actions - Utility
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  // Initial state
  settings: null,
  isConfigured: false,
  isLoadingSettings: false,
  chats: [],
  activeChat: null,
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,
  isSending: false,
  isPanelOpen: false,
  isFullPage: false,
  error: null,

  // Settings actions
  loadSettings: async () => {
    set({ isLoadingSettings: true, error: null });
    try {
      const settings = await window.api.ai.getSettings();
      const isConfigured = await window.api.ai.isConfigured();
      set({ settings, isConfigured, isLoadingSettings: false });
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load AI settings',
        isLoadingSettings: false 
      });
    }
  },

  updateSettings: async (updates) => {
    set({ isLoadingSettings: true, error: null });
    try {
      const settings = await window.api.ai.updateSettings(updates);
      const isConfigured = await window.api.ai.isConfigured();
      set({ settings, isConfigured, isLoadingSettings: false });
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update AI settings',
        isLoadingSettings: false 
      });
    }
  },

  validateKey: async (provider, apiKey, ollamaUrl) => {
    try {
      return await window.api.ai.validateKey(provider, apiKey, ollamaUrl);
    } catch (error) {
      console.error('Failed to validate API key:', error);
      return false;
    }
  },

  getModels: async (provider, apiKey, ollamaUrl) => {
    try {
      return await window.api.ai.getModels(provider, apiKey, ollamaUrl);
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  },

  // Chat actions
  loadChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chats = await window.api.ai.chats.getAll();
      set({ chats, isLoadingChats: false });
    } catch (error) {
      console.error('Failed to load chats:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load chats',
        isLoadingChats: false 
      });
    }
  },

  createChat: async (title, context) => {
    set({ error: null });
    try {
      const chat = await window.api.ai.chats.create(title, context);
      const chats = await window.api.ai.chats.getAll();
      set({ chats, activeChat: chat, messages: [] });
      return chat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create chat' });
      return null;
    }
  },

  selectChat: async (chatId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const chat = await window.api.ai.chats.getById(chatId);
      if (chat) {
        const messages = await window.api.ai.messages.getByChatId(chatId);
        set({ activeChat: chat, messages, isLoadingMessages: false });
      } else {
        set({ isLoadingMessages: false });
      }
    } catch (error) {
      console.error('Failed to select chat:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load chat',
        isLoadingMessages: false 
      });
    }
  },

  updateChatTitle: async (chatId, title) => {
    try {
      await window.api.ai.chats.updateTitle(chatId, title);
      const chats = await window.api.ai.chats.getAll();
      const { activeChat } = get();
      if (activeChat?.id === chatId) {
        set({ chats, activeChat: { ...activeChat, title } });
      } else {
        set({ chats });
      }
    } catch (error) {
      console.error('Failed to update chat title:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update chat title' });
    }
  },

  deleteChat: async (chatId) => {
    try {
      await window.api.ai.chats.delete(chatId);
      const chats = await window.api.ai.chats.getAll();
      const { activeChat } = get();
      if (activeChat?.id === chatId) {
        set({ chats, activeChat: null, messages: [] });
      } else {
        set({ chats });
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete chat' });
    }
  },

  deleteAllChats: async () => {
    try {
      await window.api.ai.chats.deleteAll();
      set({ chats: [], activeChat: null, messages: [] });
    } catch (error) {
      console.error('Failed to delete all chats:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete all chats' });
    }
  },

  // Message actions
  sendMessage: async (content) => {
    const { activeChat } = get();
    
    // Create a new chat if none is active
    let chatId = activeChat?.id;
    let isNewChat = false;
    if (!chatId) {
      // Create chat with initial prompt as title (truncated)
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
      const newChat = await get().createChat(title);
      if (!newChat) return;
      chatId = newChat.id;
      isNewChat = true;
    }

    set({ isSending: true, error: null });
    try {
      await window.api.ai.messages.send(chatId, content);
      
      // Update messages
      const messages = await window.api.ai.messages.getByChatId(chatId);
      const chats = await window.api.ai.chats.getAll();
      
      // Update activeChat if it was just created
      const updatedActiveChat = isNewChat ? chats.find(c => c.id === chatId) || get().activeChat : get().activeChat;
      
      set({ messages, chats, activeChat: updatedActiveChat, isSending: false });
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message',
        isSending: false 
      });
    }
  },

  // Panel actions
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setFullPage: (isFullPage) => set({ isFullPage }),

  // Context actions
  getContextData: async () => {
    try {
      return await window.api.ai.context.getData();
    } catch (error) {
      console.error('Failed to get context data:', error);
      return null;
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
}));
