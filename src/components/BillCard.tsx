import { BellPlus, Clock, Pencil, Trash2 } from 'lucide-react';
import { Bill } from '@/types';
import { cn, getDueDateStatus } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

export function BillCard({ bill, onEdit, onDelete }: BillCardProps) {
  const isPaid = bill.status === 'paid';
  const dueDateStatus = getDueDateStatus(bill.due_date);
  const dueDate = parseISO(bill.due_date);

  const getDueDateStyles = () => {
    if (isPaid) return 'bg-transparent';
    
    switch (dueDateStatus) {
      case 'overdue':
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-transparent text-gray-700';
    }
  };

  return (
    <div className="rounded-lg bg-card p-4 shadow-sm border border-gray-200" style={{minHeight: '170px'}}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{bill.name}</h3>
          <p className={cn(
            'text-lg font-semibold',
            isPaid ? 'text-green-600' : 'text-red-600'
          )}>
            R$ {bill.amount.toFixed(2)}
          </p>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p className={cn(
              'inline-flex rounded-lg px-2 py-1 text-sm font-medium',
              getDueDateStyles()
            )} style={{ marginLeft: '-7px' }}>
              Vence em {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
            </p>
            {bill.notifications_enabled && (
              <p className="flex items-center gap-1">
                <BellPlus className="h-4 w-4" /> <span>Notificação: {format(new Date(bill.notification_date), 'dd/MM')} às {bill.notification_time}</span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm font-medium',
                isPaid ? 'text-green-600' : 'text-red-600'
              )}>
                <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />{isPaid ? 'Pago' : 'Pendente'}</span>
              </p>
              {bill.notification_type === 'installments' && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                  {bill.installment_number}/{bill.total_installments}
                </span>
              )}
              {!isPaid && dueDateStatus === 'overdue' && (
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  Atrasada
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bill)}
            className="rounded-full p-2 hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(bill)}
            className="rounded-full p-2 hover:bg-muted"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}