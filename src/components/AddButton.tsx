import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}