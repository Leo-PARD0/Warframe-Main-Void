import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, Swords, MapPin, Clock, Info, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useWarframeItems } from '@/hooks/useWarframeItems';
import { WarframeRepository } from '@/services/warframe';
import { ThemeEngine } from '@/lib/themeEngine';
import { Input } from '@/components/ui/input';
import { useSemanticProfiles } from '@/hooks/useSemanticProfiles';
import SemanticProfileSection from '@/components/catalog/SemanticProfileSection';
import { CraftComponentsPanel } from '@/components/catalog/CraftComponentsPanel';

function EditableField({ label, value, placeholder, onSave, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { if (!editing) setDraft(value || ''); }, [value, editing]);
  return <div className="space-y-1"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>{!editing && <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>}</div>{editing ? <div className="space-y-1.5">{multiline ? <textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /> : <Input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="text-sm h-8" />}<div className="flex gap-1.5"><button onClick={() => { onSave(draft); setEditing(false); }} className="flex items-center gap-1 text-xs text-primary hover:underline"><Save className="h-3 w-3" /> Salvar</button><button onClick={() => { setDraft(value || ''); setEditing(false); }} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button></div></div> : <p className={`whitespace-pre-line text-sm ${value ? 'text-foreground' : 'text-muted-foreground italic'}`}>{value || placeholder || '—'}</p>}</div>;
}

export function ModRankViewer({ levelStats }) {
  const [rank, setRank] = useState(() => Math.max(0, levelStats.length - 1));
  useEffect(() => setRank(Math.max(0, levelStats.length - 1)), [levelStats]);
  if (!levelStats.length) return <p className="text-sm text-muted-foreground">A API não forneceu ranks para este mod.</p>;
  const stats = levelStats[rank]?.stats?.filter(Boolean) || [];
  return <div className="space-y-4"><div className="flex items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rank</span><button onClick={() => setRank((value) => Math.max(0, value - 1))} disabled={rank === 0} aria-label="Rank anterior" className="rounded-md border border-border p-1 disabled:opacity-35 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-12 text-center text-lg font-bold">{rank}</span><button onClick={() => setRank((value) => Math.min(levelStats.length - 1, value + 1))} disabled={rank === levelStats.length - 1} aria-label="Próximo rank" className="rounded-md border border-border p-1 disabled:opacity-35 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button><div className="ml-1 flex gap-1" aria-label={`${rank} de ${levelStats.length - 1}`}>{levelStats.map((_, index) => <button key={index} onClick={() => setRank(index)} aria-label={`Selecionar rank ${index}`} className={`h-2.5 w-2.5 rounded-full ${index <= rank ? 'bg-amber-400' : 'bg-muted'}`} />)}</div></div><div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 space-y-1.5">{stats.map((stat) => <p key={stat} className="text-sm">{stat}</p>)}</div></div>;
}

function CategoryContent({ item, details, notes, save, loading }) {
  const source = details || item;
  if (item.displayCategory === 'Mod') return <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"><h2 className="text-sm font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Efeito do mod</h2><ModRankViewer levelStats={source.levelStats || []} /></section>;
  const description = notes.description || source.description;
  return <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"><h2 className="text-sm font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> {item.displayCategory === 'Relic' ? 'Informações da relíquia' : 'Descrição'}</h2><EditableField label="Descrição" value={description} placeholder={loading ? 'Consultando dados oficiais...' : 'Sem descrição fornecida pela API.'} onSave={save('description')} multiline /></section>;
}

