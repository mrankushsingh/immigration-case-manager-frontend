import { Payment } from '../types';

/** Fee / honorario history lines increase totalFee but are not money received. */
export function isFeePaymentEntry(payment: Pick<Payment, 'entryType' | 'method'>): boolean {
  if (payment.entryType === 'fee') return true;
  if (payment.entryType === 'payment') return false;
  const method = (payment.method || '').trim().toLowerCase();
  return method === 'honorario' || method === 'additional fee' || method.startsWith('honorario ');
}

export function sumPaidPaymentAmount(payments: Payment[] | undefined): number {
  return (payments || []).reduce((sum, payment) => {
    if (isFeePaymentEntry(payment)) return sum;
    return sum + (Number(payment.amount) || 0);
  }, 0);
}

export function calcPendingBalance(totalFee: number, paidAmount: number): number {
  return Math.max(0, (Number(totalFee) || 0) - (Number(paidAmount) || 0));
}
