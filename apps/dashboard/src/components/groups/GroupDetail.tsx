import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Check,
  DollarSign,
  Plus,
  Share2,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Member, SuggestedRepayment } from '@splitwiser/shared';
import { useAPI } from '../../hooks/useAPI';
import { useHistoryOverlay } from '../../hooks/useHistoryOverlay';
import { formatCents } from '../../lib/utils';
import { AddExpenseSheet } from '../expenses/AddExpenseSheet';
import { ExpenseList } from '../expenses/ExpenseList';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AddMemberModal } from './AddMemberModal';
import { BalanceSummaryCard } from './BalanceSummaryCard';

interface GroupDetailProps {
  groupId: string;
}

export function GroupDetail({ groupId }: GroupDetailProps) {
  const api = useAPI();
  const detailQuery = useQuery(api.groups.detail(groupId));
  const archiveMutation = useMutation(api.groups.archive(groupId));
  const unarchiveMutation = useMutation(api.groups.unarchive(groupId));
  const removeMemberMutation = useMutation(api.groups.removeMember(groupId));

  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [activeSettlement, setActiveSettlement] = useState<{
    fromMemberId?: string;
    toMemberId: string;
    amountCents: number;
  } | null>(null);

  // Hook up history interception to dismiss sheets & dialogs on back gesture
  useHistoryOverlay(expenseSheetOpen, () => setExpenseSheetOpen(false), 'expense-sheet');
  useHistoryOverlay(addMemberOpen, () => setAddMemberOpen(false), 'add-member');
  useHistoryOverlay(
    Boolean(memberToRemove),
    () => {
      setMemberToRemove(null);
      setRemoveError(null);
    },
    'remove-member',
  );

  if (detailQuery.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
        <p className="text-xs text-slate-500">Loading group details…</p>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-sm text-rose-600">
          {detailQuery.error?.message || 'Could not load group.'}
        </p>
        <Button size="sm" onClick={() => void detailQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const { group, members, expenses, balances, suggestedRepayments, myMemberId } =
    detailQuery.data;

  function copyInviteLink() {
    const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      prompt('Copy invite link:', inviteUrl);
    }
  }

  function handleSettleUp(repayment: SuggestedRepayment) {
    setActiveSettlement({
      fromMemberId: repayment.fromMemberId,
      toMemberId: repayment.toMemberId,
      amountCents: repayment.amountCents,
    });
    setExpenseSheetOpen(true);
  }

  function openNewExpense() {
    setActiveSettlement(null);
    setExpenseSheetOpen(true);
  }

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Group Header & Invite Bar */}
      <div className="p-4 bg-white border-b border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 truncate pr-2">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {group.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
              <span>·</span>
              <span>{expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {group.archivedAt ? (
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-2.5 gap-1.5 text-xs font-semibold shrink-0 text-amber-800 bg-amber-50/70 border-amber-200 hover:bg-amber-100"
                onClick={() => unarchiveMutation.mutate()}
                disabled={unarchiveMutation.isPending}
                title="Restore this group to active list"
              >
                <ArchiveRestore className="h-3.5 w-3.5 text-amber-700" />
                <span className="hidden sm:inline">Unarchive</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-2.5 gap-1.5 text-xs font-semibold shrink-0 text-slate-600 hover:text-slate-900 border-slate-200"
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                title="Archive this group"
              >
                <Archive className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Archive</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 gap-1.5 text-xs font-semibold shrink-0"
              onClick={copyInviteLink}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-teal-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Invite</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Archived Banner */}
      {group.archivedAt && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-1.5 font-medium">
            <Archive className="h-4 w-4 text-amber-600 shrink-0" />
            <span>This group is archived and hidden from the active list.</span>
          </div>
          <button
            type="button"
            onClick={() => unarchiveMutation.mutate()}
            disabled={unarchiveMutation.isPending}
            className="text-xs font-bold text-amber-900 underline hover:no-underline ml-2 shrink-0"
          >
            Restore
          </button>
        </div>
      )}

      <div className="p-4 space-y-5">
        {/* Balance Card */}
        <BalanceSummaryCard
          myMemberId={myMemberId}
          balances={balances}
          suggestedRepayments={suggestedRepayments}
          members={members}
          onSettleUp={handleSettleUp}
        />

        {/* Tabs: Expenses vs Members */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/70 p-1 rounded-xl">
            <TabsTrigger
              value="expenses"
              className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs rounded-lg py-1.5"
            >
              Expenses ({expenses.length})
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs rounded-lg py-1.5"
            >
              People ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="pt-3">
            <ExpenseList
              groupId={group.id}
              expenses={expenses}
              members={members}
              myMemberId={myMemberId}
            />
          </TabsContent>

          <TabsContent value="members" className="pt-3 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Group members
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 font-semibold"
                onClick={() => setAddMemberOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Add person
              </Button>
            </div>

            <div className="space-y-2">
              {members.map((member) => {
                const memberBalance =
                  balances.find((b) => b.memberId === member.id)?.balanceCents ?? 0;
                const isMe = member.id === myMemberId;

                return (
                  <Card key={member.id} className="p-3 border-slate-200/80 shadow-2xs">
                    <CardContent className="p-0 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {member.name}
                            </span>
                            {isMe && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            {member.isClaimed ? (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <UserCheck className="h-3 w-3" /> Connected
                              </span>
                            ) : (
                              <span>Offline friend</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-bold ${
                            memberBalance > 0
                              ? 'text-emerald-600'
                              : memberBalance < 0
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {memberBalance > 0 ? '+' : ''}
                          {formatCents(memberBalance)}
                        </span>

                        {!isMe && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => {
                              setRemoveError(null);
                              setMemberToRemove(member);
                            }}
                            title={`Remove ${member.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-20 flex gap-2">
        <Button
          className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-md bg-teal-600 hover:bg-teal-700"
          onClick={openNewExpense}
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Expense
        </Button>
        {suggestedRepayments.length > 0 && (
          <Button
            variant="outline"
            className="h-12 px-4 rounded-xl text-sm font-semibold border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900"
            onClick={() => {
              const myDebt = suggestedRepayments.find((r) => r.fromMemberId === myMemberId) || suggestedRepayments[0];
              if (myDebt) handleSettleUp(myDebt);
            }}
          >
            <DollarSign className="h-4 w-4 mr-1 text-amber-700" />
            Settle Up
          </Button>
        )}
      </div>

      {/* Member Removal Confirmation Dialog */}
      <Dialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToRemove(null);
            setRemoveError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Remove Person</span>
            </div>
            <DialogTitle>Remove {memberToRemove?.name}?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove {memberToRemove?.name} from this group? Members can only be removed if they have no paid expenses and an unsettled balance of $0.00.
            </DialogDescription>
          </DialogHeader>

          {removeError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {removeError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={removeMemberMutation.isPending}
              onClick={() => {
                setMemberToRemove(null);
                setRemoveError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={removeMemberMutation.isPending}
              onClick={() => {
                if (!memberToRemove) return;
                setRemoveError(null);
                removeMemberMutation.mutate(memberToRemove.id, {
                  onSuccess: () => {
                    setMemberToRemove(null);
                  },
                  onError: (err) => {
                    setRemoveError(err.message || 'Failed to remove member.');
                  },
                });
              }}
            >
              {removeMemberMutation.isPending ? 'Removing…' : 'Remove member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Sheet */}
      <AddExpenseSheet
        open={expenseSheetOpen}
        onOpenChange={(open) => {
          setExpenseSheetOpen(open);
          if (!open) {
            setActiveSettlement(null);
          }
        }}
        groupId={group.id}
        members={members}
        myMemberId={myMemberId}
        initialSettlement={activeSettlement}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        groupId={group.id}
      />
    </div>
  );
}
