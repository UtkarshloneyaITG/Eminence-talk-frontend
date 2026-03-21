const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

const statusColors = {
  online: 'bg-emerald-400',
  offline: 'bg-white/20',
  away: 'bg-yellow-400',
  busy: 'bg-red-400',
};

const getInitials = (name = '') => name.slice(0, 2).toUpperCase() || '??';
const getGradient = (name = '') => {
  const gradients = [
    'from-violet-600 to-indigo-600',
    'from-pink-600 to-violet-600',
    'from-cyan-600 to-blue-600',
    'from-emerald-600 to-cyan-600',
    'from-orange-600 to-pink-600',
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
};

const UserAvatar = ({ user, size = 'md', showStatus = false, isOnline, className = '' }) => {
  const sizeClass = sizes[size] || sizes.md;
  const name = user?.username || user?.name || '';
  const status = isOnline ? 'online' : user?.status || 'offline';
  const statusColor = statusColors[status] || statusColors.offline;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {user?.avatar?.url ? (
        <img
          src={user.avatar.url}
          alt={name}
          className={`${sizeClass} rounded-xl object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-xl bg-gradient-to-br ${getGradient(name)} flex items-center justify-center font-semibold text-white`}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${statusColor}`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
