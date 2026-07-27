import { useRef, useState } from 'react';
import { Check, Swords, Trash2, Target } from 'lucide-react';
import { ThemeEngine } from '@/lib/themeEngine';
import { ExpandableCardSection } from '@/components/catalog/CraftComponentsPanel';
import { RoleBadge } from '@/components/catalog/SemanticProfileSection';

function RarityPips({ theme }) {
  if (!theme.pips) return null;
  return <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">{Array.from({ length: theme.pips }, (_, index) => <span key={index} className="rotate-45" style={{ width: 4, height: 4, background: theme.accent, boxShadow: `0 0 4px ${theme.accent}` }} />)}</div>;
}

export default function CanvasNode({ node, item, selected, isConnectTool, canMarkComplete, onMouseDown, onDelete, onToggleComplete, onConnectStart, onConnectEnd, zoom, pan, onClick, completedComponents = [], onComponentToggle, role, isActiveFarm, onSetActiveFarm }) {
  const nodeRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  
  const theme = ThemeEngine.getTheme(item);
  if (!item) return null;
  
  // Base dimensions (at zoom = 1)
  const BASE_WIDTH = 140;
  const BASE_HEIGHT = 160;
  
  // Calculate screen position (scaled by zoom)
  const screenX = node.x * zoom + pan.x;
  const screenY = node.y * zoom + pan.y;
  
  // Use CSS transform for scaling - this preserves proportions
  const transform = `translate(${screenX}px, ${screenY}px) scale(${zoom})`;
  const transformOrigin = 'top left';

  const isExpanded = expanded;
  
  return (
    <div 
      ref={nodeRef} 
      style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: BASE_WIDTH, 
        height: isExpanded ? 'auto' : BASE_HEIGHT,
        cursor: isConnectTool ? 'crosshair' : 'grab', 
        zIndex: selected ? 20 : 10, 
        userSelect: 'none',
        transform,
        transformOrigin,
      }} 
      onMouseDown={(event) => { 
        if (isConnectTool) { 
          event.stopPropagation(); 
          onConnectStart(node.id); 
        } else { 
          onMouseDown(event, node.id); 
        } 
      }} 
      onMouseUp={(event) => { 
        if (isConnectTool) { 
          event.stopPropagation(); 
          onConnectEnd(node.id); 
        } 
      }} 
      onClick={(event) => { 
        event.stopPropagation(); 
        onClick?.(node.id); 
      }} 
      className="group"
    >
      <div className="w-full rounded-xl transition-all flex flex-col" style={{ 
        border: `2px solid ${node.completed ? '#34d399' : selected ? theme.accent : theme.border}`, 
        background: theme.surface, 
        color: theme.textColor, 
        opacity: node.completed ? 0.78 : 1, 
        boxShadow: selected 
          ? `0 0 0 2px ${theme.accent}50, 0 9px 24px ${theme.glow || 'rgba(0,0,0,.42)'}` 
          : `inset 0 0 0 1px ${theme.accent}20, 0 5px 15px ${theme.glow || 'rgba(0,0,0,.28)'}`, 
        overflow: isExpanded ? 'visible' : 'hidden', 
        minHeight: BASE_HEIGHT 
      }}>
        <div className="relative overflow-hidden flex-shrink-0" style={{ background: theme.background, borderBottom: `2px solid ${theme.border}` }}>
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              draggable={false} 
              className="w-full h-32 object-contain p-2 transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center">
              <Swords className="opacity-35" style={{ width: 24, height: 24, color: theme.accent }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
          <RarityPips theme={theme} />
        </div>
        <div className="px-2 py-1.5 flex flex-col gap-0.5 flex-1 min-h-0">
          <p className={`font-semibold leading-tight truncate ${node.completed ? 'line-through' : ''}`} style={{ fontSize: 11 }}>
            {item.name}
          </p>
          <span className="text-[8px] uppercase tracking-wide opacity-70 truncate">
            {node.completed ? 'Farmado' : theme.material}
          </span>
          {item.attributes?.length > 0 && (
            <span className="text-[7px] leading-tight opacity-70 truncate" title={item.attributes.join(' · ')}>
              {item.attributes.join(' · ')}
            </span>
          )}
          <span className="text-[8px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm self-start" style={{ background: theme.badge.bg, color: theme.badge.color }}>
            {theme.label || item.displayCategory}
          </span>
        </div>
        {/* Set as Active Farm button - positioned at top-left, above default click behavior */}
        <button
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onSetActiveFarm?.(node.id);
          }}
          className={`absolute top-1 left-1 z-20 h-6 w-6 rounded border flex items-center justify-center transition-colors ${
            node.isActiveFarm
              ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
              : 'bg-background/85 border-border/70 text-muted-foreground hover:border-primary/40 hover:text-primary'
          }`}
          title={node.isActiveFarm ? 'Farm ativo (clique para desativar)' : 'Definir como farm ativo'}
          aria-label={node.isActiveFarm ? 'Farm ativo' : 'Definir como farm ativo'}
        >
          <Target className="h-3.5 w-3.5" />
        </button>
        
        {canMarkComplete && (
          <button 
            onMouseDown={(event) => event.stopPropagation()} 
            onClick={(event) => { 
              event.stopPropagation(); 
              onToggleComplete(node.id); 
            }} 
            className={`absolute top-1 right-1 h-6 w-6 rounded border flex items-center justify-center transition-colors ${
              node.completed 
                ? 'bg-emerald-500 border-emerald-300 text-black' 
                : 'bg-background/85 border-border/70 text-muted-foreground hover:border-emerald-400 hover:text-emerald-300'
            }`} 
            title={node.completed ? 'Marcar como pendente' : 'Marcar como farmado'} 
            aria-label={node.completed ? 'Marcar como pendente' : 'Marcar como farmado'}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {!canMarkComplete && !isConnectTool && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onMouseDown={(event) => { 
                event.stopPropagation(); 
                onDelete(node.id); 
              }} 
              className="h-5 w-5 rounded bg-background/80 border border-border/60 flex items-center justify-center hover:bg-destructive/20 hover:border-destructive" 
              title="Deletar"
            >
              <Trash2 className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </div>
        )}
        {isConnectTool && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-transparent group-hover:ring-primary/60 pointer-events-none" />
        )}
        
        {/* Role Badge for Warframes */}
        {role && (
          <div className="absolute top-1 left-1 z-10 ml-8">
            <RoleBadge role={role} size="sm" />
          </div>
        )}
        
        {/* Expandable components section for composite items */}
        {item.isComposite && item.craftParts?.length > 0 && (
          <ExpandableCardSection
            item={item}
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            completedComponents={completedComponents}
            onComponentToggle={onComponentToggle}
            showProgress={true}
          />
        )}
      </div>
    </div>
  );
}
