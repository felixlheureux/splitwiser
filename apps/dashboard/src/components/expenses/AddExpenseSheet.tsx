import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Check, DollarSign, Receipt } from 'lucide-react';
import type { Member } from '@splitwiser/shared';
import { useAPI } from '../../hooks/useAPI';
import { formatCents } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Member[];
  myMemberId?: string | null;
  initialSettlement?: {
    fromMemberId?: string;
    toMemberId: string;
    amountCents: number;
  } | null;
}

export function AddExpenseSheet({
  open,
  onOpenChange,
  groupId,
  members,
  myMemberId,
  initialSettlement,
}: AddExpenseSheetProps) {
  const api = useAPI();
  const createExpense = useMutation(api.expenses.create(groupId));
  const [splitType, setSplitType] = useState<'equal' | 'settlement'>(
    initialSettlement ? 'settlement' : 'equal',
  );

  const defaultPayer =
    myMemberId || (members.length > 0 ? members[0].id : '');

  const form = useForm({
    defaultValues: {
      description: initialSettlement ? 'Settlement Payment' : '',
      amount: initialSettlement ? (initialSettlement.amountCents / 100).toFixed(2) : '',
      paidByMemberId: initialSettlement?.fromMemberId || defaultPayer,
      splitWithMemberIds: initialSettlement
        ? [initialSettlement.toMemberId]
        : members.map((m) => m.id),
    },
    onSubmit: async ({ value }) => {
      const parsedAmount = Math.round(parseFloat(value.amount) * 100);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;

      createExpense.mutate(
        {
          description: value.description.trim() || (splitType === 'settlement' ? 'Settlement' : 'Expense'),
          amountCents: parsedAmount,
          paidByMemberId: value.paidByMemberId,
          splitType,
          splitWithMemberIds: value.splitWithMemberIds,
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    },
  });

  // Sync splitType and form values whenever modal opens or initialSettlement changes
  useEffect(() => {
    if (!open) return;
    if (initialSettlement) {
      setSplitType('settlement');
      form.setFieldValue(
        'paidByMemberId',
        initialSettlement.fromMemberId || defaultPayer,
      );
      form.setFieldValue('splitWithMemberIds', [initialSettlement.toMemberId]);
      form.setFieldValue(
        'amount',
        (initialSettlement.amountCents / 100).toFixed(2),
      );
      form.setFieldValue('description', 'Settlement Payment');
    } else {
      setSplitType('equal');
      form.setFieldValue('paidByMemberId', defaultPayer);
      form.setFieldValue('splitWithMemberIds', members.map((m) => m.id));
      form.setFieldValue('amount', '');
      form.setFieldValue('description', '');
    }
  }, [open, initialSettlement, defaultPayer, members]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <Receipt className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {splitType === 'settlement' ? 'Record payment' : 'New expense'}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            {splitType === 'settlement' ? 'Settle a debt' : 'Add an expense'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {splitType === 'settlement'
              ? 'Record a direct payment between group members'
              : 'Split equally among selected people'}
          </DialogDescription>
        </DialogHeader>

        {/* Split Type Selector */}
        <div className="grid grid-cols-2 gap-2 my-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              splitType === 'equal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setSplitType('equal');
              form.setFieldValue('splitWithMemberIds', members.map((m) => m.id));
              if (form.getFieldValue('description') === 'Settlement Payment') {
                form.setFieldValue('description', '');
              }
            }}
          >
            Equal Split
          </button>
          <button
            type="button"
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              splitType === 'settlement'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setSplitType('settlement');
              const currentPayer = form.getFieldValue('paidByMemberId');
              const recipient = members.find((m) => m.id !== currentPayer)?.id || members[0]?.id;
              form.setFieldValue('splitWithMemberIds', [recipient]);
              if (!form.getFieldValue('description')) {
                form.setFieldValue('description', 'Settlement Payment');
              }
            }}
          >
            Direct Payment
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4 pt-2 pb-2"
        >
          {/* Amount input */}
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const parsed = parseFloat(value);
                if (isNaN(parsed) || parsed <= 0) return 'Enter a valid amount';
                return undefined;
              },
              onBlur: ({ value }) => {
                const parsed = parseFloat(value);
                if (!value || isNaN(parsed) || parsed <= 0) return 'Enter a valid amount';
                return undefined;
              },
              onSubmit: ({ value }) => {
                const parsed = parseFloat(value);
                if (!value || isNaN(parsed) || parsed <= 0) return 'Enter a valid amount';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label htmlFor="expense-amount" className="text-xs font-semibold text-slate-700">
                  Amount
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="pl-9 text-lg font-bold"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={createExpense.isPending}
                  />
                </div>
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-rose-600">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field
            name="description"
            validators={{
              onBlur: ({ value }) => (!value.trim() ? 'Description is required' : undefined),
              onSubmit: ({ value }) => (!value.trim() ? 'Description is required' : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label htmlFor="expense-desc" className="text-xs font-semibold text-slate-700">
                  {splitType === 'settlement' ? 'Note' : 'What was it for?'}
                </label>
                <Input
                  id="expense-desc"
                  placeholder={splitType === 'settlement' ? 'e.g. Paid cash, Venmo' : 'e.g. Dinner, Groceries, Hotel'}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={createExpense.isPending}
                  maxLength={120}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-rose-600">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Paid by */}
          <form.Field name="paidByMemberId">
            {(field) => (
              <div className="space-y-1.5">
                <label htmlFor="payer-select" className="text-xs font-semibold text-slate-700">
                  Paid by
                </label>
                <select
                  id="payer-select"
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={createExpense.isPending}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === myMemberId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Split with */}
          {splitType === 'equal' ? (
            <form.Field
              name="splitWithMemberIds"
              validators={{
                onChange: ({ value }) =>
                  value.length === 0 ? 'Select at least one person' : undefined,
              }}
            >
              {(field) => {
                const selected = field.state.value;
                const allSelected = selected.length === members.length;
                const amountVal = parseFloat(form.getFieldValue('amount') || '0');
                const perPersonCents =
                  selected.length > 0 && !isNaN(amountVal)
                    ? Math.round((amountVal * 100) / selected.length)
                    : 0;

                return (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Split with ({selected.length})
                      </label>
                      <button
                        type="button"
                        className="text-xs text-teal-600 font-semibold hover:underline"
                        onClick={() => {
                          field.handleChange(
                            allSelected ? [members[0]?.id].filter(Boolean) : members.map((m) => m.id),
                          );
                        }}
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>

                    {perPersonCents > 0 && selected.length > 0 && (
                      <p className="text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg font-medium">
                        {formatCents(perPersonCents)} per person
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const isChecked = selected.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`flex items-center justify-between rounded-xl border p-2.5 text-xs text-left transition-all ${
                              isChecked
                                ? 'border-teal-600 bg-teal-50/60 font-semibold text-teal-900'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                            onClick={() => {
                              if (isChecked) {
                                if (selected.length > 1) {
                                  field.handleChange(selected.filter((id) => id !== m.id));
                                }
                              } else {
                                field.handleChange([...selected, m.id]);
                              }
                            }}
                          >
                            <span className="truncate">{m.name}</span>
                            {isChecked && (
                              <Check className="h-3.5 w-3.5 text-teal-600 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            </form.Field>
          ) : (
            /* Settlement recipient */
            <form.Field name="splitWithMemberIds">
              {(field) => {
                const currentRecipient = field.state.value[0] || '';
                const currentPayer = form.getFieldValue('paidByMemberId');
                const recipientCandidates = members.filter((m) => m.id !== currentPayer);

                return (
                  <div className="space-y-1.5">
                    <label htmlFor="recipient-select" className="text-xs font-semibold text-slate-700">
                      Paid to
                    </label>
                    <select
                      id="recipient-select"
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                      value={currentRecipient}
                      onChange={(e) => field.handleChange([e.target.value])}
                      disabled={createExpense.isPending}
                    >
                      {recipientCandidates.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.id === myMemberId ? '(You)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }}
            </form.Field>
          )}

          {createExpense.error && (
            <p className="text-xs text-rose-600 font-medium">
              {String(createExpense.error.message || createExpense.error)}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold h-12 text-base mt-4 mb-2 shadow-xs"
            disabled={createExpense.isPending}
          >
            {createExpense.isPending
              ? 'Saving…'
              : splitType === 'settlement'
              ? 'Record payment'
              : 'Save expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
