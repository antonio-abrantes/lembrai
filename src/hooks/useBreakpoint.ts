import { useState, useEffect } from 'react';

export function useBreakpoint(breakpoint: number): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Verifica o tamanho inicial da tela (apenas no cliente)
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false; // Valor padrão para SSR
  });

  useEffect(() => {
    // Função que atualiza o estado baseado no tamanho da tela
    const checkSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Adiciona o listener para mudanças no tamanho da tela
    window.addEventListener('resize', checkSize);

    // Cleanup: remove o listener quando o componente for desmontado
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isMobile;
} 