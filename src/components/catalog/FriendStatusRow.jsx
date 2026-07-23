import { Check } from 'lucide-react';

const STATUS_META = {
  dont: { color: '#64748b', ring: 'rgba(100,116,139,0.35)' },
  farming: { color: '#fbbf24', ring: 'rgba(251,191,36,0.4)' },
  have: { color: '#34d399', ring: 'rgba(52,211,153,0.4)' },
};

export default function FriendStatusRow({
  item,
  friends,
  friendStatusMap,
  onCycle,
}) {
  if (friends.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground/70 italic">
        Cadastre amigos para marcar o progresso.
      </p>
    );
  }

  const statusOf = (friendId) =>
    friendStatusMap[item.id]?.[friendId] || 'dont';

  return (
    <div className="flex flex-wrap gap-1.5">
      {friends.map((f) => {
        const status = statusOf(f.id);
        const meta = STATUS_META[status];
        const initial = f.name.trim().charAt(0).toUpperCase() || '?';
        return (
          <button
            key={f.id}
            onClick={() => onCycle(item.id, f.id)}
            title={`${f.name} — clique para alternar`}
            className="group flex items-center gap-1 rounded-full pl-0.5 pr-2 py-0.5 text-[11px] font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: meta.color + '1f',
              color: meta.color,
              boxShadow: `inset 0 0 0 1px ${meta.ring}`,
            }}
          >
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: meta.color, color: '#0b0d12' }}
            >
              {status === 'have' ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : status === 'farming' ? (
                <span className="animate-pulse">●</span>
              ) : (
                initial
              )}
            </span>
            <span className="max-w-[64px] truncate">{f.name}</span>
          </button>
        );
      })}
    </div>
  );
}