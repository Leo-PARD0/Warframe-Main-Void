import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Loader2, AlertCircle, Swords, RefreshCw, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCatalog } from '@/hooks/useCatalog';
import SearchBar from '@/components/catalog/SearchBar';
import FilterPanel from '@/components/catalog/FilterPanel';
import ItemCard from '@/components/catalog/ItemCard';
import TagManager from '@/components/catalog/TagManager';
import FriendManager from '@/components/catalog/FriendManager';

function ApiStatus({ status, onRefresh }) {
  const tone = status.checking ? 'border-amber-400/30 text-amber-300' : status.ok ? 'border-emerald-400/30 text-emerald-300' : 'border-destructive/40 text-destructive';
  const label = status.checking ? 'Verificando API...' : status.ok ? `API online · HTTP ${status.status}` : `API indisponível${status.status ? ` · HTTP ${status.status}` : ''}`;
  return <button onClick={onRefresh} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-accent ${tone}`} title="Atualizar status da API"><Server className="h-3 w-3" />{label}{status.latency != null && <span className="opacity-65">{status.latency}ms</span>}<RefreshCw className={`h-3 w-3 ${status.checking ? 'animate-spin' : ''}`} /></button>;
}
export default function Home() {
  const catalog = useCatalog();
  const navigate = useNavigate();
  const sentinelRef = useRef(null);

  const { visible, filtered, loading, error, PAGE_SIZE } = catalog;

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          catalog.setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [catalog, PAGE_SIZE]);

  // "Farm list": items where at least one friend is farming
  const farmList = useMemo(
    () =>
      filtered.filter((it) => {
        const m = catalog.friendStatusMap[it.id];
        return m && Object.values(m).some((s) => s === 'farming');
      }),
    [filtered, catalog.friendStatusMap]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Catalog sub-header */}
      <div className="sticky top-[52px] z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <div className="flex-1 max-w-2xl mx-auto">
            <SearchBar value={catalog.search} onChange={catalog.setSearch} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ApiStatus status={catalog.apiStatus} onRefresh={catalog.refreshApiStatus} />
            {/* Mobile filters */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full lg:hidden gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                </DialogHeader>
                <FilterPanel
                  resultCount={filtered.length}
                  categoryFilter={catalog.categoryFilter}
                  setCategoryFilter={catalog.setCategoryFilter}
                  types={catalog.types}
                  typeFilter={catalog.typeFilter}
                  setTypeFilter={catalog.setTypeFilter}
                  relicStateFilter={catalog.relicStateFilter}
                  setRelicStateFilter={catalog.setRelicStateFilter}
                  tags={catalog.tags}
                  selectedTagIds={catalog.selectedTagIds}
                  setSelectedTagIds={catalog.setSelectedTagIds}
                />
              </DialogContent>
            </Dialog>

            <TagManager
              tags={catalog.tags}
              onCreate={catalog.createTag}
              onUpdate={catalog.updateTag}
              onDelete={catalog.deleteTag}
            />
            <FriendManager
              friends={catalog.friends}
              onAdd={catalog.addFriend}
              onRename={catalog.renameFriend}
              onDelete={catalog.deleteFriend}
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-[108px] rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur">
            <FilterPanel
              resultCount={filtered.length}
              categoryFilter={catalog.categoryFilter}
              setCategoryFilter={catalog.setCategoryFilter}
              types={catalog.types}
              typeFilter={catalog.typeFilter}
              setTypeFilter={catalog.setTypeFilter}
                  relicStateFilter={catalog.relicStateFilter}
                  setRelicStateFilter={catalog.setRelicStateFilter}
              tags={catalog.tags}
              selectedTagIds={catalog.selectedTagIds}
              setSelectedTagIds={catalog.setSelectedTagIds}
            />
          </div>
        </aside>

        {/* Main grid */}
        <main className="flex-1 min-w-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm">Carregando itens da API do Warframe…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {farmList.length > 0 && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <h2 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    Farm list — {farmList.length} {farmList.length === 1 ? 'item' : 'itens'} sendo farmados
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {farmList.slice(0, 12).map((it) => (
                      <span
                        key={it.id}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/90"
                      >
                        {it.name}
                      </span>
                    ))}
                    {farmList.length > 12 && (
                      <span className="text-[11px] px-2 py-0.5 text-muted-foreground">
                        +{farmList.length - 12}…
                      </span>
                    )}
                  </div>
                </div>
              )}

              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-2">
                  <Swords className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Nenhum item encontrado com os filtros atuais.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visible.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      tags={catalog.tags}
                      itemTagIds={catalog.itemTags[item.id] || []}
                      friends={catalog.friends}
                      friendStatusMap={catalog.friendStatusMap}
                      onToggleTag={catalog.toggleItemTag}
                      onCycleStatus={catalog.cycleFriendStatus}
                      onOpenDetails={(selectedItem) => navigate(`/item/${encodeURIComponent(selectedItem.id)}`, { state: { from: '/catalog' } })}
                    />
                  ))}
                </div>
              )}

              <div ref={sentinelRef} className="h-10" />
              {visible.length < filtered.length && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}