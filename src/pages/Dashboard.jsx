import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, Power, TrendingUp, Package, ChevronDown, ChevronUp, MapPin, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useWarframeItems } from '@/hooks/useWarframeItems';
import { FarmProgressService } from '@/services/FarmProgressService';
import { ThemeEngine } from '@/lib/themeEngine';

function StatCard({ label, value, sub, color = 'text-foreground' }) { return <div className="rounded-xl border border-border/50 bg-card/50 p-5"><p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p><p className={`text-3xl font-bold ${color}`}>{value}</p>{sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}</div>; }

function NextFarmTargetCard({ target, isExpanded, onToggleExpand }) {
  if (!target) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 text-center">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm text-muted-foreground">Nenhum farm ativo ou todos os itens completos.</p>
      </div>
    );
  }

  if (target.completed) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
        <Package className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
        <p className="text-sm font-medium text-emerald-300">Farm completo!</p>
        <p className="text-xs text-muted-foreground mt-1">Todos os itens de <strong>{target.farmName}</strong> foram farmados.</p>
      </div>
    );
  }

  if (target.noActiveItem) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
        <Target className="h-10 w-10 mx-auto mb-3 text-amber-400" />
        <p className="text-sm font-medium text-amber-300">Nenhum objetivo de farm ativo</p>
        <p className="text-xs text-muted-foreground mt-1">
          Selecione um item no roadmap <strong>{target.farmName}</strong> 
          clicando no botão de alvo (🎯) no card do item.
        </p>
      </div>
    );
  }

  const theme = ThemeEngine.getTheme(target.item);
  const locations = target.locations || [];

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5" style={{ borderColor: theme.border + '80' }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: theme.background }}>
          {target.item.imageUrl ? (
            <img src={target.item.imageUrl} alt={target.item.name} className="w-12 h-12 object-contain" />
          ) : (
            <Package className="h-7 w-7 opacity-40" style={{ color: theme.accent }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: theme.badge.bg, color: theme.badge.color }}>
              {target.isComponent ? 'Componente' : theme.label || target.item.displayCategory}
            </span>
            {target.isComponent && target.parentItem && (
              <span className="text-xs text-muted-foreground">de {target.parentItem.name}</span>
            )}
          </div>
          <h3 className="font-semibold text-lg truncate mt-1" style={{ color: theme.textColor }}>{target.item.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Farm: {target.farmName} · {target.progress.completed}/{target.progress.total} ({target.progress.percentage}%)
          </p>
        </div>
        <button
          onClick={() => onToggleExpand(target.node.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Recolher locais' : 'Expandir locais'}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isExpanded && locations.length > 0 && (
        <div className="mt-4 ml-17 border-l border-border/50 pl-4 space-y-2 animate-slide-down">
          {locations.map((loc, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground/80">
              <MapPin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span>{loc.place}</span>
              {loc.rotation && <span className="text-amber-400">· Rotação {loc.rotation}</span>}
              {loc.chance && <span className="text-cyan-400">· {loc.chance}%</span>}
              {loc.rarity && <span className="text-purple-400">· {loc.rarity}</span>}
              {loc.componentName && <span className="text-xs text-muted-foreground">({loc.componentName})</span>}
            </div>
          ))}
        </div>
      )}

      {isExpanded && locations.length === 0 && (
        <div className="mt-4 ml-17 text-sm text-muted-foreground italic">
          Nenhum local de farm encontrado na tabela oficial.
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { roadmaps, getRoadmapData } = useRoadmaps();
  const { items } = useWarframeItems();
  const [nextTarget, setNextTarget] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const itemMap = useMemo(() => new Map(items.map(it => [it.id, it])), [items]);

  const activeRoadmaps = useMemo(() => roadmaps.filter((roadmap) => roadmap.active).map((roadmap) => { 
    const nodes = getRoadmapData(roadmap.id).nodes; 
    const completed = nodes.filter((node) => node.completed).length; 
    return { ...roadmap, total: nodes.length, completed, pending: nodes.length - completed, progress: nodes.length ? Math.round((completed / nodes.length) * 100) : 0 }; 
  }).sort((a, b) => b.updatedAt - a.updatedAt), [roadmaps, getRoadmapData]);

  const totals = useMemo(() => activeRoadmaps.reduce((total, roadmap) => ({ nodes: total.nodes + roadmap.total, completed: total.completed + roadmap.completed }), { nodes: 0, completed: 0 }), [activeRoadmaps]);
  const progress = totals.nodes ? Math.round((totals.completed / totals.nodes) * 100) : 0;
  const pieData = [{ name: 'Farmados', value: totals.completed, color: '#34d399' }, { name: 'Pendentes', value: Math.max(0, totals.nodes - totals.completed), color: '#334155' }].filter((entry) => entry.value > 0);

  // Calcular próximo alvo de farm baseado no item ativo do roadmap ativo
  useEffect(() => {
    if (activeRoadmaps.length === 0) {
      setNextTarget(null);
      return;
    }

    // Usar o primeiro farm ativo (mais recente)
    const farm = activeRoadmaps[0];
    const roadmapData = getRoadmapData(farm.id);
    const nodes = roadmapData.nodes;
    const completedComponents = roadmapData.completedComponents || {};
    const activeFarmNodeId = farm.activeFarmNodeId;

    if (!activeFarmNodeId) {
      // Nenhum item ativo selecionado no roadmap
      setNextTarget({
        noActiveItem: true,
        farmName: farm.name
      });
      return;
    }

    // Encontrar o nó ativo
    const activeNode = nodes.find(n => n.id === activeFarmNodeId);
    if (!activeNode) {
      setNextTarget({
        noActiveItem: true,
        farmName: farm.name
      });
      return;
    }

    const item = itemMap.get(activeNode.itemId);
    if (!item) {
      setNextTarget({
        item: { id: activeNode.itemId, name: 'Item desconhecido', displayCategory: 'Unknown' },
        parentItem: null,
        isComponent: false,
        node: activeNode,
        progress: { completed: 0, total: 0, percentage: 0 },
        locations: [],
        roadmapId: farm.id,
        farmName: farm.name
      });
      return;
    }

    const nodeCompletedComponents = completedComponents[activeNode.id] || [];

    // Se é item composto, verificar componentes pendentes
    if (item.isComposite && item.craftParts?.length > 0) {
      // Encontrar o primeiro componente não marcado
      const pendingComponent = item.craftParts.find(comp => {
        const isCompleted = nodeCompletedComponents.has 
          ? nodeCompletedComponents.has(comp.id) 
          : nodeCompletedComponents.includes(comp.id);
        return !isCompleted;
      });

      if (pendingComponent) {
        // Retornar o componente pendente
        const progress = FarmProgressService.getItemProgress(item, nodeCompletedComponents);
        const locations = FarmProgressService.getFarmLocations(pendingComponent);
        
        setNextTarget({
          item: pendingComponent,
          parentItem: item,
          isComponent: true,
          node: activeNode,
          progress,
          locations,
          roadmapId: farm.id,
          farmName: farm.name
        });
        return;
      } else {
        // Todos os componentes estão completos, mas o nó não está marcado
        const progress = FarmProgressService.getItemProgress(item, nodeCompletedComponents);
        const locations = FarmProgressService.getFarmLocations(item);
        
        setNextTarget({
          item,
          parentItem: null,
          isComponent: false,
          node: activeNode,
          progress,
          locations,
          roadmapId: farm.id,
          farmName: farm.name
        });
        return;
      }
    }

    // Item simples (não composto)
    const progress = { completed: 0, total: 1, percentage: 0 };
    const locations = FarmProgressService.getFarmLocations(item);
    
    setNextTarget({
      item,
      parentItem: null,
      isComponent: false,
      node: activeNode,
      progress,
      locations,
      roadmapId: farm.id,
      farmName: farm.name
    });
  }, [activeRoadmaps, itemMap, getRoadmapData]);

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Calcular isExpanded inline (evita loop infinito)
  const isExpanded = nextTarget?.node ? expandedNodes.has(nextTarget.node.id) : false;

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Progresso ponderado pelos itens de todos os seus farms ativos.</p>
      </div>

      {/* Próximo Item do Farm */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
          <Package className="h-4 w-4" /> Próximo Item do Farm
        </h2>
        <NextFarmTargetCard target={nextTarget} isExpanded={isExpanded} onToggleExpand={toggleExpand} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Farms ativos" value={activeRoadmaps.length} color="text-emerald-400" sub="roadmaps ligados" />
        <StatCard label="Itens no farm" value={totals.nodes} sub="somente roadmaps ativos" />
        <StatCard label="Itens farmados" value={totals.completed} color="text-emerald-400" sub="marcados nos cards" />
        <StatCard label="Progresso geral" value={`${progress}%`} color="text-cyan-300" sub="média ponderada por item" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex flex-col items-center justify-center gap-3">
          <h2 className="text-sm font-semibold self-start flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Progresso dos farms
          </h2>
          {totals.nodes ? (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={78}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222 12% 10%)', border: '1px solid hsl(222 12% 18%)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">Ative um roadmap para acompanhar seu farm.</div>
          )}
          <p className="text-xs text-muted-foreground text-center">O inventário global será adicionado em uma futura atualização.</p>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Farms ativos
            </h2>
            <Link to="/roadmaps" className="text-xs text-primary hover:underline">Gerenciar roadmaps</Link>
          </div>
          {activeRoadmaps.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Power className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum roadmap ativo.</p>
              <Link to="/roadmaps" className="text-xs text-primary hover:underline">Ative um roadmap para começar</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRoadmaps.map((roadmap) => (
                <Link key={roadmap.id} to={`/roadmaps/${roadmap.id}`} className="block rounded-lg border border-border/40 p-3 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{roadmap.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{roadmap.completed}/{roadmap.total} itens farmados</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-300">{roadmap.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${roadmap.progress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" /> Como registrar progresso
        </h2>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Crie ou importe um roadmap.</li>
          <li>Ative-o na lista de Roadmaps.</li>
          <li>No canvas, marque o check de cada asset já farmado.</li>
        </ol>
        <Link to="/roadmaps" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          Abrir Roadmaps <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
