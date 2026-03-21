import { motion, AnimatePresence } from 'framer-motion';
import { X, UserMinus, Trash, UsersThree, PencilSimple, Check, UserPlus, Crown, Shield, SignOut, DotsThreeVertical } from '@phosphor-icons/react';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import useFriendStore from '@/store/friendStore';
import UserAvatar from '@/components/ui/UserAvatar';
import MessageBubble from './MessageBubble';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Member action popover ─────────────────────────────────────────────────────
const MemberMenu = ({ memberId, memberRole, myRole, groupId, chatId, group, onRemove, onRoleChange, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  const isOwner = myRole === 'owner';
  // Admin can only remove regular members; owner can remove anyone (except themselves)
  const canRemove = isOwner || (myRole === 'admin' && memberRole === 'member');
  const canToggleAdmin = isOwner && memberRole !== 'owner';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-8 z-50 w-44 bg-surface-98 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl py-1 overflow-hidden"
    >
      {canToggleAdmin && (
        <button
          onClick={() => { onRoleChange(memberId, memberRole === 'admin' ? 'member' : 'admin'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          {memberRole === 'admin'
            ? <><Shield size={13} className="text-white/40" /> Remove admin</>
            : <><Crown size={13} className="text-yellow-400/70" /> Make admin</>
          }
        </button>
      )}
      {canRemove && (
        <button
          onClick={() => { onRemove(memberId); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X size={13} weight="bold" /> Remove
        </button>
      )}
      {!canRemove && !canToggleAdmin && (
        <p className="px-3 py-2 text-white/25 text-xs">No actions available</p>
      )}
    </motion.div>
  );
};

// ─── Group Info Panel ──────────────────────────────────────────────────────────
const GroupPanel = ({ chat, onClose }) => {
  const { user } = useAuthStore();
  const { removeChat, updateGroupInChat } = useChatStore();
  const group = chat.group;

  const myMember = group?.members?.find(
    (m) => (m.user?._id ?? m.user) === user?._id
  );
  const myRole = myMember?.role ?? 'member';
  const isAdminOrOwner = ['owner', 'admin'].includes(myRole);
  const isOwner = myRole === 'owner';

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(group?.name || '');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const nameRef = useRef(null);
  const [savingName, setSavingName] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingMemberIds, setLoadingMemberIds] = useState(new Set());

  useEffect(() => {
    if (editingName) nameRef.current?.focus();
  }, [editingName]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await api.get(`/api/users/search?q=${searchQuery}`);
      setSearchResults(data.users || []);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const saveName = async () => {
    if (!nameInput.trim() || nameInput === group.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await api.patch(`/api/groups/${group._id}`, { name: nameInput });
      updateGroupInChat(chat._id, { name: nameInput });
      toast.success('Group name updated');
    } catch { toast.error('Failed to update name'); }
    setSavingName(false);
    setEditingName(false);
  };

  const handleLeave = async () => {
    setLoadingLeave(true);
    try {
      await api.delete(`/api/groups/${group._id}/members/${user._id}`);
      removeChat(chat._id);
      onClose();
      toast.success('Left group');
    } catch { toast.error('Failed to leave group'); }
    setLoadingLeave(false);
    setConfirmLeave(false);
  };

  const handleDeleteGroup = async () => {
    setLoadingDelete(true);
    try {
      await api.delete(`/api/groups/${group._id}`);
      removeChat(chat._id);
      onClose();
      toast.success('Group deleted');
    } catch { toast.error('Failed to delete group'); }
    setLoadingDelete(false);
    setConfirmDelete(false);
  };

  const handleRemoveMember = async (memberId) => {
    if (loadingMemberIds.has(memberId)) return;
    setLoadingMemberIds((prev) => new Set(prev).add(memberId));
    try {
      await api.delete(`/api/groups/${group._id}/members/${memberId}`);
      updateGroupInChat(chat._id, {
        members: group.members.filter((m) => (m.user?._id ?? m.user) !== memberId),
      });
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
    setLoadingMemberIds((prev) => { const s = new Set(prev); s.delete(memberId); return s; });
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (loadingMemberIds.has(memberId)) return;
    setLoadingMemberIds((prev) => new Set(prev).add(memberId));
    try {
      await api.patch(`/api/groups/${group._id}/members/${memberId}/role`, { role: newRole });
      updateGroupInChat(chat._id, {
        members: group.members.map((m) =>
          (m.user?._id ?? m.user) === memberId ? { ...m, role: newRole } : m
        ),
      });
      toast.success(newRole === 'admin' ? 'Made admin' : 'Removed admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
    setLoadingMemberIds((prev) => { const s = new Set(prev); s.delete(memberId); return s; });
  };

  const handleAddMember = async (userId) => {
    if (loadingMemberIds.has(userId)) return;
    setLoadingMemberIds((prev) => new Set(prev).add(userId));
    try {
      await api.post(`/api/groups/${group._id}/members`, { userIds: [userId] });
      toast.success('Member added');
      setAddingMember(false);
      setSearchQuery('');
      setSearchResults([]);
      const { data } = await api.get(`/api/groups/${group._id}`);
      updateGroupInChat(chat._id, { members: data.group.members });
    } catch { toast.error('Failed to add member'); }
    setLoadingMemberIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
  };

  const roleIcon = (role) => {
    if (role === 'owner') return <Crown size={11} weight="fill" className="text-yellow-400" title="Owner" />;
    if (role === 'admin') return <Shield size={11} weight="fill" style={{ color: 'var(--accent)' }} title="Admin" />;
    return null;
  };

  const members = group?.members || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <UsersThree size={16} style={{ color: 'var(--accent)' }} />
          <h3 className="text-white font-semibold text-sm">Group Info</h3>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={16} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Group avatar + name */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4 border-b border-white/[0.05]">
          <UserAvatar
            user={{ avatar: group?.avatar, username: group?.name }}
            size="xl"
            className="mb-3"
          />

          {editingName && isAdminOrOwner ? (
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <input
                ref={nameRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="flex-1 bg-white/[0.07] border rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                style={{ borderColor: 'rgba(var(--accent-rgb), 0.4)' }}
              />
              <button onClick={saveName} disabled={savingName} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40">
                {savingName
                  ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  : <Check size={15} weight="bold" />}
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(group.name); }} className="text-white/30 hover:text-white/60">
                <X size={14} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base">{group?.name}</h2>
              {isAdminOrOwner && (
                <button onClick={() => setEditingName(true)} className="text-white/30 hover:text-white/60 transition-colors">
                  <PencilSimple size={13} />
                </button>
              )}
            </div>
          )}

          {group?.description && (
            <p className="text-white/40 text-xs text-center mt-1 px-4">{group.description}</p>
          )}
          <p className="text-white/30 text-xs mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Members list */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs font-medium uppercase tracking-wide">Members</span>
            {isAdminOrOwner && (
              <button
                onClick={() => setAddingMember(!addingMember)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                style={{ color: 'var(--accent)', backgroundColor: 'rgba(var(--accent-rgb), 0.1)' }}
              >
                <UserPlus size={12} weight="bold" /> Add
              </button>
            )}
          </div>

          {/* Add member search */}
          <AnimatePresence>
            {addingMember && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users to add..."
                  className="w-full bg-white/[0.06] border border-white/[0.09] rounded-xl px-3 py-2 text-white placeholder-white/30 text-xs focus:outline-none input-accent-focus mb-2"
                />
                {searchResults.map((u) => {
                  const alreadyIn = members.some((m) => (m.user?._id ?? m.user) === u._id);
                  return (
                    <div key={u._id} className="flex items-center gap-2 px-1 py-1.5">
                      <UserAvatar user={u} size="xs" />
                      <span className="text-white/70 text-xs flex-1 truncate">{u.username}</span>
                      {alreadyIn ? (
                        <span className="text-white/25 text-[10px] shrink-0">Already in</span>
                      ) : loadingMemberIds.has(u._id) ? (
                        <svg className="animate-spin w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                      ) : (
                        <button
                          onClick={() => handleAddMember(u._id)}
                          className="text-xs px-2 py-0.5 rounded-lg shrink-0"
                          style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.2)', color: 'var(--accent)' }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Member rows */}
          <div className="space-y-0.5">
            {members.map((m) => {
              const memberUser = m.user;
              const memberId = memberUser?._id ?? m.user;
              const isSelf = memberId === user?._id;
              // Admin can only interact with regular members; owner can interact with all non-owner
              const canInteract = !isSelf && m.role !== 'owner' &&
                (isOwner || (myRole === 'admin' && m.role === 'member'));

              return (
                <div
                  key={memberId}
                  className="relative flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] group transition-colors"
                >
                  <UserAvatar user={memberUser} size="xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80 text-xs font-medium truncate">
                        {memberUser?.username || 'Unknown'}
                        {isSelf && <span className="text-white/30"> (you)</span>}
                      </span>
                      {roleIcon(m.role)}
                    </div>
                  </div>

                  {/* Action button — three-dots */}
                  {canInteract && (
                    loadingMemberIds.has(memberId)
                      ? <svg className="animate-spin w-3.5 h-3.5 text-white/30 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      : <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === memberId ? null : memberId); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-all"
                        >
                          <DotsThreeVertical size={14} weight="bold" />
                        </button>
                  )}

                  {/* Popover menu */}
                  <AnimatePresence>
                    {openMenuId === memberId && canInteract && (
                      <MemberMenu
                        memberId={memberId}
                        memberRole={m.role}
                        myRole={myRole}
                        groupId={group._id}
                        chatId={chat._id}
                        group={group}
                        onRemove={handleRemoveMember}
                        onRoleChange={handleRoleChange}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-6 mt-2 space-y-2">
          {/* Leave group — everyone */}
          <button
            onClick={() => setConfirmLeave(true)}
            disabled={loadingLeave}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SignOut size={15} weight="bold" />
            Leave Group
          </button>

          {/* Delete group — owner only */}
          {isOwner && (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={loadingDelete}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={15} weight="bold" />
              Delete Group
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmLeave}
        title="Leave group?"
        message={`You will leave "${group?.name}". You won't receive new messages unless added back.`}
        confirmLabel="Leave"
        loading={loadingLeave}
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete group?"
        message={`This will permanently delete "${group?.name}" and all its messages for everyone. This cannot be undone.`}
        confirmLabel="Delete Group"
        loading={loadingDelete}
        onConfirm={handleDeleteGroup}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

// ─── Right Panel ───────────────────────────────────────────────────────────────
const RightPanel = () => {
  const { rightPanel, setRightPanel } = useUIStore();
  const { activeChat, searchMessages, searchResults, clearSearch, clearChat } = useChatStore();
  const { user } = useAuthStore();
  const { removeFriend } = useFriendStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [loadingDeleteChat, setLoadingDeleteChat] = useState(false);
  const [loadingRemoveFriend, setLoadingRemoveFriend] = useState(false);

  const isGroup = activeChat?.type === 'group';

  const handleDeleteChat = async () => {
    setLoadingDeleteChat(true);
    try {
      const { data } = await api.delete(`/api/chats/${activeChat._id}`);
      clearChat(activeChat._id, user._id, data.lastMessage ?? null);
      setRightPanel(null);
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
    setLoadingDeleteChat(false);
    setConfirmDeleteChat(false);
  };

  useEffect(() => {
    if (rightPanel === 'pinned' && activeChat) {
      api.get(`/api/chats/${activeChat._id}/pinned`).then(({ data }) => setPinnedMessages(data.pinnedMessages));
    }
  }, [rightPanel, activeChat]);

  const other = !isGroup ? activeChat?.participants.find((p) => p._id !== user?._id) : null;

  // Group info panel takes the whole panel
  if (rightPanel === 'profile' && isGroup) {
    return <GroupPanel chat={activeChat} onClose={() => setRightPanel(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-white/[0.02]">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="text-white font-semibold text-sm capitalize">{rightPanel}</h3>
        <button onClick={() => setRightPanel(null)} className="text-white/40 hover:text-white transition-colors">
          <X size={16} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightPanel === 'profile' && !isGroup && (
          <div className="text-center">
            <UserAvatar user={other || activeChat?.group} size="xl" className="mx-auto mb-4" />
            <h2 className="text-white font-display font-bold text-lg">{other?.username || activeChat?.group?.name}</h2>
            <p className="text-white/40 text-sm mt-1">{other?.bio || activeChat?.group?.description}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs ${other?.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-white/40'}`}>
                {other?.status || 'offline'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col items-center gap-3">
              {/* Delete chat */}
              <button
                onClick={() => setConfirmDeleteChat(true)}
                className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl text-sm text-white/60 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-all"
              >
                <Trash size={15} weight="bold" />
                Delete Chat
              </button>

              {/* Remove friend — only for direct chats */}
              {other && (
                <>
                  {!confirmRemove ? (
                    <button
                      onClick={() => setConfirmRemove(true)}
                      className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                    >
                      <UserMinus size={15} weight="bold" />
                      Remove Friend
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <p className="text-white/50 text-xs">Remove <span className="text-white font-medium">{other.username}</span> from friends?</p>
                      <div className="flex gap-2 w-full">
                        <button
                          disabled={loadingRemoveFriend}
                          onClick={async () => {
                            setLoadingRemoveFriend(true);
                            const ok = await removeFriend(other._id);
                            setLoadingRemoveFriend(false);
                            if (ok) setRightPanel(null);
                            setConfirmRemove(false);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {loadingRemoveFriend && (
                            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                            </svg>
                          )}
                          Yes, Remove
                        </button>
                        <button
                          onClick={() => setConfirmRemove(false)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 bg-white/[0.07] hover:bg-white/[0.12] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {rightPanel === 'search' && (
          <div className="space-y-3">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeChat && e.target.value.length >= 2) searchMessages(activeChat._id, e.target.value);
                else clearSearch();
              }}
              placeholder="Search in this chat..."
              className="w-full bg-white/[0.06] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none transition-all input-accent-focus"
            />
            <div className="space-y-2">
              {searchResults.map((msg) => (
                <div key={msg._id} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-white/40 text-xs mb-1">{msg.sender?.username}</p>
                  <p className="text-white/70 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {rightPanel === 'pinned' && (
          <div className="space-y-3">
            {pinnedMessages.length === 0 && <p className="text-white/30 text-sm text-center pt-8">No pinned messages</p>}
            {pinnedMessages.map((msg) => (
              <div key={msg._id} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-xs mb-1" style={{ color: 'var(--accent)' }}>{msg.sender?.username}</p>
                <p className="text-white/70 text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDeleteChat}
        title="Delete chat?"
        message="Your sent messages will be deleted. The conversation will remain visible with your friend's messages."
        confirmLabel="Delete"
        loading={loadingDeleteChat}
        onConfirm={handleDeleteChat}
        onCancel={() => setConfirmDeleteChat(false)}
      />
    </div>
  );
};

export default RightPanel;
