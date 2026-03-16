import { create } from 'zustand';
import api from '@/lib/api';
import { socketEmit, getSocket } from '@/lib/socket';

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {}, // chatId -> Message[]
  typingUsers: {}, // chatId -> { userId, username }[]
  onlineUsers: new Set(),
  isLoadingChats: false,
  isLoadingMessages: false,
  searchResults: [],

  // ─── Chats ────────────────────────────────────────────────────────────────
  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const { data } = await api.get('/api/chats');
      set({ chats: data.chats, isLoadingChats: false });
    } catch { set({ isLoadingChats: false }); }
  },

  setActiveChat: async (chat) => {
    set({ activeChat: chat });
    if (!chat) return;

    // Join socket room
    getSocket()?.emit('chat:join', { chatId: chat._id });

    // Load messages if not already cached
    if (!get().messages[chat._id]) {
      await get().fetchMessages(chat._id);
    }
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  fetchMessages: async (chatId, before = null) => {
    set({ isLoadingMessages: true });
    try {
      const params = before ? `?before=${before}` : '';
      const { data } = await api.get(`/api/messages/${chatId}${params}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: before
            ? [...data.messages, ...(state.messages[chatId] || [])]
            : data.messages,
        },
        isLoadingMessages: false,
      }));
      return data.hasMore;
    } catch { set({ isLoadingMessages: false }); }
  },

  sendMessage: async (chatId, content, type = 'text', attachments = [], replyTo = null) => {
    try {
      const res = await socketEmit('message:send', { chatId, content, type, attachments, replyTo });
      return res;
    } catch (err) {
      // REST fallback
      const { data } = await api.post(`/api/messages/${chatId}`, { content, type, replyTo });
      return data;
    }
  },

  addMessage: (message) => {
    set((state) => {
      const chatId = message.chat;
      const existing = state.messages[chatId] || [];
      // Deduplicate
      if (existing.find((m) => m._id === message._id)) return state;
      return {
        messages: { ...state.messages, [chatId]: [...existing, message] },
        chats: state.chats.map((c) =>
          c._id === chatId ? { ...c, lastMessage: message, lastActivity: message.createdAt } : c
        ),
      };
    });
  },

  updateMessage: (messageId, updates) => {
    set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach((chatId) => {
        newMessages[chatId] = newMessages[chatId].map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        );
      });
      return { messages: newMessages };
    });
  },

  removeMessage: (messageId) => {
    set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach((chatId) => {
        newMessages[chatId] = newMessages[chatId].map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted.' } : m
        );
      });
      return { messages: newMessages };
    });
  },

  // ─── Typing ───────────────────────────────────────────────────────────────
  setTyping: (chatId, user, isTyping) => {
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      const filtered = current.filter((u) => u._id !== user._id);
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: isTyping ? [...filtered, user] : filtered,
        },
      };
    });
  },

  // ─── Online users ─────────────────────────────────────────────────────────
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  setUserStatus: (userId, status) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      status === 'online' ? next.add(userId) : next.delete(userId);
      return { onlineUsers: next };
    });
  },

  // ─── Create Chats ─────────────────────────────────────────────────────────
  createDirectChat: async (userId) => {
    const { data } = await api.get(`/api/chats/direct/${userId}`);
    set((state) => {
      const exists = state.chats.find((c) => c._id === data.chat._id);
      return { chats: exists ? state.chats : [data.chat, ...state.chats] };
    });
    return data.chat;
  },

  createGroupChat: async (name, memberIds) => {
    const { data } = await api.post('/api/chats/group', { name, members: memberIds });
    set((state) => ({ chats: [data.chat, ...state.chats] }));
    return data.chat;
  },

  // ─── Search ───────────────────────────────────────────────────────────────
  searchMessages: async (chatId, query) => {
    const { data } = await api.get(`/api/messages/${chatId}/search?q=${query}`);
    set({ searchResults: data.messages });
  },
  clearSearch: () => set({ searchResults: [] }),
}));

export default useChatStore;
