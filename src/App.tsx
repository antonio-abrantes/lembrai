import { Toaster } from '@/components/ui/sonner';
import { Routes } from '@/routes';
import { AuthProvider } from '@/contexts/auth';

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen justify-center" style={{ minWidth: '90vw', minHeight: '100vh' }}>
        <div className="w-full">
          <Routes />
        </div>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;