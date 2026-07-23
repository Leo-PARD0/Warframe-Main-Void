import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus, Tag as TagIcon } from 'lucide-react';

export default function TagSelector({ item, allTags, itemTagIds, onToggle }) {
  const [open, setOpen] = useState(false);
  const applied = new Set(itemTagIds);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          aria-label="Gerenciar tags do item"
        >
          <Plus className="h-3 w-3" /> tag
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        <div className="px-2 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <TagIcon className="h-3 w-3" /> Tags do item
        </div>
        <div className="max-h-64 overflow-y-auto flex flex-col gap-0.5">
          {allTags.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">Nenhuma tag criada.</p>
          )}
          {allTags.map((tag) => {
            const active = applied.has(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onToggle(item.id, tag.id)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/60 transition-colors text-left"
              >
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate text-foreground">{tag.name}</span>
                {active && <Check className="h-3.5 w-3.5 text-foreground" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}