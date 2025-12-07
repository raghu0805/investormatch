// src/components/UserListColumn.jsx
export default function UserListColumn({
  title,
  badge,
  color = "green",
  users,
  onUserClick,
}) {
  const colorClasses = {
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-400/40",
    yellow: "bg-amber-500/10 text-amber-300 border-amber-400/40",
    blue: "bg-sky-500/10 text-sky-300 border-sky-400/40",
  };

  const badgeClass = colorClasses[color] || colorClasses.green;

  return (
    <div className="h-full flex flex-col">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
          {title}
        </h2>
        <span
          className={
            "text-[10px] px-2 py-0.5 rounded-full border " + badgeClass
          }
        >
          {badge}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 && (
          <p className="text-xs text-slate-500 px-4 py-3">
            No users in this category yet.
          </p>
        )}

        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => onUserClick(user)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 transition text-left"
          >
            {/* Avatar circle */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-xs font-semibold">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{user.name}</p>
                <span className="text-[10px] text-slate-500">{user.role}</span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {user.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
