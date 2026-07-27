import { ChevronDown, ChevronRight, Package, Package2 } from 'lucide-react';
import { ThemeEngine } from '@/lib/themeEngine';
import { useState } from 'react';

export function CraftProgress({ item, completedComponents = [] }) {
  if (!item.isComposite || !item.craftParts?.length) return null;
  
  const total = item.craftParts.length;
  const completed = item.craftParts.filter(c => completedComponents.has ? completedComponents.has(c.id) : completedComponents.includes(c.id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const theme = ThemeEngine.getTheme(item);
  
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Progresso do Craft
        </span>
        <span className="text-sm font-bold" style={{ color: theme.accent }}>
          {completed} / {total} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-300" 
          style={{ 
            width: `${percentage}%`, 
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}dd)` 
          }} 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {percentage === 100 ? 'Pronto para construir!' : `${total - completed} parte(s) restante(s)`}
      </p>
    </div>
  );
}

function FarmLocations({ component }) {
  const drops = component.drops || [];
  const [expanded, setExpanded] = useState(false);
  
  if (drops.length === 0) return null;
  
  if (drops.length === 1) {
    const drop = drops[0];
    return (
      <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
        <span className="text-amber-400">📍</span>
        {drop.place}
        {drop.rotation && ` · Rotação ${drop.rotation}`}
        {drop.chance && ` · ${drop.chance}%`}
        {drop.rarity && ` · ${drop.rarity}`}
      </p>
    );
  }
  
  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        <span className="transition-transform duration-200" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <ChevronRight className="h-3 w-3" />
        </span>
        <span>Locais de Farm ({drops.length})</span>
      </button>
      {expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
          {drops.map((drop, index) => (
            <p key={index} className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <span className="text-amber-400">📍</span>
              {drop.place}
              {drop.rotation && ` · Rotação ${drop.rotation}`}
              {drop.chance && ` · ${drop.chance}%`}
              {drop.rarity && ` · ${drop.rarity}`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function CraftComponentItem({ component, isOwned, onToggle, theme }) {
  const componentTheme = ThemeEngine.getTheme(component);
  
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors cursor-pointer group">
      <input
        type="checkbox"
        checked={isOwned}
        onChange={(e) => { e.stopPropagation(); onToggle(component.id, e.target.checked); }}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
        aria-label={`Marcar ${component.name} como obtido`}
      />
      <div className="flex items-center gap-2 flex-shrink-0">
        {component.imageUrl ? (
          <img 
            src={component.imageUrl} 
            alt={component.name} 
            className="w-10 h-10 object-contain rounded" 
            style={{ background: componentTheme.background }}
          />
        ) : (
          <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: componentTheme.background }}>
            <Package2 className="h-5 w-5 opacity-40" style={{ color: componentTheme.accent }} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{component.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {component.displayCategory || 'Componente'}
          {component.type && ` · ${component.type}`}
        </p>
        {component.crafting && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
            <Package className="h-2.5 w-2.5" />
            {component.crafting.buildTime ? `Tempo: ${Math.round(component.crafting.buildTime / 60)}min` : ''}
            {component.crafting.buildPrice ? ` · Créditos: ${component.crafting.buildPrice.toLocaleString()}` : ''}
          </p>
        )}
        <FarmLocations component={component} />
      </div>
    </label>
  );
}

export function ExpandableCardSection({ 
  item, 
  expanded, 
  onToggle, 
  completedComponents = [], 
  onComponentToggle,
  showProgress = true 
}) {
  if (!item.isComposite || !item.craftParts?.length) return null;
  
  const theme = ThemeEngine.getTheme(item);
  
  return (
    <div className="border-t border-border/50 mt-3 pt-3 space-y-3" style={{ borderColor: theme.border + '80' }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
        aria-expanded={expanded}
        aria-controls="craft-components-panel"
      >
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textColor }}>
          <Package className="h-4 w-4" style={{ color: theme.accent }} />
          Partes de Craft ({item.craftParts.length})
        </span>
        <span className="transition-transform duration-200" style={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          color: theme.accent
        }}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      
      {expanded && (
        <div 
          id="craft-components-panel" 
          className="space-y-2 animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {showProgress && <CraftProgress item={item} completedComponents={completedComponents} />}
          <div className="space-y-2" role="list" aria-label="Partes de craft">
            {item.craftParts.map((component) => (
              <CraftComponentItem
                key={component.id}
                component={component}
                isOwned={completedComponents.has ? completedComponents.has(component.id) : completedComponents.includes(component.id)}
                onToggle={onComponentToggle}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CraftComponentsPanel({ 
  item, 
  completedComponents = [], 
  onComponentToggle,
  showProgress = true 
}) {
  if (!item.isComposite || !item.craftParts?.length) return null;
  
  const theme = ThemeEngine.getTheme(item);
  
  return (
    <section className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4" style={{ borderColor: theme.border + '80' }}>
      <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.textColor }}>
        <Package className="h-4 w-4" style={{ color: theme.accent }} />
        Partes de Craft
      </h2>
      
      {showProgress && <CraftProgress item={item} completedComponents={completedComponents} />}
      
      <div className="space-y-2" role="list" aria-label="Partes de craft">
        {item.craftParts.map((component) => (
          <CraftComponentItem
            key={component.id}
            component={component}
            isOwned={completedComponents.has ? completedComponents.has(component.id) : completedComponents.includes(component.id)}
            onToggle={onComponentToggle}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}
