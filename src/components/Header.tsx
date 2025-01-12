import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentMonth: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

export function Header({ searchQuery, onSearchChange, currentMonth, onMonthChange }: HeaderProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar conta..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => onMonthChange('prev')} className="p-2">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">{currentMonth}</h2>
        <button onClick={() => onMonthChange('next')} className="p-2">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}