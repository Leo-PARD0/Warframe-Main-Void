import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome, categoria, tipo ou tag…"
        className="pl-9 pr-9 h-10 bg-card/60 border-border/60 backdrop-blur rounded-full"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}