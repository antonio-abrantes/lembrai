import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, startOfDay } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirstTwoNames(fullName: string): string {
  const conjunctions = new Set(['de', 'e', 'da', 'do', 'das', 'dos']);

  const words = fullName.split(' ');

  let result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    result.push(words[i]);
    const primaryWordsCount = result.filter(word => !conjunctions.has(word.toLowerCase())).length;
    if (primaryWordsCount === 2) {
      break;
    }
  }
  return result.join(' ');
}

export function getDueDateStatus(dueDate: string | Date) {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  const daysUntilDue = differenceInDays(due, today);

  if (daysUntilDue < 0) return 'overdue';  // Já venceu
  if (daysUntilDue <= 2) return 'critical'; // 2 dias ou menos
  if (daysUntilDue <= 5) return 'warning';  // Entre 3 e 5 dias
  return 'normal';                          // Mais de 5 dias
}
