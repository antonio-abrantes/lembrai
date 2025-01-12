import { toast } from 'sonner';
import { useCallback } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
};

export function useToast() {
  const showToast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    switch (variant) {
      case 'destructive':
        toast.error(title, { description });
        break;
      case 'success':
        toast.success(title, { description });
        break;
      case 'warning':
        toast.warning(title, { description });
        break;
      case 'info':
        toast.info(title, { description });
        break;
      default:
        toast(title, { description });
    }
  }, []);

  return { toast: showToast };
}
