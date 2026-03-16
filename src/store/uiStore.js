import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      // Cursor style: 'particles' | 'morph' | 'magnetic' | 'gsap'
      cursorStyle: 'morph',
      setCursorStyle: (style) => set({ cursorStyle: style }),

      // Theme accent color
      accentColor: '#6366f1',
      setAccentColor: (color) => set({ accentColor: color }),

      // Sidebar collapsed
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Right panel (profile info, canvas, etc.)
      rightPanel: null, // null | 'profile' | 'canvas' | 'search' | 'pinned'
      setRightPanel: (panel) => set((state) => ({ rightPanel: state.rightPanel === panel ? null : panel })),

      // Active modal
      modal: null, // null | 'newChat' | 'newGroup' | 'imageViewer' | 'settings'
      modalData: null,
      openModal: (modal, data = null) => set({ modal, modalData: data }),
      closeModal: () => set({ modal: null, modalData: null }),

      // Message reply state
      replyingTo: null,
      setReplyingTo: (message) => set({ replyingTo: message }),
      clearReply: () => set({ replyingTo: null }),

      // Notifications panel
      notificationsOpen: false,
      toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),

      // Audio muted
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Canvas active
      canvasActive: false,
      activeCanvasId: null,
      openCanvas: (canvasId) => set({ canvasActive: true, activeCanvasId: canvasId }),
      closeCanvas: () => set({ canvasActive: false, activeCanvasId: null }),

      // Three.js background active
      threeBgEnabled: true,
      toggleThreeBg: () => set((state) => ({ threeBgEnabled: !state.threeBgEnabled })),
    }),
    {
      name: 'et-ui',
      version: 2,
      partialize: (state) => ({
        cursorStyle: state.cursorStyle,
        accentColor: state.accentColor,
        soundEnabled: state.soundEnabled,
        threeBgEnabled: state.threeBgEnabled,
      }),
    }
  )
);

export default useUIStore;
