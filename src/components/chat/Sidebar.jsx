import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircle, UsersThree, MagnifyingGlass, GearSix, Bell, SignOut, CaretLeft, Trash, X, Plus } from '@phosphor-icons/react';
import { staggerIn } from '@/animations/gsapConfig';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import ChatListItem from './ChatListItem';
import UserAvatar from '@/components/ui/UserAvatar';
import SearchPanel from './SearchPanel';
import FriendRequestsPanel from './FriendRequestsPanel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useFriendStore from '@/store/friendStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const { chats, fetchChats, setActiveChat, activeChat, clearChat } = useChatStore();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, toggleNotifications, notificationsOpen, openModal } = useUIStore();
  const { friendRequests } = useFriendStore();

  const [tab, setTab] = useState('chats');
  const [showSearch, setShowSearch] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (listRef.current && chats.length) {
      staggerIn(listRef.current.querySelectorAll('.chat-item'));
    }
  }, [chats.length, tab]);

  useEffect(() => {
    if (!sidebarOpen) { setSelectMode(false); setSelectedChats(new Set()); }
  }, [sidebarOpen]);

  const toggleSelect = (chatId) => {
    setSelectedChats((prev) => {
      const next = new Set(prev);
      next.has(chatId) ? next.delete(chatId) : next.add(chatId);
      return next;
    });
  };

  const cancelSelect = () => { setSelectMode(false); setSelectedChats(new Set()); };

  const handleBulkDelete = async () => {
    setConfirmBulkDelete(false);
    const ids = [...selectedChats];
    try {
      const results = await Promise.all(ids.map((id) => api.delete(`/api/chats/${id}`)));
      results.forEach(({ data }, i) => clearChat(ids[i], user._id, data.lastMessage ?? null));
      toast.success(`${ids.length} chat${ids.length > 1 ? 's' : ''} cleared`);
    } catch {
      toast.error('Failed to delete some chats');
    }
    cancelSelect();
  };

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex-shrink-0 h-full border-r border-white/[0.06] overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {/* Fixed-width inner — keeps layout stable while width animates */}
          <div className="w-[300px] h-full flex flex-col backdrop-blur-xl bg-white/[0.02]">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              {selectMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">
                      {selectedChats.size > 0 ? `${selectedChats.size} selected` : 'Select chats'}
                    </span>
                    <button
                      onClick={() => {
                        const allIds = chats.map((c) => c._id);
                        const allSelected = allIds.every((id) => selectedChats.has(id));
                        setSelectedChats(allSelected ? new Set() : new Set(allIds));
                      }}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-white transition-all"
                    >
                      {chats.length > 0 && chats.every((c) => selectedChats.has(c._id)) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedChats.size > 0 && (
                      <button
                        onClick={() => setConfirmBulkDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
                      >
                        <Trash size={13} weight="bold" />
                        Delete ({selectedChats.size})
                      </button>
                    )}
                    <button
                      onClick={cancelSelect}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" showStatus />
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{user?.username}</p>
                      <p className="text-white/40 text-xs">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleNotifications}
                      className={`relative p-2 rounded-lg hover:bg-white/[0.06] transition-all ${notificationsOpen ? 'text-white bg-white/[0.06]' : 'text-white/40 hover:text-white'}`}
                    >
                      <Bell size={16} weight="fill" />
                      {friendRequests.length > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          {friendRequests.length > 9 ? '9+' : friendRequests.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all"
                      title="Settings"
                    >
                      <GearSix size={16} weight="fill" />
                    </button>
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all md:hidden"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            {!selectMode && (
              <div className="shrink-0 px-4 py-2.5 border-b border-white/[0.04]">
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-sm hover:bg-white/[0.07] hover:text-white/50 transition-all"
                >
                  <MagnifyingGlass size={14} />
                  Search conversations...
                </button>
              </div>
            )}

            {/* ── Tabs ───────────────────────────────────────────── */}
            {!selectMode && (
              <div className="shrink-0 px-4 pt-3 pb-2">
                <div className="flex bg-white/[0.04] rounded-xl p-0.5">
                  {[['chats', ChatCircle], ['groups', UsersThree]].map(([id, Icon]) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                        tab === id ? 'text-white' : 'text-white/40 hover:text-white/70'
                      }`}
                      style={tab === id ? {
                        backgroundColor: 'var(--accent)',
                        boxShadow: `0 0 20px rgba(var(--accent-rgb), 0.5)`,
                      } : {}}
                    >
                      <Icon size={13} /> {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Select hint ────────────────────────────────────── */}
            {selectMode && chats.length > 0 && (
              <p className="shrink-0 px-4 pt-2 pb-1 text-white/25 text-xs">
                Hold a chat to select, then delete
              </p>
            )}

            {/* ── Chat / Group list ──────────────────────────────── */}
            <div ref={listRef} className="flex-1 overflow-y-auto py-1 space-y-0.5 scrollbar-thin">
              {(() => {
                const visibleChats = tab === 'groups'
                  ? chats.filter((c) => c.type === 'group')
                  : chats;

                if (visibleChats.length === 0) {
                  return tab === 'groups' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-white/30 text-sm py-10 px-4">
                      <UsersThree size={40} className="mb-3 opacity-20" />
                      <p className="mb-4">No groups yet</p>
                      <button
                        onClick={() => openModal('newGroup')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(var(--accent-rgb), 0.25)',
                        }}
                      >
                        <Plus size={13} weight="bold" /> Create Group
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-white/30 text-sm py-10">
                      <ChatCircle size={40} className="mb-3 opacity-20" />
                      <p>No conversations yet</p>
                    </div>
                  );
                }

                return visibleChats.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    isActive={activeChat?._id === chat._id}
                    onClick={() => { cancelSelect(); setActiveChat(chat); }}
                    selectMode={selectMode}
                    isSelected={selectedChats.has(chat._id)}
                    onToggleSelect={toggleSelect}
                    onLongPress={() => setSelectMode(true)}
                  />
                ));
              })()}
            </div>

            {/* ── Footer ─────────────────────────────────────────── */}
            {!selectMode && (
              <div className="shrink-0 px-4 py-3 border-t border-white/[0.06] space-y-1">
                {tab === 'groups' && (
                  <button
                    onClick={() => openModal('newGroup')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                      color: 'var(--accent)',
                    }}
                  >
                    <Plus size={15} weight="bold" />
                    New Group
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all"
                >
                  <SignOut size={15} />
                  Sign out
                </button>
              </div>
            )}

          </div>
        </motion.aside>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
      </AnimatePresence>

      <FriendRequestsPanel />

      <ConfirmModal
        open={confirmBulkDelete}
        title={
          selectedChats.size === chats.length && chats.length > 0
            ? 'Delete all chats?'
            : `Delete ${selectedChats.size} chat${selectedChats.size > 1 ? 's' : ''}?`
        }
        message="Your sent messages will be cleared. Conversations stay visible."
        confirmLabel={`Delete ${selectedChats.size}`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </AnimatePresence>
  );
};

export default Sidebar;
