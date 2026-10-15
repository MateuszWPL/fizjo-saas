import type { OutcomeType } from '../generated/prisma/enums.js';

// ODI podaje sie w procentach maksymalnej sumy (50 pkt),
// NDI zwyczajowo jako sume punktow 0-50
export function outcomeScore(type: OutcomeType, answers: number[]): number {
  const sum = answers.reduce((total, answer) => total + answer, 0);
  return type === 'ODI' ? Math.round((sum / 50) * 100) : sum;
}
