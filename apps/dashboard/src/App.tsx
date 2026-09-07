import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAPI } from './hooks/useAPI';
import { MobileShell } from './components/layout/MobileShell';
import { AppHeader } from './components/layout/AppHeader';
import { AppMenuSheet } from './components/layout/AppMenuSheet';
import { GroupList } from './components/groups/GroupList';
import { GroupDetail } from './components/groups/GroupDetail';
import { JoinGroupView } from './components/groups/JoinGroupView';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { SaveAccountModal } from './components/auth/SaveAccountModal';

export function App() {
  const api = useAPI();
  const profile = useQuery(api.profile.get());
  const signOut = useMutation(api.auth.signOut());

  // Routing state
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/join\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });

  // Modal states
  const [menuOpen, setMenuOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [saveAccountOpen, setSaveAccountOpen] = useState(false);

  // Sync URL changes for browser back button
  useEffect(() => {
    function handlePopState() {
      const match = window.location.pathname.match(/^\/join\/([a-zA-Z0-9_-]+)/);
      if (match) {
        setJoinCode(match[1]);
        setActiveGroupId(null);
      } else {
        setJoinCode(null);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleSelectGroup(groupId: string) {
    setActiveGroupId(groupId);
    setJoinCode(null);
  }

  function handleBack() {
    if (activeGroupId) {
      setActiveGroupId(null);
    } else if (joinCode) {
      setJoinCode(null);
      window.history.pushState(null, '', '/');
    }
  }

  function handleJoinCode(code: string) {
    setJoinCode(code);
    window.history.pushState(null, '', `/join/${code}`);
  }

  function handleJoined(groupId: string) {
    setJoinCode(null);
    setActiveGroupId(groupId);
    window.history.pushState(null, '', '/');
  }

  const user = profile.data;

  return (
    <MobileShell>
      <AppHeader
        title={activeGroupId ? 'Group' : joinCode ? 'Join Group' : 'Splitwiser'}
        onBack={activeGroupId || joinCode ? handleBack : undefined}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {profile.isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Getting things ready…</p>
          </div>
        ) : profile.isError || !user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Couldn't connect</h3>
            <p className="text-xs text-slate-500">We were unable to load your session.</p>
            <button
              type="button"
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
              onClick={() => void profile.refetch()}
            >
              Retry
            </button>
          </div>
        ) : joinCode ? (
          <JoinGroupView code={joinCode} onJoined={handleJoined} />
        ) : activeGroupId ? (
          <GroupDetail key={activeGroupId} groupId={activeGroupId} />
        ) : (
          <GroupList
            user={user}
            onSelectGroup={handleSelectGroup}
            onNewGroup={() => setNewGroupOpen(true)}
            onJoinCode={handleJoinCode}
          />
        )}
      </main>

      {/* Slide-over menu */}
      <AppMenuSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        user={user ?? null}
        onNewGroup={() => {
          setMenuOpen(false);
          setNewGroupOpen(true);
        }}
        onSaveAccount={() => {
          setMenuOpen(false);
          setSaveAccountOpen(true);
        }}
        onSignOut={() => signOut.mutate()}
        isSigningOut={signOut.isPending}
      />

      {/* New group modal */}
      {user && (
        <CreateGroupModal
          open={newGroupOpen}
          onOpenChange={setNewGroupOpen}
          userId={user.id}
          defaultCreatorName={user.name || undefined}
          onSuccess={(newGroupId) => setActiveGroupId(newGroupId)}
        />
      )}

      {/* Save account modal */}
      <SaveAccountModal
        open={saveAccountOpen}
        onOpenChange={setSaveAccountOpen}
      />
    </MobileShell>
  );
}

export default App;
