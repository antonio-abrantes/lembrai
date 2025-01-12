import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Bill } from '@/types';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// Primeiro, vamos definir o tipo para um bill individual nas parcelas
const billInstallmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  notifications_enabled: z.boolean(),
  notification_type: z.enum(['specific_date', 'installments']),
  notification_date: z.string().optional(),
  notification_time: z.string().optional(),
  installments: z.number().optional(),
  status: z.enum(['pending', 'paid']),
  month: z.string(),
  installment_number: z.number().optional(),
  total_installments: z.number().optional(),
});

// Schema base sem o campo installments
const baseSchema = {
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  notifications_enabled: z.boolean(),
  notification_type: z.enum(['specific_date', 'installments']),
  notification_date: z.string().optional(),
  notification_time: z.string().optional(),
  status: z.enum(['pending', 'paid']),
  month: z.string(),
};

// Schema para edição (sem installments)
const editSchema = z.object({
  ...baseSchema,
  installment_number: z.number().optional(),
  total_installments: z.number().optional(),
});

// Schema para criação (com installments)
const createSchema = z.object({
  ...baseSchema,
  installments: z.number().optional(),
  bills: z.array(billInstallmentSchema).optional(),
});

type FormData = z.infer<typeof editSchema> & z.infer<typeof createSchema>;

interface BillFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  bill?: Bill;
}

export function BillFormModal({ open, onOpenChange, onSubmit, bill }: BillFormModalProps) {
  const isMobile = useBreakpoint(560);
  const form = useForm<FormData>({
    resolver: zodResolver(bill ? editSchema : createSchema),
    defaultValues: {
      name: '',
      amount: '',
      due_date: '',
      notifications_enabled: false,
      notification_type: 'specific_date',
      notification_date: '',
      notification_time: '',
      installments: undefined,
      status: 'pending',
      month: new Date().toLocaleString('pt-BR', { month: 'long' }),
    },
  });

  useEffect(() => {
    if (bill) {
      // Função auxiliar para formatar a data para o formato YYYY-MM-DD
      const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      };

      form.reset({
        name: bill.name,
        amount: bill.amount.toString(),
        due_date: formatDate(bill.due_date),
        notifications_enabled: bill.notifications_enabled,
        notification_type: bill.notification_type || 'specific_date',
        notification_date: bill.notification_date ? formatDate(bill.notification_date) : '',
        notification_time: bill.notification_time || '',
        installments: bill.installments,
        status: bill.status,
        month: bill.month,
      });
    } else {
      form.reset({
        name: '',
        amount: '',
        due_date: '',
        notifications_enabled: false,
        notification_type: 'specific_date',
        notification_date: '',
        notification_time: '',
        installments: undefined,
        status: 'pending',
        month: new Date().toLocaleString('pt-BR', { month: 'long' }),
      });
    }
  }, [bill, form]);

const handleFormSubmit = async (data: FormData) => {
  const dueDate = new Date(data.due_date);
  const notificationDate = new Date(data.notification_date || "");

  // Se estiver editando uma parcela existente, apenas atualiza ela
  if (bill?.installment_number) {
    const currentDueDate = new Date(data.due_date);
    let month = currentDueDate.toLocaleString('pt-BR', { month: 'long' });
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    await onSubmit({ ...data, month });
    return;
  }
  // Se for novo registro com parcelas
  else if (data.notifications_enabled && data.notification_type === 'installments') {
    // Validação manual do número de parcelas
    if (!data.installments || data.installments < 1) {
      form.setError('installments', {
        type: 'manual',
        message: 'Número de parcelas é obrigatório e deve ser maior que 0'
      });
      return;
    }

    const bills = [];
    for (let i = 0; i < data.installments; i++) {
      const currentDueDate = new Date(dueDate);
      currentDueDate.setMonth(dueDate.getMonth() + i);

      const currentNotificationDate = new Date(notificationDate);
      currentNotificationDate.setMonth(notificationDate.getMonth() + i);

      let month = currentDueDate.toLocaleString('pt-BR', { month: 'long' });
      month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

      bills.push({
        name: data.name,
        amount: data.amount,
        due_date: currentDueDate.toISOString().split('T')[0],
        notifications_enabled: data.notifications_enabled,
        notification_type: data.notification_type,
        notification_date: currentNotificationDate.toISOString().split('T')[0],
        notification_time: data.notification_time,
        status: data.status,
        month,
        installment_number: i + 1,
        total_installments: data.installments,
      });
    }

    await onSubmit({ ...data, bills });
  } 
  // Se for registro único
  else {
    const currentDueDate = new Date(data.due_date);
    let month = currentDueDate.toLocaleString('pt-BR', { month: 'long' });
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    await onSubmit({ ...data, month });
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex flex-col h-full max-h-[90vh] sm:h-auto sm:max-w-[425px]"
        isMobile={isMobile}
      >
        {isMobile && (
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 w-full bg-[#333333] text-white p-4"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Voltar</span>
          </button>
        )}

        {/* Conteúdo do modal com scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>{bill ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifications_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Notificações</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('notifications_enabled') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notification_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Notificação</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                            >
                              <option value="specific_date">Data Específica</option>
                              <option value="installments">Parcelas</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      <>
                        <FormField
                          control={form.control}
                          name="notification_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data da Notificação</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notification_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário da Notificação</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>

                    {form.watch('notification_type') === 'installments' && !bill?.installment_number && (
                      <FormField
                        control={form.control}
                        name="installments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {bill?.installment_number && bill?.total_installments && (
                      <FormItem>
                        <FormLabel>Parcela</FormLabel>
                        <div className="w-full rounded-md border border-input bg-background px-3 py-2">
                          {bill.installment_number}/{bill.total_installments}
                        </div>
                      </FormItem>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {bill ? 'Salvar' : 'Criar'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}