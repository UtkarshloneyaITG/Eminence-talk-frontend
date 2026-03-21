const TypingIndicator = ({ users }) => {
  if (!users?.length) return null;
  const names = users.map((u) => u.username).join(', ');
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--accent)' }}>
        {names} {users.length === 1 ? 'is' : 'are'} typing
      </span>
    </div>
  );
};

export default TypingIndicator;
