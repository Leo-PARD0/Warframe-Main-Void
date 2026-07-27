import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Search, SlidersHorizontal, Swords, ChevronUp, ChevronDown } from 'lucide-react';
import { useWarframeItems } from '@/hooks/useWarframeItems';
import { ThemeEngine } from '@/lib/themeEngine';
import { useSemanticProfiles } from '@/hooks/useSemanticProfiles';

const PAGE_SIZE = 40;

// ── Static filter hierarchy ──────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['Todos', 'Warframe', 'Weapon', 'Mod', 'Relic', 'Arcane', 'AmpComponent'];

// Sort options for the asset picker
const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'role', label: 'Role' },
  { value: 'damage', label: 'Damage' },
  { value: 'survivability', label: 'Survivability' },
  { value: 'support', label: 'Support' },
  { value: 'crowdControl', label: 'Crowd Control' },
  { value: 'stealth', label: 'Stealth' },
  { value: 'complexity', label: 'Complexity' },
];

// ── Mini ItemCard for the picker ─────────────────────────────────────────────
function PickerCard({ item, onSelect, getItemRole, getRoleIcon, getRoleColors }) {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = ThemeEngine.getTheme(item);
  const role = getItemRole?.(item);
  const roleIcon = role ? getRoleIcon(role.name) : '';
  const roleColors = role ? getRoleColors(role.name) : null;

  return (
    <button
      onClick={() => onSelect(item)}
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-left cursor-pointer"
      style={{ border: `1px solid ${theme.border}50`, background: 'hsl(var(--card) / 0.5)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = theme.border + 'a0'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border + '50'; }}
    >
      <div className="relative h-32 w-full overflow-hidden flex-shrink-0" style={{ background: theme.background }}>
        {item.imageUrl && !imgFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Swords className="h-8 w-8 opacity-20" style={{ color: theme.accent }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <p className="font-semibold text-xs leading-tight text-foreground line-clamp-2">{item.name}</p>
        <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full self-start"
          style={{ backgroundColor: theme.badge.bg, color: theme.badge.color }}>{theme.label || item.displayCategory}</span>
        {item.type && <p className="text-[10px] text-muted-foreground truncate">{item.type}</p>}
        {item.displayCategory === 'Relic' && <p className={`text-[10px] font-medium ${item.vaulted ? 'text-amber-400' : 'text-emerald-400'}`}>{item.vaulted ? 'Vaulted' : 'Disponível'}</p>}
        {item.attributes?.length > 0 && <p className="text-[10px] text-muted-foreground line-clamp-2" title={item.attributes.join(' · ')}>{item.attributes.join(' · ')}</p>}
        
        {/* Role Badge for Warframes */}
        {role && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide border self-start mt-1"
            style={{
              backgroundColor: roleColors.bgLight,
              color: roleColors.text,
              borderColor: roleColors.border,
            }}
            title={role.description}
          >
            <span aria-hidden="true">{roleIcon}</span>
            {role.name}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Filter Popover ────────────────────────────────────────────────────────────
function FilterPopover({ items, activeCategory, filters, setFilters, onClose }) {
  // Derive dynamic type options for weapons
  const weaponTypes = useMemo(() => {
    if (activeCategory !== 'Weapon') return [];
    const types = new Set();
    items.filter(i => i.displayCategory === 'Weapon').forEach(i => { if (i.type) types.add(i.type); });
    return Array.from(types).sort();
  }, [items, activeCategory]);

  const modTypes = useMemo(() => {
    if (activeCategory !== 'Mod') return [];
    const types = new Set();
    items.filter(i => i.displayCategory === 'Mod').forEach(i => { if (i.type) types.add(i.type); });
    return Array.from(types).sort();
  }, [items, activeCategory]);

  const toggle = (key, value) => {
    setFilters(prev => {
      const current = prev[key] ?? [];
      const has = current.includes(value);
      return { ...prev, [key]: has ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const Chip = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Filtros</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>

      {activeCategory === 'Warframe' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tipo</p>
          <div className="flex flex-wrap gap-1.5">
            {[{ label: 'Prime', v: 'prime' }, { label: 'Não Prime', v: 'non_prime' }].map(opt => (
              <Chip key={opt.v} label={opt.label} active={(filters.warframe_type ?? []).includes(opt.v)} onClick={() => toggle('warframe_type', opt.v)} />
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'Weapon' && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Categoria</p>
            <div className="flex flex-wrap gap-1.5">
              {['Primary', 'Secondary', 'Melee'].map(cat => (
                <Chip key={cat} label={cat} active={(filters.weapon_category ?? []).includes(cat)} onClick={() => toggle('weapon_category', cat)} />
              ))}
            </div>
          </div>
          {weaponTypes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tipo</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {weaponTypes.map(t => (
                  <Chip key={t} label={t} active={(filters.weapon_type ?? []).includes(t)} onClick={() => toggle('weapon_type', t)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeCategory === 'Relic' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Disponibilidade</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip label="Disponível" active={(filters.relic_state ?? []).includes('available')} onClick={() => toggle('relic_state', 'available')} />
            <Chip label="Vaulted" active={(filters.relic_state ?? []).includes('vaulted')} onClick={() => toggle('relic_state', 'vaulted')} />
          </div>
        </div>
      )}
      {activeCategory === 'Mod' && modTypes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tipo</p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {modTypes.map(t => (
              <Chip key={t} label={t} active={(filters.mod_type ?? []).includes(t)} onClick={() => toggle('mod_type', t)} />
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'Todos' && (
        <p className="text-xs text-muted-foreground">Selecione uma categoria para ver filtros específicos.</p>
      )}

      <button
        onClick={() => setFilters({})}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors self-start mt-1"
      >
        Limpar filtros
      </button>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AssetPickerModal({ onSelect, onClose }) {
  const { items: allItems } = useWarframeItems();
  const { getProfile, getRole, getScore, getRoleIcon, getRoleColors } = useSemanticProfiles();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const loaderRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Helper to get role for an item
  const getItemRole = useCallback((item) => {
    if (item.displayCategory !== 'Warframe') return null;
    return getRole(item.name);
  }, [getRole]);

  // Helper to get score for sorting
  const getItemScore = useCallback((item, category) => {
    if (item.displayCategory !== 'Warframe') return 0;
    const profile = getProfile(item.name);
    return getScore(profile, category);
  }, [getProfile, getScore]);

  const filtered = useMemo(() => {
    let list = allItems;
    const q = query.toLowerCase().trim();
    if (q) list = list.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.displayCategory?.toLowerCase().includes(q) ||
      i.type?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.attributes?.some((attribute) => attribute.toLowerCase().includes(q))
    );
    if (activeCategory !== 'Todos') list = list.filter(i => i.displayCategory === activeCategory);

    // Warframe filters
    if (activeCategory === 'Warframe') {
      const wt = filters.warframe_type ?? [];
      if (wt.length > 0) {
        list = list.filter(i => {
          const isPrime = i.name?.toLowerCase().includes('prime');
          if (wt.includes('prime') && wt.includes('non_prime')) return true;
          if (wt.includes('prime')) return isPrime;
          if (wt.includes('non_prime')) return !isPrime;
          return true;
        });
      }
    }
    // Weapon filters
    if (activeCategory === 'Weapon') {
      const wc = filters.weapon_category ?? [];
      if (wc.length > 0) list = list.filter(i => wc.includes(i.category));
      const wt = filters.weapon_type ?? [];
      if (wt.length > 0) list = list.filter(i => wt.includes(i.type));
    }
    // Relic filters
    if (activeCategory === 'Relic') {
      const state = filters.relic_state ?? [];
      if (state.length > 0) list = list.filter((item) => state.includes(item.vaulted ? 'vaulted' : 'available'));
    }
    // Mod filters
    if (activeCategory === 'Mod') {
      const mt = filters.mod_type ?? [];
      if (mt.length > 0) list = list.filter(i => mt.includes(i.type));
    }

    // Sort
    list = [...list].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role': {
          const roleA = getItemRole(a);
          const roleB = getItemRole(b);
          const nameA = roleA?.name || 'ZZZ';
          const nameB = roleB?.name || 'ZZZ';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'damage':
        case 'survivability':
        case 'support':
        case 'crowdControl':
        case 'stealth':
        case 'complexity': {
          const scoreA = getItemScore(a, sortBy);
          const scoreB = getItemScore(b, sortBy);
          comparison = scoreA - scoreB;
          break;
        }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [allItems, query, activeCategory, filters, sortBy, sortOrder, getItemRole, getItemScore]);

  // Reset pagination when filters change
  useEffect(() => { setPage(1); }, [query, activeCategory, filters, sortBy, sortOrder]);

  const visibleItems = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleItems.length < filtered.length) setPage(p => p + 1);
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [visibleItems.length, filtered.length]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (activeCategory !== 'Todos') chips.push({ label: activeCategory, clear: () => { setActiveCategory('Todos'); setFilters({}); } });
    (filters.warframe_type ?? []).forEach(v => chips.push({ label: v === 'prime' ? 'Prime' : 'Não Prime', clear: () => setFilters(p => ({ ...p, warframe_type: (p.warframe_type ?? []).filter(x => x !== v) })) }));
    (filters.weapon_category ?? []).forEach(v => chips.push({ label: v, clear: () => setFilters(p => ({ ...p, weapon_category: (p.weapon_category ?? []).filter(x => x !== v) })) }));
    (filters.weapon_type ?? []).forEach(v => chips.push({ label: v, clear: () => setFilters(p => ({ ...p, weapon_type: (p.weapon_type ?? []).filter(x => x !== v) })) }));
    (filters.mod_type ?? []).forEach(v => chips.push({ label: v, clear: () => setFilters(p => ({ ...p, mod_type: (p.mod_type ?? []).filter(x => x !== v) })) }));
    (filters.relic_state ?? []).forEach(v => chips.push({ label: v === 'vaulted' ? 'Vaulted' : 'Disponível', clear: () => setFilters(p => ({ ...p, relic_state: (p.relic_state ?? []).filter(x => x !== v) })) }));
    return chips;
  }, [activeCategory, filters]);

  const handleSelect = useCallback((item) => {
    onSelect(item);
    onClose();
  }, [onSelect, onClose]);

  const sortOrderIcon = sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '80vw', height: '80vh', maxWidth: 1100 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-2 px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.stopPropagation()}
                  placeholder="Pesquisar por nome, categoria, tipo ou atributo..."
                  className="w-full h-9 bg-muted/50 border border-input rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 w-40 rounded-lg bg-card border border-border/70 px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="h-9 w-9 rounded-lg bg-card border border-border/70 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label={sortOrder === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
                title={sortOrder === 'asc' ? 'Crescente (A-Z / Menor para Maior)' : 'Decrescente (Z-A / Maior para Menor)'}
              >
                {sortOrderIcon}
              </button>
            </div>
            {/* Filters button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  showFilters || activeChips.length > 0
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'border-input text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
                {activeChips.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>
              {showFilters && (
                <FilterPopover
                  items={allItems}
                  activeCategory={activeCategory}
                  filters={filters}
                  setFilters={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1">
            {CATEGORY_OPTIONS.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setFilters({}); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={chip.clear}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
                >
                  {chip.label}
                  <X className="h-2.5 w-2.5" />
                </button>
              ))}
              <button
                onClick={() => { setFilters({}); setActiveCategory('Todos'); }}
                className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] hover:bg-accent transition-colors"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Swords className="h-10 w-10 opacity-20" />
              <p className="text-sm">Nenhum item encontrado</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-3">{filtered.length} itens</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {visibleItems.map(item => (
                  <PickerCard 
                    key={item.id} 
                    item={item} 
                    onSelect={handleSelect}
                    getItemRole={getItemRole}
                    getRoleIcon={getRoleIcon}
                    getRoleColors={getRoleColors}
                  />
                ))}
              </div>
              {/* Infinite scroll loader */}
              <div ref={loaderRef} className="h-8 mt-2 flex items-center justify-center">
                {visibleItems.length < filtered.length && (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