export default function ItemDetail() {
  const { itemId } = useParams(); const decodedId = decodeURIComponent(itemId);
  const location = useLocation(); const navigate = useNavigate();
  const { itemNotes, updateItemNote, getRoadmapData, updateCompletedComponents } = useRoadmaps();
  const { items, language, loading: catalogLoading } = useWarframeItems();
  const { getProfile, getRole } = useSemanticProfiles();
  const item = useMemo(() => items.find((catalogItem) => catalogItem.id === decodedId), [items, decodedId]);
  const [details, setDetails] = useState(null); const [loading, setLoading] = useState(Boolean(item)); const [error, setError] = useState(null);
  useEffect(() => { if (!item) return undefined; const cachedDetail = WarframeRepository.getCachedDetail(language, item.id); if (cachedDetail) setDetails(cachedDetail); let cancelled = false; setLoading(true); setError(null); WarframeRepository.getItem(item, language, { roadmapId: location.state?.roadmapId }).then((data) => { if (!cancelled) setDetails(data); }).catch(() => { if (!cancelled) setError('Não foi possível carregar os dados oficiais deste item.'); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [item, language]);
  if (catalogLoading) return <div className="flex flex-col items-center justify-center h-screen text-muted-foreground gap-4"><Loader2 className="h-8 w-8 animate-spin" /><p>Carregando item...</p></div>;
  if (!item) return <div className="flex flex-col items-center justify-center h-screen text-muted-foreground gap-4"><Swords className="h-10 w-10 opacity-20" /><p className="text-sm">Item não encontrado</p><Link to="/roadmaps" className="text-primary hover:underline text-sm">Voltar aos Roadmaps</Link></div>;
  const notes = itemNotes[decodedId] || {}; const theme = ThemeEngine.getTheme(details || item); const save = (field) => (value) => updateItemNote(decodedId, { [field]: value });
  const farmLocation = notes.farmLocation || details?.farmSummary; const dropSource = notes.dropSource || details?.dropSource; const requirements = notes.requirements || (details?.masteryReq != null ? `MR ${details.masteryReq}` : 'Sem requisito de maestria informado');
  
  // Obter perfil semântico e role (apenas para Warframes)
  const profile = item.displayCategory === 'Warframe' ? getProfile(item.name) : null;
  const role = item.displayCategory === 'Warframe' ? getRole(item.name) : null;
  
  // Obter componentes completados do roadmap (se houver roadmapId no state)
  const roadmapId = location.state?.roadmapId;
  const roadmapData = roadmapId ? getRoadmapData(roadmapId) : { completedComponents: {} };
  const completedComponents = roadmapData.completedComponents?.[decodedId] || [];

  return <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-8"><button onClick={() => navigate(location.state?.from || '/catalog')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" /> Voltar</button><div className="grid lg:grid-cols-3 gap-8"><aside className="space-y-4"><div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${theme.border}`, background: theme.surface }}><div className="relative" style={{ background: theme.background }}>{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full object-contain p-8 max-h-56" /> : <div className="h-48 flex items-center justify-center"><Swords className="h-14 w-14 opacity-30" /></div>}</div><div className="p-4" style={{ color: theme.textColor }}><h1 className="text-xl font-bold">{item.name}</h1><p className="text-xs uppercase tracking-wider opacity-65 mt-1">{theme.material}</p>{item.type && <p className="text-sm opacity-70 mt-2">{item.type}</p>}</div></div>{loading && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Consultando dados oficiais...</p>}{error && <p className="text-xs text-destructive">{error}</p>}</aside><section className="lg:col-span-2 space-y-6"><section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"><h2 className="text-sm font-semibold">Informações gerais</h2><EditableField label="Categoria" value={notes.customCategory || item.displayCategory} onSave={save('customCategory')} /><EditableField label="Requisitos" value={requirements} onSave={save('requirements')} multiline /></section><CategoryContent item={item} details={details} notes={notes} save={save} loading={loading} />
      
      {/* Perfil Semântico - apenas para Warframes */}
      {item.displayCategory === 'Warframe' && (
        <SemanticProfileSection profile={profile} role={role} />
      )}
      
      {/* Seção "Onde farmar" - comportamento diferente para itens compostos vs simples */}
      {item.isComposite && item.craftParts?.length > 0 ? (
        <CraftComponentsPanel 
          item={item} 
          completedComponents={completedComponents}
          onComponentToggle={(componentId, checked) => {
            if (!roadmapId) return;
            const current = roadmapData.completedComponents?.[decodedId] || [];
            const updated = checked 
              ? [...current, componentId] 
              : current.filter(id => id !== componentId);
            updateCompletedComponents(roadmapId, decodedId, updated);
          }}
          showProgress={true}
        />
      ) : (
        <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"><h2 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> Onde farmar</h2><EditableField label="Local de farm" value={farmLocation} placeholder={loading ? 'Consultando tabela de drops...' : 'Nenhum local encontrado na tabela oficial.'} onSave={save('farmLocation')} multiline /><EditableField label="Fonte do drop" value={dropSource} placeholder="Nenhuma fonte informada." onSave={save('dropSource')} multiline /></section>
      )}
      
      <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"><h2 className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-400" /> Observações</h2><EditableField label="Quando farmar" value={notes.whenToFarm} placeholder="Adicione uma recomendação pessoal." onSave={save('whenToFarm')} /><EditableField label="Observações" value={notes.observations} placeholder="Dicas e estratégias." onSave={save('observations')} multiline /><EditableField label="Notas pessoais" value={notes.personalNotes} placeholder="Anotações livres." onSave={save('personalNotes')} multiline /></section></section></div></div>;
}
