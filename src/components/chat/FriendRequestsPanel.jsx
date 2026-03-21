import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, UserPlus } from '@phosphor-icons/react';
import useFriendStore from '@/store/friendStore';
import useUIStore from '@/store/uiStore';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDistanceToNowStrict } from 'date-fns';

const FriendRequestsPanel = () => {
  const { notificationsOpen, toggleNotifications } = useUIStore();
  const { friendRequests, fetchFriendRequests, acceptFriendRequest, declineFriendRequest } = useFriendStore();

  useEffect(() => {
    if (notificationsOpen) fetchFriendRequests();
  }, [notificationsOpen]);

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleNotifications}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-14 left-3 z-50 w-80 bg-surface-98 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <UserPlus size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="text-white font-semibold text-sm">Friend Requests</h3>
                {friendRequests.length > 0 && (
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {friendRequests.length}
                  </span>
                )}
              </div>
              <button onClick={toggleNotifications} className="text-white/40 hover:text-white transition-colors">
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {friendRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.1)' }}
                  >
                    <UserPlus size={22} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-white/50 text-sm">No pending requests</p>
                  <p className="text-white/25 text-xs mt-1">
                    When someone sends you a friend request, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {friendRequests.map((req) => (
                    <RequestItem
                      key={req.from._id}
                      request={req}
                      onAccept={() => acceptFriendRequest(req.from._id)}
                      onDecline={() => declineFriendRequest(req.from._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const RequestItem = ({ request, onAccept, onDecline }) => {
  const { from, createdAt } = request;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all"
    >
      <UserAvatar user={from} size="md" showStatus />

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{from.username}</p>
        <p className="text-white/30 text-xs">{from.bio || 'Wants to connect'}</p>
        <p className="text-white/20 text-[10px] mt-0.5">
          {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>

      <div className="flex gap-1.5 shrink-0">
        {/* Accept */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onAccept}
          className="p-1.5 rounded-lg text-white transition-all"
          style={{ backgroundColor: 'var(--accent)', boxShadow: `0 0 12px rgba(var(--accent-rgb), 0.4)` }}
          title="Accept"
        >
          <Check size={14} weight="bold" />
        </motion.button>

        {/* Decline */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onDecline}
          className="p-1.5 rounded-lg text-white/50 hover:text-red-400 bg-white/[0.07] hover:bg-red-500/10 transition-all"
          title="Decline"
        >
          <X size={14} weight="bold" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FriendRequestsPanel;
