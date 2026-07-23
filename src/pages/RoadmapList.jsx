import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Download, Edit2, Map, Plus, Power, Star, Trash2, Upload } from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function NewRoadmapDialog({ onConfirm }) {
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [open, setOpen] = useState(false);
  const submit = () => { if (!name.trim()) return; onConfirm({ name: name.trim(), description: description.trim() }); setName(''); setDescription(''); setOpen(false); };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Novo Roadmap</Button></DialogTrigger><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Novo Roadmap</DialogTitle></DialogHeader><div className="space-y-3 pt-1"><Input placeholder="Nome do roadmap" value={name} onChange={(event) => setName(event.target.value)} autoFocus /><Input placeholder="Descrição (opcional)" value={description} onChange={(event) => setDescription(event.target.value)} /><Button className="w-full" onClick={submit} disabled={!name.trim()}>Criar</Button></div></DialogContent></Dialog>;
}

function downloadRoadmap(payload) { const file = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = `${payload.roadmap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'roadmap'}.warframe-roadmap.json`; link.click(); URL.revokeObjectURL(url); }

function downloadOfflineRoadmap(payload) {
  const file = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.roadmap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'roadmap'}.warframe-roadmap.offline.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RoadmapList() {
  const navigate = useNavigate();
  const { roadmaps, addRoadmap, deleteRoadmap, toggleFavorite, updateRoadmap, getRoadmapData, exportRoadmap, exportRoadmapOffline, importRoadmap } = useRoadmaps();
  const [editId, setEditId] = useState(null); const [editName, setEditName] = useState(''); const [notice, setNotice] = useState(null); const fileInputRef = useRef(null);
  const sorted = [...roadmaps].sort((a, b) => b.updatedAt - a.updatedAt);
  const handleCreate = (options) => {
    const roadmap = addRoadmap(options);
    navigate(`/roadmaps/${roadmap.id}`, { state: { mode: 'edit' } });
  };
  const handleExport = (roadmap) => { try { downloadRoadmap(exportRoadmap(roadmap.id)); setNotice({ type: 'success', message: `"${roadmap.name}" foi exportado.` }); } catch (error) { setNotice({ type: 'error', message: error.message || 'Não foi possível exportar o roadmap.' }); } };
  const handleExportOffline = async (roadmap) => {
    try {
      setNotice({ type: 'success', message: 'Baixando roadmap offline... aguarde.' });
      const payload = await exportRoadmapOffline(roadmap.id);
      downloadOfflineRoadmap(payload);
      setNotice({ type: 'success', message: `"${roadmap.name}" foi exportado como offline.` });
    } catch (error) { setNotice({ type: 'error', message: error.message || 'Não foi possível exportar o roadmap offline.' }); }
  };
  const handleImport = async (event) => { const [file] = event.target.files || []; event.target.value = ''; if (!file) return; if (file.size > 5 * 1024 * 1024) { setNotice({ type: 'error', message: 'O arquivo é grande demais. Limite: 5 MB.' }); return; } try { const roadmap = importRoadmap(JSON.parse(await file.text())); setNotice({ type: 'success', message: `"${roadmap.name}" foi importado.` }); } catch (error) { setNotice({ type: 'error', message: error.message || 'Arquivo JSON inválido.' }); } };

  return <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-8"><div className="flex flex-wrap items-start justify-between gap-4 mb-3"><div><h1 className="text-2xl font-bold tracking-tight">Roadmaps</h1><p className="text-muted-foreground text-sm mt-1">{roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''} criado{roadmaps.length !== 1 ? 's' : ''}</p></div><div className="flex gap-2"><input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} /><Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Importar JSON</Button><NewRoadmapDialog onConfirm={handleCreate} /></div></div><p className="text-xs text-muted-foreground mb-6">Ative um roadmap para incluí-lo no progresso de farms do Dashboard. Use a marca de seleção em cada card para registrar itens farmados.</p>{notice && <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${notice.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>{notice.message}</div>}
  {sorted.length === 0 ? <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4"><Map className="h-12 w-12 opacity-20" /><p className="text-sm">Nenhum roadmap ainda. Crie o primeiro!</p></div> : <div className="space-y-3">{sorted.map((roadmap) => { const nodes = getRoadmapData(roadmap.id).nodes; const done = nodes.filter((node) => node.completed).length; const percent = nodes.length ? Math.round((done / nodes.length) * 100) : 0; return <div key={roadmap.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-all group ${roadmap.active ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/50 bg-card/50 hover:bg-card'}`}><div className="h-10 w-10 rounded-lg border border-border/60 flex-shrink-0" style={{ background: roadmap.bgColor }} /><div className="flex-1 min-w-0">{editId === roadmap.id ? <input className="w-full bg-transparent border-b border-primary outline-none text-sm font-medium py-0.5" value={editName} autoFocus onChange={(event) => setEditName(event.target.value)} onBlur={() => { updateRoadmap(roadmap.id, { name: editName.trim() || roadmap.name }); setEditId(null); }} onKeyDown={(event) => { if (event.key === 'Enter') { updateRoadmap(roadmap.id, { name: editName.trim() || roadmap.name }); setEditId(null); } if (event.key === 'Escape') setEditId(null); }} /> : <div className="flex items-center gap-2"><p className="text-sm font-medium truncate">{roadmap.name}</p>{roadmap.active && <span className="text-[10px] rounded-full bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5">Ativo</span>}</div>}<div className="mt-1.5 flex items-center gap-2"><div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} /></div><span className="text-[11px] text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {done}/{nodes.length} · {percent}%</span></div><p className="text-xs text-muted-foreground mt-1">Editado em {new Date(roadmap.updatedAt).toLocaleDateString('pt-BR')}{roadmap.description && ` · ${roadmap.description}`}</p></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => updateRoadmap(roadmap.id, { active: !roadmap.active })} className={`p-1.5 rounded-md hover:bg-accent ${roadmap.active ? 'text-emerald-300' : 'text-muted-foreground'}`} title={roadmap.active ? 'Desativar farm' : 'Ativar farm'}><Power className="h-4 w-4" /></button><button onClick={() => handleExport(roadmap)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground" title="Exportar JSON"><Download className="h-4 w-4" /></button><button onClick={() => handleExportOffline(roadmap)} className="p-1.5 rounded-md hover:bg-accent text-amber-400" title="Exportar Offline (com cache de itens)"><Download className="h-4 w-4" /></button><button onClick={() => toggleFavorite(roadmap.id)} className={`p-1.5 rounded-md hover:bg-accent ${roadmap.favorite ? 'text-amber-400' : 'text-muted-foreground'}`}><Star className="h-4 w-4" fill={roadmap.favorite ? 'currentColor' : 'none'} /></button><button onClick={() => { setEditId(roadmap.id); setEditName(roadmap.name); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button><button onClick={() => { if (confirm(`Deletar "${roadmap.name}"?`)) deleteRoadmap(roadmap.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div><Link to={`/roadmaps/${roadmap.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0 ml-1">Abrir <ChevronRight className="h-3.5 w-3.5" /></Link></div>; })}</div>}</div>;
}