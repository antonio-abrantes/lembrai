export type Bill = {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  notification_type: 'specific_date' | 'installments';
  notifications_enabled: boolean;
  notification_date: string;
  notification_time: string;
  installment_number: number;
  installments: number;
  total_installments: number;
  status: 'pending' | 'paid';
  month: string;
  user_id: string;
  created_at: string;
};