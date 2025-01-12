import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "group flex items-center gap-2 p-4 rounded-lg border shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm",
          success: "bg-green-50 border-green-200 text-green-700",
          error: "bg-red-50 border-red-200 text-red-700",
          warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
          info: "bg-blue-50 border-blue-200 text-blue-700",
        },
        duration: 3000,
      }}
      theme="light"
      richColors
      {...props}
    />
  );
};

export { Toaster };
