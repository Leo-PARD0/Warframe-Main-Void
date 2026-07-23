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
import { Users, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function FriendManager({
  friends,
  onAdd,
  onRename,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName('');
  };

  const saveEdit = (id) => {
    if (!editName.trim()) return;
    onRename(id, editName.trim());
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <Users className="h-4 w-4" /> Amigos
          {friends.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {friends.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Amigos</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do amigo"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <Button size="sm" onClick={submit} className="gap-1" aria-label="Adicionar amigo">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {friends.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum amigo cadastrado.
              </p>
            )}
            {friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5"
              >
                {editingId === f.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(f.id)}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(f.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                      {f.name.trim().charAt(0).toUpperCase() || '?'}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">
                      {f.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(f.id);
                        setEditName(f.name);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(f.id)}
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