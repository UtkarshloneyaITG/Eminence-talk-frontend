import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const useFriendStore = create((set, get) => ({
  friendRequests: [],      // incoming pending requests
  sentRequests: new Set(), // userIds we already sent to (UI state)

  fetchFriendRequests: async () => {
    try {
      const { data } = await api.get('/api/users/friend-requests');
      set({ friendRequests: data.friendRequests || [] });
    } catch {}
  },

  sendFriendRequest: async (userId) => {
    try {
      await api.post(`/api/users/friend-requests/${userId}`);
      set((state) => ({ sentRequests: new Set([...state.sentRequests, userId]) }));
      toast.success('Friend request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await api.post(`/api/users/friend-requests/${userId}/accept`);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r.from._id !== userId),
      }));
      toast.success('Friend request accepted!');
    } catch {
      toast.error('Failed to accept request');
    }
  },

  declineFriendRequest: async (userId) => {
    try {
      await api.post(`/api/users/friend-requests/${userId}/decline`);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r.from._id !== userId),
      }));
    } catch {
      toast.error('Failed to decline request');
    }
  },

  // Called from socket listener (Chat.jsx)
  addIncomingRequest: (from) => {
    set((state) => {
      const already = state.friendRequests.some((r) => r.from._id === from._id);
      if (already) return state;
      return { friendRequests: [{ from, createdAt: new Date() }, ...state.friendRequests] };
    });
  },

  removeFriend: async (userId) => {
    try {
      await api.delete(`/api/users/contacts/${userId}`);
      // Update the local user's contacts array in authStore
      const { user, updateUser } = useAuthStore.getState();
      if (user?.contacts) {
        updateUser({ contacts: user.contacts.filter((id) => id !== userId && id?._id !== userId) });
      }
      toast.success('Friend removed');
      return true;
    } catch {
      toast.error('Failed to remove friend');
      return false;
    }
  },

  // Called when our request gets accepted
  markRequestAccepted: (userId) => {
    set((state) => ({
      sentRequests: new Set([...state.sentRequests].filter((id) => id !== userId)),
    }));
  },
}));

export default useFriendStore;
