import { Tag as TagIcon, X, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Warframe', label: 'Warframes' },
  { value: 'Weapon', label: 'Armas' },
  { value: 'Mod', label: 'Mods' },
  { value: 'Relic', label: 'Relíquias' },
  { value: 'Arcane', label: 'Arcanes' },
  { value: 'AmpComponent', label: 'Componentes de Amp' },
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
  // Novos props para ordenação e filtro por role
  sortBy,
  setSortBy,
  sortOrder,
  toggleSortOrder,
  roleFilter,
  setRoleFilter,
  availableRoles,
  SORT_OPTIONS,
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
    setRoleFilter('all');
  };

  const hasFilters =
    categoryFilter !== 'all' || typeFilter !== 'all' || relicStateFilter !== 'all' || selectedTagIds.length > 0 || roleFilter !== 'all';

  const sortOrderIcon = sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;

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

      {/* Sort By Section */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <ArrowUpDown className="h-3 w-3" /> Ordenar por
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 h-9 rounded-lg bg-card border border-border/70 px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleSortOrder}
            className="h-9 w-9 rounded-lg bg-card border border-border/70 flex items-center justify-center hover:bg-accent transition-colors"
            aria-label={sortOrder === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
            title={sortOrder === 'asc' ? 'Crescente (A-Z / Menor para Maior)' : 'Decrescente (Z-A / Maior para Menor)'}
          >
            {sortOrderIcon}
          </button>
        </div>
      </section>

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

      {/* Role Filter Section */}
      {availableRoles.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <TagIcon className="h-3 w-3" /> Role
          </h3>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-9 rounded-lg bg-card border border-border/70 px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas as Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </section>
      )}

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
