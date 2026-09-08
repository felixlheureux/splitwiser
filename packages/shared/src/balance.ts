import type { MemberBalance, SuggestedRepayment } from './schemas';

export interface BalanceInputMember {
  id: string;
  name: string;
}

export interface BalanceInputExpense {
  amountCents: number;
  paidByMemberId: string;
  splitType: 'equal' | 'settlement';
  splitWithMemberIds: string[];
}

export function calculateBalances(
  members: BalanceInputMember[],
  expenses: BalanceInputExpense[],
): {
  balances: MemberBalance[];
  suggestedRepayments: SuggestedRepayment[];
} {
  const net = new Map<string, number>();
  for (const m of members) {
    net.set(m.id, 0);
  }

  for (const expense of expenses) {
    const { amountCents, paidByMemberId, splitType, splitWithMemberIds } = expense;

    if (splitType === 'settlement') {
      // Direct payment from payer split across recipient member(s)
      const recipients = splitWithMemberIds.filter((id) => id !== paidByMemberId);
      const count = recipients.length;
      if (count > 0) {
        net.set(paidByMemberId, (net.get(paidByMemberId) ?? 0) + amountCents);
        const baseShare = Math.floor(amountCents / count);
        const remainder = amountCents % count;

        recipients.forEach((id, index) => {
          const share = baseShare + (index < remainder ? 1 : 0);
          net.set(id, (net.get(id) ?? 0) - share);
        });
      }
    } else {
      // Equal split among selected members
      const count = splitWithMemberIds.length;
      if (count > 0) {
        net.set(paidByMemberId, (net.get(paidByMemberId) ?? 0) + amountCents);
        const baseShare = Math.floor(amountCents / count);
        const remainder = amountCents % count;

        splitWithMemberIds.forEach((id, index) => {
          const share = baseShare + (index < remainder ? 1 : 0);
          net.set(id, (net.get(id) ?? 0) - share);
        });
      }
    }
  }

  const balances: MemberBalance[] = members.map((m) => ({
    memberId: m.id,
    name: m.name,
    balanceCents: net.get(m.id) ?? 0,
  }));

  // Debt simplification: greedy matching largest debtor with largest creditor
  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ ...b, remaining: -b.balanceCents }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ ...b, remaining: b.balanceCents }))
    .sort((a, b) => b.remaining - a.remaining);

  const repayments: SuggestedRepayment[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > 0) {
      repayments.push({
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amountCents: amount,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining === 0) d++;
    if (creditor.remaining === 0) c++;
  }

  return { balances, suggestedRepayments: repayments };
}
