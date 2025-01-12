import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StatusTabs } from '@/components/StatusTabs';
import { BillCard } from '@/components/BillCard';
import { AddButton } from '@/components/AddButton';
import { BillFormModal } from '@/components/bills/BillFormModal';
import { DeleteBillDialog } from '@/components/bills/DeleteBillDialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Bill } from '@/types';
import { useAuth } from '@/contexts/auth';
import { UserAvatar } from '@/components/UserAvatar';
import EmptyState from '@/assets/EmptyState';

export function Bills() {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getCurrentMonthName = () => {
    const currentMonthIndex = new Date().getMonth();
    return months[currentMonthIndex];
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthName());
  const [currentTab, setCurrentTab] = useState('all');
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | undefined>();
  const { toast } = useToast();

  const { user } = useAuth();

  useEffect(() => {
    fetchBills();
  }, [currentMonth]);

  const fetchBills = async () => {
    try {
      const normalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1).toLowerCase();
      console.log('Fetching bills for month:', normalizedMonth); // Console para depuração
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month', normalizedMonth);

      if (error) throw error;
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as contas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (data: any) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      // Handle installments
      if (data.notifications_enabled && data.notification_type === 'installments' && data.bills) {
        const { error } = await supabase
          .from('bills')
          .insert(data.bills.map((bill: any) => ({
            ...bill,
            amount: parseFloat(bill.amount),
            user_id: user.id,
            due_date: bill.due_date || null,
            notification_date: bill.notification_date || null,
            notification_time: bill.notification_time || null,
          })));

        if (error) throw error;
        toast({ title: 'Parcelas criadas com sucesso!', variant: 'success' });
      } else {
        // Handle single bill
        const billData = {
          ...data,
          amount: parseFloat(data.amount),
          user_id: user.id,
          due_date: data.due_date || null,
          notification_date: data.notifications_enabled ? data.notification_date : null,
          notification_time: data.notifications_enabled ? data.notification_time : null,
          notifications_enabled: Boolean(data.notifications_enabled),
          notification_type: data.notifications_enabled ? data.notification_type : null,
          month: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1).toLowerCase(),
        };

        if (selectedBill) {
          const { error } = await supabase
            .from('bills')
            .update(billData)
            .eq('id', selectedBill.id);

          if (error) throw error;
          toast({ title: 'Conta atualizada com sucesso!', variant: 'success' });
        } else {
          const { error } = await supabase
            .from('bills')
            .insert([billData]);

          if (error) {
            console.error('Error saving bill:', error);
            throw error;
          }
          toast({ title: 'Conta criada com sucesso!', variant: 'success' });
        }
      }

      setFormModalOpen(false);
      setSelectedBill(undefined);
      fetchBills();
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a conta',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedBill) return;

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', selectedBill.id);

      if (error) throw error;

      toast({ title: 'Conta excluída com sucesso!', variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedBill(undefined);
      fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a conta',
        variant: 'destructive',
      });
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = currentTab === 'all' ||
      (currentTab === 'paid' && bill.status === 'paid') ||
      (currentTab === 'pending' && bill.status === 'pending');
    return matchesSearch && matchesTab;
  });

  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paid = bills.filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  const pending = bills.filter(bill => bill.status === 'pending')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentIndex = months.indexOf(currentMonth);
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + 12) % 12
      : (currentIndex + 1) % 12;
    setCurrentMonth(months[newIndex]);
  };

  const handleAddBill = () => {
    setSelectedBill(undefined);
    setFormModalOpen(true);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setFormModalOpen(true);
  };

  const handleDeleteBill = (bill: Bill) => {
    setSelectedBill(bill);
    setDeleteDialogOpen(true);
  };

  const showEmptyState = filteredBills.length === 0;

  return (
    <div className="container mx-auto w-full space-y-6 p-4 container-bills">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src="/icon.ico" alt="LembrAi" className="w-8 h-8" />
          <h1 className="text-2xl font-bold ml-1">LembrAi - Minhas Contas</h1>
        </div>
        <span className="mr-1">
          <UserAvatar />
        </span>
      </div>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
      />

      <StatusTabs
        total={total}
        paid={paid}
        pending={pending}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      <div className="space-y-4">
        {showEmptyState && !loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-semibold text-gray-600 mb-6">
              Nenhum resultado encontrado
            </p>
            <div className="w-full max-w-md mx-auto" style={{ maxWidth: '300px' }}>
              <EmptyState className="w-full h-auto" />
            </div>
          </div>
        ) : (
          filteredBills.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={handleEditBill}
              onDelete={handleDeleteBill}
            />
          ))
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Buscando...</p>
          </div>
        )}
      </div>

      <AddButton onClick={handleAddBill} />

      <BillFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleSubmit}
        bill={selectedBill}
      />

      <DeleteBillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}