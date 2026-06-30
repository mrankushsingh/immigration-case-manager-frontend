import { Payment } from '../types';

/** Fee / honorario history lines increase totalFee but are not money received. */
export function isFeePaymentEntry(payment: Pick<Payment, 'entryType' | 'method'>): boolean {
  if (payment.entryType === 'fee') return true;
  if (payment.entryType === 'payment') return false;
  const method = (payment.method || '').trim().toLowerCase();
  return method === 'honorario' || method === 'honorarios' || method.startsWith('honorario ')
    || method === 'additional fee' || method === 'service fee' || method.startsWith('service ');
}

export function isServiceFeeEntry(payment: Pick<Payment, 'entryType' | 'method'>): boolean {
  if (!isFeePaymentEntry(payment)) return false;
  const method = (payment.method || '').trim().toLowerCase();
  return method === 'service fee' || method.startsWith('service ') || method === 'additional fee';
}

export function isHonorariosFeeEntry(payment: Pick<Payment, 'entryType' | 'method'>): boolean {
  return isFeePaymentEntry(payment) && !isServiceFeeEntry(payment);
}

export function sumServiceFeeAmount(payments: Payment[] | undefined): number {
  return (payments || []).reduce(
    (sum, payment) => (isServiceFeeEntry(payment) ? sum + (Number(payment.amount) || 0) : sum),
    0
  );
}

export function getPaytrackFeeBreakdown(totalFee: number, payments: Payment[] | undefined) {
  const serviceFees = sumServiceFeeAmount(payments);
  const honorarios = Math.max(0, (Number(totalFee) || 0) - serviceFees);
  return { honorarios, serviceFees, totalFee: honorarios + serviceFees };
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
