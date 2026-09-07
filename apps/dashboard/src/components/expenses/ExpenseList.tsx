import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Receipt, Trash2, Users } from 'lucide-react';
import type { Expense, Member } from '@splitwiser/shared';
import { useAPI } from '../../hooks/useAPI';
import { formatCents } from '../../lib/utils';
import { Button } from '../ui/button';

interface ExpenseListProps {
  groupId: string;
  expenses: Expense[];
  members: Member[];
  myMemberId?: string | null;
}

export function ExpenseList({ groupId, expenses, members, myMemberId }: ExpenseListProps) {
  const api = useAPI();
  const deleteExpense = useMutation(api.expenses.delete(groupId));
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  function handleDelete(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    setDeletingId(expenseId);
    deleteExpense.mutate(expenseId, {
      onSettled: () => setDeletingId(null),
    });
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Receipt className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No expenses yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Tap "+ Add Expense" below to log the first shared bill or dinner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const isSettlement = expense.splitType === 'settlement';
        const payerName = memberMap.get(expense.paidByMemberId) || 'Unknown';
        const recipientName =
          expense.splitWithMemberIds.length > 0
            ? memberMap.get(expense.splitWithMemberIds[0]) || 'Someone'
            : '';
        const isMyExpense = expense.paidByMemberId === myMemberId;
        const formattedDate = new Date(expense.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 truncate pr-2">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isSettlement
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-teal-50 text-teal-700'
                }`}
              >
                {isSettlement ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <Receipt className="h-5 w-5" />
                )}
              </div>

              <div className="truncate space-y-0.5">
                <h4 className="text-sm font-semibold text-slate-900 truncate">
                  {expense.description}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <span>{formattedDate}</span>
                  <span>·</span>
                  <span className="truncate">
                    {isSettlement ? (
                      `${isMyExpense ? 'You' : payerName} paid ${recipientName}`
                    ) : (
                      <>
                        <span className="font-medium text-slate-600">
                          {isMyExpense ? 'You' : payerName}
                        </span>{' '}
                        paid
                      </>
                    )}
                  </span>
                  {!isSettlement && expense.splitWithMemberIds.length > 1 && (
                    <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <Users className="h-2.5 w-2.5 mr-0.5" />
                      {expense.splitWithMemberIds.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-sm font-bold ${
                  isSettlement ? 'text-amber-700' : 'text-slate-900'
                }`}
              >
                {formatCents(expense.amountCents)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                aria-label="Delete expense"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
