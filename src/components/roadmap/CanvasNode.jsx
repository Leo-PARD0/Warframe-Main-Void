import { useRef } from 'react';
import { Check, Swords, Trash2 } from 'lucide-react';
import { ThemeEngine } from '@/lib/themeEngine';

function RarityPips({ theme, zoom }) {
  if (!theme.pips) return null;
  return <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">{Array.from({ length: theme.pips }, (_, index) => <span key={index} className="rotate-45" style={{ width: Math.max(3, 4 * zoom), height: Math.max(3, 4 * zoom), background: theme.accent, boxShadow: `0 0 4px ${theme.accent}` }} />)}</div>;
}

export default function CanvasNode({ node, item, selected, isConnectTool, canMarkComplete, onMouseDown, onDelete, onToggleComplete, onConnectStart, onConnectEnd, zoom, pan, onClick }) {
  const nodeRef = useRef(null);
  const theme = ThemeEngine.getTheme(item);
  if (!item) return null;
  const screenX = node.x * zoom + pan.x;
  const screenY = node.y * zoom + pan.y;
  const width = 140 * zoom;
  const height = 160 * zoom;

  return <div ref={nodeRef} style={{ position: 'absolute', left: screenX, top: screenY, width, height, cursor: isConnectTool ? 'crosshair' : 'grab', zIndex: selected ? 20 : 10, userSelect: 'none' }} onMouseDown={(event) => { if (isConnectTool) { event.stopPropagation(); onConnectStart(node.id); } else onMouseDown(event, node.id); }} onMouseUp={(event) => { if (isConnectTool) { event.stopPropagation(); onConnectEnd(node.id); } }} onClick={(event) => { event.stopPropagation(); onClick?.(node.id); }} className="group">
    <div className="w-full h-full rounded-xl overflow-hidden transition-all" style={{ border: `2px solid ${node.completed ? '#34d399' : selected ? theme.accent : theme.border}`, background: theme.surface, color: theme.textColor, opacity: node.completed ? 0.78 : 1, boxShadow: selected ? `0 0 0 2px ${theme.accent}50, 0 9px 24px ${theme.glow || 'rgba(0,0,0,.42)'}` : `inset 0 0 0 1px ${theme.accent}20, 0 5px 15px ${theme.glow || 'rgba(0,0,0,.28)'}` }}>
      <div className="relative overflow-hidden" style={{ height: '55%', background: theme.background, borderBottom: `2px solid ${theme.border}` }}>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} draggable={false} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center"><Swords className="opacity-35" style={{ width: 24 * zoom, height: 24 * zoom, color: theme.accent }} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" /><RarityPips theme={theme} zoom={zoom} />
      </div>
      <div className="px-2 py-1.5 flex flex-col gap-0.5" style={{ height: '45%' }}><p className={`font-semibold leading-tight truncate ${node.completed ? 'line-through' : ''}`} style={{ fontSize: Math.max(8, 11 * zoom) }}>{item.name}</p><span className="text-[8px] uppercase tracking-wide opacity-70 truncate">{node.completed ? 'Farmado' : theme.material}</span>{item.attributes?.length > 0 && <span className="text-[7px] leading-tight opacity-70 truncate" title={item.attributes.join(' · ')}>{item.attributes.join(' · ')}</span>}
      <span className="text-[8px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm self-start" style={{ background: theme.badge.bg, color: theme.badge.color }}>{theme.label || item.displayCategory}</span></div>
      {canMarkComplete && <button onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onToggleComplete(node.id); }} className={`absolute top-1 right-1 h-6 w-6 rounded border flex items-center justify-center transition-colors ${node.completed ? 'bg-emerald-500 border-emerald-300 text-black' : 'bg-background/85 border-border/70 text-muted-foreground hover:border-emerald-400 hover:text-emerald-300'}`} title={node.completed ? 'Marcar como pendente' : 'Marcar como farmado'} aria-label={node.completed ? 'Marcar como pendente' : 'Marcar como farmado'}><Check className="h-3.5 w-3.5" /></button>}
      {!canMarkComplete && !isConnectTool && <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onMouseDown={(event) => { event.stopPropagation(); onDelete(node.id); }} className="h-5 w-5 rounded bg-background/80 border border-border/60 flex items-center justify-center hover:bg-destructive/20 hover:border-destructive" title="Deletar"><Trash2 className="h-2.5 w-2.5 text-muted-foreground" /></button></div>}
      {isConnectTool && <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-transparent group-hover:ring-primary/60 pointer-events-none" />}
    </div>
  </div>;
}