import { useState } from 'react';
import { Swords, X } from 'lucide-react';
import { ThemeEngine } from '@/lib/themeEngine';
import TagSelector from './TagSelector';
import FriendStatusRow from './FriendStatusRow';
import { RoleBadge } from './SemanticProfileSection';

function RarityPips({ theme }) {
  if (!theme.pips) return null;
  return <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{Array.from({ length: theme.pips }, (_, index) => <span key={index} className="h-1.5 w-1.5 rotate-45" style={{ background: theme.accent, boxShadow: `0 0 5px ${theme.accent}` }} />)}</div>;
}

function ItemImage({ item, theme }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-40 w-full overflow-hidden flex items-center justify-center" style={{ background: theme.background, borderBottom: `2px solid ${theme.border}` }}>
      {item.imageUrl && !failed ? <img src={item.imageUrl} alt={item.name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" /> : <Swords className="h-10 w-10 opacity-30" style={{ color: theme.accent }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/10 pointer-events-none" />
      <RarityPips theme={theme} />
    </div>
  );
}

export default function ItemCard({ item, tags, itemTagIds, friends, friendStatusMap, onToggleTag, onCycleStatus, onOpenDetails, getItemRole }) {
  const theme = ThemeEngine.getTheme(item);
  const role = getItemRole?.(item);
  return (
    <div onClick={() => onOpenDetails?.(item)} className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer" style={{ border: `2px solid ${theme.border}`, background: theme.surface, boxShadow: `inset 0 0 0 1px ${theme.accent}20, 0 8px 22px ${theme.glow || 'rgba(0,0,0,.28)'}` }} onMouseEnter={(event) => { event.currentTarget.style.boxShadow = `inset 0 0 0 1px ${theme.accent}70, 0 12px 30px ${theme.glow || 'rgba(0,0,0,.38)'}`; }} onMouseLeave={(event) => { event.currentTarget.style.boxShadow = `inset 0 0 0 1px ${theme.accent}20, 0 8px 22px ${theme.glow || 'rgba(0,0,0,.28)'}`; }}>
      <ItemImage item={item} theme={theme} />
      <div className="flex flex-col gap-2.5 p-3.5" style={{ color: theme.textColor }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h3><p className="mt-1 text-[10px] uppercase tracking-wider opacity-65">{theme.material}</p></div>
          <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm border" style={{ backgroundColor: theme.badge.bg, color: theme.badge.color, borderColor: `${theme.accent}80` }}>{theme.label || item.displayCategory}</span>
        </div>
        {item.type && <p className="text-[11px] opacity-65 -mt-1">{item.type}</p>}
        {item.attributes?.length > 0 && <p className="text-[11px] leading-snug opacity-75 line-clamp-2" title={item.attributes.join(' · ')}><span className="font-semibold">Atributos: </span>{item.attributes.join(' · ')}</p>}
        
        {/* Role Badge */}
        {role && (
          <div className="pt-1">
            <RoleBadge role={role} size="sm" />
          </div>
        )}
        
        <div onClick={(event) => event.stopPropagation()} className="flex flex-wrap items-center gap-1.5 min-h-[22px]">{itemTagIds.map((id) => { const tag = tags.find((tagItem) => tagItem.id === id); if (!tag) return null; return <span key={id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${tag.color}22`, color: tag.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}<button onClick={() => onToggleTag(item.id, id)} className="ml-0.5 opacity-60 hover:opacity-100" aria-label={`Remover tag ${tag.name}`}><X className="h-2.5 w-2.5" /></button></span>; })}<TagSelector item={item} allTags={tags} itemTagIds={itemTagIds} onToggle={onToggleTag} /></div>
        <div onClick={(event) => event.stopPropagation()} className="pt-2 border-t" style={{ borderColor: `${theme.border}60` }}><FriendStatusRow item={item} friends={friends} friendStatusMap={friendStatusMap} onCycle={onCycleStatus} /></div>
      </div>
    </div>
  );
}
