import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, UserCheck, Users } from 'lucide-react';
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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

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

  const { group, members } = infoQuery.data;
  const unclaimedMembers = members.filter((m) => !m.isClaimed);

  function handleClaim(memberId: string) {
    joinMutation.mutate(
      { memberId },
      {
        onSuccess: (data) => onJoined(data.group.id),
      },
    );
  }

  function handleNewJoin(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    joinMutation.mutate(
      { name: newName.trim() },
      {
        onSuccess: (data) => onJoined(data.group.id),
      },
    );
  }

  return (
    <div className="p-4 space-y-6 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
      {/* Invite Welcome */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
          <Users className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">You're invited!</h2>
        <p className="text-xs text-slate-500">
          Join <strong className="text-slate-800 font-semibold">{group.name}</strong> to split expenses and track balances.
        </p>
      </div>

      {/* Claim Existing Member if available */}
      {unclaimedMembers.length > 0 && (
        <Card className="border-teal-200/70 bg-teal-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-teal-600" />
              Are you one of these people?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {unclaimedMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex items-center justify-between w-full p-2.5 rounded-xl bg-white border border-teal-100 hover:border-teal-400 hover:bg-teal-50 text-left text-xs font-semibold text-slate-800 transition-all shadow-2xs"
                onClick={() => {
                  setSelectedMemberId(m.id);
                  handleClaim(m.id);
                }}
                disabled={joinMutation.isPending}
              >
                <span>I'm {m.name}</span>
                {selectedMemberId === m.id && joinMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4 text-teal-600" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Or Join as someone new */}
      <Card className="border-slate-200/80 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-700">
            {unclaimedMembers.length > 0 ? 'Or join with a new name' : 'Enter your name to join'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNewJoin} className="space-y-3">
            <Input
              placeholder="Your name (e.g. Charlie)"
              required
              maxLength={80}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={joinMutation.isPending}
            />

            {joinMutation.error && (
              <p className="text-xs text-rose-600 font-medium">
                {String(joinMutation.error.message || joinMutation.error)}
              </p>
            )}

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={joinMutation.isPending || !newName.trim()}
            >
              {joinMutation.isPending ? 'Joining group…' : 'Join group'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
