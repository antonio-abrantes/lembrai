import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface StatusTabsProps {
  total: number;
  paid: number;
  pending: number;
  currentTab: string;
  onTabChange: (value: string) => void;
}

export function StatusTabs({ total, paid, pending, currentTab, onTabChange }: StatusTabsProps) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="relative">
          <div className="space-y-1">
            <p>Todas</p>
            <p className={cn('text-sm font-medium', total === 0 && 'text-muted-foreground')}>
              R$ {total.toFixed(2)}
            </p>
          </div>
        </TabsTrigger>
        <TabsTrigger value="paid">
          <div className="space-y-1">
            <p>Pagas</p>
            <p className={cn('text-sm font-medium text-green-600', paid === 0 && 'text-muted-foreground')}>
              R$ {paid.toFixed(2)}
            </p>
          </div>
        </TabsTrigger>
        <TabsTrigger value="pending">
          <div className="space-y-1">
            <p>A Pagar</p>
            <p className={cn('text-sm font-medium text-red-600', pending === 0 && 'text-muted-foreground')}>
              R$ {pending.toFixed(2)}
            </p>
          </div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}