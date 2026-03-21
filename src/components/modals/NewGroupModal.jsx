import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MagnifyingGlass, Users, Plus, CircleNotch, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import UserAvatar from '@/components/ui/UserAvatar';

const NewGroupModal = () => {
  const { closeModal } = useUIStore();
  const { createGroupChat, setActiveChat } = useChatStore();

  const [step, setStep] = useState('members'); // 'members' | 'name'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useCallback(async (value) => {
    setQuery(value);
    if (!value.trim()) { setResults([]); return; }
    setIsSearching(true);
    try {
      const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(value)}`);
      setResults(data.users || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const toggleUser = (user) => {
    setSelected((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { toast.error('Enter a group name'); return; }
    if (selected.length < 1) { toast.error('Select at least one member'); return; }
    setIsCreating(true);
    try {
      const chat = await createGroupChat(groupName.trim(), selected.map((u) => u._id));
      await setActiveChat(chat);
      closeModal();
      toast.success('Group created!');
    } catch {
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-surface-95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Users size={15} weight="fill" className="text-violet-400" />
            </div>
            <h2 className="text-white font-semibold text-sm">
              {step === 'members' ? 'Add Members' : 'Group Name'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        {step === 'members' ? (
          <>
            {/* Search input */}
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="relative">
                <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users to add..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
                />
                {isSearching && (
                  <CircleNotch size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 animate-spin" />
                )}
              </div>

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selected.map((user) => (
                    <span
                      key={user._id}
                      onClick={() => toggleUser(user)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300 cursor-pointer hover:bg-violet-500/20 transition-all"
                    >
                      {user.username}
                      <X size={10} weight="bold" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="max-h-56 overflow-y-auto">
              <AnimatePresence>
                {results.length === 0 && query.trim() && !isSearching && (
                  <div className="px-5 py-6 text-center text-white/30 text-sm">
                    No users found for "{query}"
                  </div>
                )}
                {!query.trim() && (
                  <div className="px-5 py-6 text-center text-white/30 text-sm">
                    Search for users to add to the group
                  </div>
                )}
                {results.map((user) => {
                  const isSelected = !!selected.find((u) => u._id === user._id);
                  return (
                    <motion.button
                      key={user._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => toggleUser(user)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <UserAvatar user={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{user.username}</p>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={16} weight="fill" className="text-violet-400 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-white/40">
                {selected.length} member{selected.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => { if (selected.length > 0) setStep('name'); }}
                disabled={selected.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
              >
                Next
                <Plus size={13} weight="bold" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Name step */}
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Enter group name..."
                maxLength={50}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
              />
              <p className="mt-2 text-xs text-white/30">
                {selected.length} member{selected.length !== 1 ? 's' : ''}: {selected.map((u) => u.username).join(', ')}
              </p>
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => setStep('members')}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !groupName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
              >
                {isCreating ? (
                  <><CircleNotch size={13} className="animate-spin" /> Creating...</>
                ) : (
                  <><Users size={13} weight="fill" /> Create Group</>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default NewGroupModal;
