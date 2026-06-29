import type { BorrowerData } from '@/data/types';
import type { RepaymentHistoryFeatures } from '../types';
import { dayDiff, parseISO, startOfDay } from '@/lib/datetime';
import { toDate } from '../window';

/** Repayment-history features derived from the loan schedule, as of `asOf`. */
export function computeHistoryFeatures(borrower: BorrowerData, asOf: Date | string): RepaymentHistoryFeatures {
  const now = startOfDay(toDate(asOf)).getTime();
  const installments = borrower.loan.installments;

  const past = installments.filter((i) => parseISO(i.dueDate).getTime() < now);
  const paidCount = past.filter((i) => i.status === 'paid').length;
  const partialCount = past.filter((i) => i.status === 'partial').length;
  const missedCount = past.filter((i) => i.status === 'missed').length;

  const misses = past
    .filter((i) => i.status === 'missed')
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const recentMiss = misses[0];
  const hasRecentMiss = recentMiss ? dayDiff(parseISO(recentMiss.dueDate), toDate(asOf)) <= 45 : false;

  return {
    totalInstallments: installments.length,
    dueSoFar: past.length,
    paidCount,
    partialCount,
    missedCount,
    onTimeRate: past.length ? paidCount / past.length : 1,
    hasRecentMiss,
    recentMissDate: recentMiss?.dueDate,
  };
}
