import { ArrowRight, CheckCircle2, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import type { Member, MemberBalance, SuggestedRepayment } from '@splitwiser/shared';
import { formatCents } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BalanceSummaryCardProps {
  myMemberId?: string | null;
  balances: MemberBalance[];
  suggestedRepayments: SuggestedRepayment[];
  members: Member[];
  onSettleUp: (repayment: SuggestedRepayment) => void;
}

export function BalanceSummaryCard({
  myMemberId,
  balances,
  suggestedRepayments,
  onSettleUp,
}: BalanceSummaryCardProps) {
  const myBalance = balances.find((b) => b.memberId === myMemberId)?.balanceCents ?? 0;
  const isOwed = myBalance > 0;

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your balance
          </CardTitle>
          {myBalance === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> All settled up
            </span>
          ) : isOwed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" /> You are owed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <TrendingDown className="h-3.5 w-3.5" /> You owe
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span
            className={`text-3xl font-extrabold tracking-tight ${
              myBalance > 0
                ? 'text-emerald-600'
                : myBalance < 0
                ? 'text-amber-600'
                : 'text-slate-800'
            }`}
          >
            {formatCents(myBalance)}
          </span>
          {myBalance === 0 && (
            <p className="text-xs text-slate-500 mt-1">
              You do not owe anything and no one owes you in this group.
            </p>
          )}
        </div>

        {/* Suggested Repayments */}
        {suggestedRepayments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600">
              Suggested settlements ({suggestedRepayments.length})
            </h4>
            <div className="space-y-1.5">
              {suggestedRepayments.map((rep, idx) => {
                const isMyDebt = rep.fromMemberId === myMemberId;
                const isToMe = rep.toMemberId === myMemberId;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs border transition-colors ${
                      isMyDebt
                        ? 'border-amber-200 bg-amber-50/50'
                        : isToMe
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-100 bg-slate-50/70 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-slate-900 truncate">
                        {isMyDebt ? 'You' : rep.fromName}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">
                        {isToMe ? 'You' : rep.toName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900">
                        {formatCents(rep.amountCents)}
                      </span>
                      {isMyDebt && (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5 font-semibold bg-teal-600 hover:bg-teal-700"
                          onClick={() => onSettleUp(rep)}
                        >
                          <DollarSign className="h-3 w-3 -mr-1" />
                          Settle
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
