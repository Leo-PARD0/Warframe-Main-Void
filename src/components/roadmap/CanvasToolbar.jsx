import { MousePointer2, ArrowRight, ArrowDown, ArrowUp, Plus } from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, title: 'Selecionar / Mover' },
  { id: 'connect-forward', icon: ArrowRight, title: 'Conectar para frente (auto)' },
  { id: 'connect-down', icon: ArrowDown, title: 'Conectar para baixo (auto)' },
  { id: 'connect-up', icon: ArrowUp, title: 'Conectar para cima (auto)' },
  { id: 'add', icon: Plus, title: 'Adicionar item' },
];

export default function CanvasToolbar({ activeTool, onToolChange }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 bg-background/90 backdrop-blur border border-border/60 rounded-xl p-1.5 shadow-xl">
      {TOOLS.map(({ id, icon: Icon, title }, idx) => (
        <div key={id}>
          {idx === 4 && <div className="h-px bg-border/50 my-1" />}
          <button
            title={title}
            onClick={() => onToolChange(id)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
              activeTool === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}