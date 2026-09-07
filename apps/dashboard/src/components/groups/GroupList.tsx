import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, Plus, Sparkles } from 'lucide-react';
import type { Me } from '@splitwiser/shared';
import { useAPI } from '../../hooks/useAPI';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

interface GroupListProps {
  user: Me;
  onSelectGroup: (groupId: string) => void;
  onNewGroup: () => void;
  onJoinCode: (code: string) => void;
}

export function GroupList({ user, onSelectGroup, onNewGroup, onJoinCode }: GroupListProps) {
  const api = useAPI();
  const listQuery = useQuery(api.groups.list(user.id));
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const groups = listQuery.data?.groups ?? [];
  const loading = listQuery.isPending;

  function handleJoinSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().replace(/^.*\/join\//, '');
    if (!cleanCode) return;
    onJoinCode(cleanCode);
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-5">
      {/* Welcome Banner */}
      <div className="space-y-1 pt-2">
        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
          {user.name ? `Welcome, ${user.name}` : 'Welcome'}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your groups
        </h2>
        <p className="text-xs text-slate-500">
          Trips, dinners, households, and shared expenses.
        </p>
      </div>

      {/* Action cards: New Group + Join with Code */}
      <div className="space-y-2">
        <Button
          onClick={onNewGroup}
          className="w-full h-12 rounded-2xl text-sm font-semibold shadow-sm bg-teal-600 hover:bg-teal-700 justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Start a new group
        </Button>

        {/* Join with code box */}
        <form onSubmit={handleJoinSubmit} className="flex gap-2">
          <Input
            placeholder="Enter invite code or link"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            className="h-10 text-xs rounded-xl"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="h-10 px-3 text-xs font-semibold rounded-xl shrink-0"
            disabled={!joinCodeInput.trim()}
          >
            Join
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </form>
      </div>

      {/* Groups List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active groups ({groups.length})
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading your groups…
          </div>
        ) : groups.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl border border-dashed border-slate-200 bg-white/60 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800">No groups yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Create a group for your next weekend trip, household bills, or group gift.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onNewGroup} className="text-xs font-semibold">
              Create your first group
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {groups.map((group) => {
              const formattedDate = new Date(group.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Card
                  key={group.id}
                  className="cursor-pointer transition-all hover:border-teal-500/50 hover:shadow-sm border-slate-200/80 active:scale-[0.99]"
                  onClick={() => onSelectGroup(group.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-bold text-base shadow-2xs">
                        {group.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="truncate space-y-0.5">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {group.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>Created {formattedDate}</span>
                          <span>·</span>
                          <span>Code: {group.inviteCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-400 shrink-0">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
