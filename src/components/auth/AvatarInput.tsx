import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DEFAULT_AVATAR = 'https://placehold.co/400x400/png';

interface AvatarInputProps {
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}

export function AvatarInput({ value, onChange, onError }: AvatarInputProps) {
  const [open, setOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(value);

  const handleSave = () => {
    if (tempUrl.trim()) {
      onChange(tempUrl);
    } else {
      onChange(DEFAULT_AVATAR);
    }
    setOpen(false);
  };

  return (
    <>
      <div className="relative mx-auto h-20 w-20">
        <img
          src={value || DEFAULT_AVATAR}
          alt="Avatar"
          className="h-20 w-20 rounded-full object-cover"
          onError={(e) => {
            if (value !== DEFAULT_AVATAR) {
              onChange(DEFAULT_AVATAR);
              onError('Não foi possível carregar a imagem');
            }
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-white hover:bg-primary/90"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="URL da imagem"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
            />
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 