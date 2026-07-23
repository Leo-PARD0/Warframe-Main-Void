import { Tag as TagIcon, X } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Warframe', label: 'Warframes' },
  { value: 'Weapon', label: 'Armas' },
  { value: 'Mod', label: 'Mods' },
  { value: 'Relic', label: 'Relíquias' },
];

export default function FilterPanel({
  resultCount,
  categoryFilter,
  setCategoryFilter,
  types,
  typeFilter,
  setTypeFilter,
  relicStateFilter,
  setRelicStateFilter,
  tags,
  selectedTagIds,
  setSelectedTagIds,
}) {
  const toggleTag = (id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setCategoryFilter('all');
    setTypeFilter('all');
    setRelicStateFilter?.('all');
    setSelectedTagIds([]);
  };

  const hasFilters =
    categoryFilter !== 'all' || typeFilter !== 'all' || relicStateFilter !== 'all' || selectedTagIds.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-foreground font-semibold">{resultCount}</span>
          {resultCount === 1 ? 'item' : 'itens'}
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Limpar
          </button>
        )}
      </div>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Categoria
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => {
            const active = categoryFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setCategoryFilter(opt.value)}
                className={
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all ' +
                  (active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30'
                    : 'bg-transparent text-muted-foreground border-border/70 hover:border-border hover:text-foreground')
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Tipo
        </h3>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full h-9 rounded-lg bg-card border border-border/70 px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <TagIcon className="h-3 w-3" /> Tags
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const active = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                title={tag.description}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1.5"
                style={{
                  borderColor: active ? tag.color : 'rgba(255,255,255,0.12)',
                  backgroundColor: active ? tag.color + '22' : 'transparent',
                  color: active ? tag.color : 'var(--muted-foreground)',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}