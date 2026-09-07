import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, UserCheck, UserPlus, Users } from 'lucide-react';
import { useAPI } from '../../hooks/useAPI';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface JoinGroupViewProps {
  code: string;
  onJoined: (groupId: string) => void;
}

export function JoinGroupView({ code, onJoined }: JoinGroupViewProps) {
  const api = useAPI();
  const infoQuery = useQuery(api.groups.joinInfo(code));
  const joinMutation = useMutation(api.groups.join(code));

  // 'someone_else' | memberId | null
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [forceReclaim, setForceReclaim] = useState(false);

  if (infoQuery.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
        <p className="text-xs text-slate-500">Checking invite link…</p>
      </div>
    );
  }

  if (infoQuery.isError || !infoQuery.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">
          {infoQuery.error?.message || 'Invalid or expired invite link.'}
        </p>
        <p className="text-xs text-slate-400">
          Check with the person who invited you for a new link.
        </p>
        <Button size="sm" variant="outline" onClick={() => (window.location.href = '/')}>
          Back to home
        </Button>
      </div>
    );
  }

  const { group, members, alreadyMember } = infoQuery.data;
  const selectedMember = members.find((m) => m.id === selectedOption);
  const isSomeoneElse = selectedOption === 'someone_else' || members.length === 0;

  if (alreadyMember && !forceReclaim) {
    return (
      <div className="p-4 space-y-6 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Already in this group</h2>
          <p className="text-xs text-slate-500">
            You are already a member of <strong className="text-slate-800 font-semibold">{group.name}</strong>.
          </p>
        </div>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="p-4 space-y-2.5">
            <Button
              className="w-full font-semibold bg-teal-600 hover:bg-teal-700 h-11 rounded-xl"
              onClick={() => onJoined(group.id)}
            >
              Open group
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              className="w-full font-semibold text-xs h-10 rounded-xl"
              onClick={() => setForceReclaim(true)}
            >
              Switch or reclaim a different member
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-400 h-9"
              onClick={() => (window.location.href = '/')}
            >
              Back to all groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleSelectMember(member: { id: string; name: string }) {
    setSelectedOption(member.id);
    setNameInput(member.name);
  }

  function handleSelectSomeoneElse() {
    setSelectedOption('someone_else');
    setNameInput('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (selectedMember) {
      const finalName = nameInput.trim() || selectedMember.name;
      joinMutation.mutate(
        { memberId: selectedMember.id, name: finalName },
        {
          onSuccess: (data) => onJoined(data.group.id),
        },
      );
    } else if (isSomeoneElse) {
      if (!nameInput.trim()) return;
      joinMutation.mutate(
        { name: nameInput.trim() },
        {
          onSuccess: (data) => onJoined(data.group.id),
        },
      );
    }
  }

  const effectiveDisplayName = selectedMember
    ? (nameInput.trim() || selectedMember.name)
    : nameInput.trim();

  return (
    <div className="p-4 space-y-5 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
      {/* Invite Welcome */}
      <div className="text-center space-y-1.5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">You're invited!</h2>
        <p className="text-xs text-slate-500">
          Join <strong className="text-slate-800 font-semibold">{group.name}</strong> to split expenses and track balances.
        </p>
      </div>

      {/* 1. Member Selection Cards (all members are claimable) */}
      {members.length > 0 && (
        <Card className="border-teal-200/80 bg-teal-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-teal-600" />
              Who are you in this group?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {members.map((m) => {
              const isSelected = selectedOption === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all shadow-2xs ${
                    isSelected
                      ? 'border-teal-600 bg-white ring-2 ring-teal-500/20 text-teal-900'
                      : 'border-teal-100/80 bg-white/90 hover:border-teal-300 hover:bg-white text-slate-700'
                  }`}
                  onClick={() => handleSelectMember(m)}
                  disabled={joinMutation.isPending}
                >
                  <span className="flex items-center gap-1.5">
                    <span>I'm {m.name}</span>
                    {m.isClaimed && (
                      <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Reclaim
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* "I'm someone else" button */}
            <button
              type="button"
              className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all shadow-2xs ${
                selectedOption === 'someone_else'
                  ? 'border-teal-600 bg-white ring-2 ring-teal-500/20 text-teal-900'
                  : 'border-slate-200/90 bg-white/80 hover:border-slate-300 hover:bg-white text-slate-600'
              }`}
              onClick={handleSelectSomeoneElse}
              disabled={joinMutation.isPending}
            >
              <span className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                I'm someone else
              </span>
              {selectedOption === 'someone_else' && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          </CardContent>
        </Card>
      )}

      {/* 2. Name Confirmation / Entry (shown when an option is chosen, or if no members exist) */}
      {(selectedOption !== null || members.length === 0) && (
        <Card className="border-slate-200/80 bg-white shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700">
              {selectedMember
                ? 'Your display name'
                : 'Enter your name to join'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Input
                  placeholder={selectedMember ? selectedMember.name : 'Your name (e.g. Charlie)'}
                  required={isSomeoneElse}
                  maxLength={80}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={joinMutation.isPending}
                  autoFocus={isSomeoneElse}
                />
                {selectedMember && (
                  <p className="text-[11px] text-slate-400 px-0.5">
                    Pre-filled with your group name. You can edit it or keep it as is.
                  </p>
                )}
              </div>

              {joinMutation.error && (
                <p className="text-xs text-rose-600 font-medium">
                  {String(joinMutation.error.message || joinMutation.error)}
                </p>
              )}

              <Button
                type="submit"
                className="w-full font-semibold bg-teal-600 hover:bg-teal-700 h-11"
                disabled={joinMutation.isPending || (isSomeoneElse && !nameInput.trim())}
              >
                {joinMutation.isPending ? (
                  'Joining group…'
                ) : selectedMember ? (
                  <>
                    Claim as {effectiveDisplayName}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Join group
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

