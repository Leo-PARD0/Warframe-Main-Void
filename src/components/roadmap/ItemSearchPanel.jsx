import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useWarframeItems } from '@/hooks/useWarframeItems';



export default function ItemSearchPanel({ onSelect, onClose }) {
  const [q, setQ] = useState('');
  const { items } = useWarframeItems();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items.slice(0, 30);
    return items
      .filter((it) => {
        const hay = [it.name, it.displayCategory, it.category, it.type, it.description, ...(it.attributes || [])]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 50);
  }, [q, items]);

  return (
    <div className="w-72 flex flex-col h-full bg-card border-r border-border/60">
      <div className="p-3 border-b border-border/50 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar item farmável…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {results.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhum resultado</p>
        )}
        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent text-left transition-colors"
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="h-8 w-8 object-contain rounded flex-shrink-0 opacity-80" />
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.displayCategory}{item.type ? ` · ${item.type}` : ''}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center p-2 border-t border-border/50">
        Clique para adicionar ao canvas
      </p>
    </div>
  );
}