import { useToast } from '@/hooks/use-toast';
import {
  ToastProvider,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() { // @ts-ignore
  const { toast } = useToast();

  return (
    <ToastProvider>
      <div></div>
      <ToastViewport />
    </ToastProvider>
  );
}
