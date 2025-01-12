import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { AuthFormData } from '@/types/auth';
import { useAuth } from '@/contexts/auth';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const handleSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);

      if (isRegister) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Erro ao criar usuário');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            avatar_url: data.avatar_url || null,
          });

        if (profileError) throw profileError;

        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você já pode fazer login.',
          variant: 'success',
        });
        setIsRegister(false);
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error('Erro no login:', signInError);

          // Tratamento específico para cada tipo de erro
          if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Por favor, confirme seu email antes de fazer login');
          }

          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Email ou senha inválidos');
          }

          // Para outros erros, vamos ser mais específicos
          if (signInError.status === 400) {
            throw new Error('Dados de login inválidos. Verifique seu email e senha.');
          }

          throw signInError;
        }

        // Atualiza o contexto com o usuário
        if (authData.user) {
          setUser(authData.user);
        }

        navigate('/');
      }
    } catch (error) {
      console.error('Erro completo:', error);

      toast({
        title: 'Erro no login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-2xl' style={{ minWidth: '100vw', minHeight: '100vh' }}>
      <div className="grid min-h-screen place-items-center">
        <div className="w-[320px] space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <img src="/icon.ico" alt="LembrAi" className="w-8 h-8" />
              <h1 className="text-2xl font-bold ml-1">LembrAi</h1>
            </div>
            <p className="text-muted-foreground">
              {isRegister ? 'Crie sua conta' : 'Entre na sua conta'}
            </p>
          </div>

          <AuthForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            type={isRegister ? 'register' : 'login'}
          />

          <div className="text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-muted-foreground hover:underline"
            >
              {isRegister
                ? 'Já tem uma conta? Entre'
                : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}