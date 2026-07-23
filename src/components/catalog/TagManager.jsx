import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tags, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

const PALETTE = [
  '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa',
  '#22d3ee', '#fb923c', '#f472b6', '#c084fc', '#facc15',
];

export default function TagManager({ tags, onCreate, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(PALETTE[0]);
  const [editDesc, setEditDesc] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color, description.trim());
    setName('');
    setDescription('');
    setColor(PALETTE[0]);
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setEditDesc(tag.description || '');
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingId) return;
    onUpdate(editingId, { name: editName.trim(), color: editColor, description: editDesc.trim() });
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <Tags className="h-4 w-4" /> Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Nova tag</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da tag"
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-10 rounded-md border border-border bg-transparent cursor-pointer"
              aria-label="Cor da tag"
            />
            <Button size="sm" onClick={submit} className="gap-1">
              <Plus className="h-4 w-4" /> Criar
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-2"
              >
                <span
                  className="h-4 w-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {editingId === tag.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                    />
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-7 w-8 rounded border border-border cursor-pointer"
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tag.name}</p>
                      {tag.description && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tag.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(tag.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}