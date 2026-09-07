import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAPI } from './hooks/useAPI';
import { MobileShell } from './components/layout/MobileShell';
import { AppHeader } from './components/layout/AppHeader';
import { AppMenuSheet } from './components/layout/AppMenuSheet';
import { GroupList } from './components/groups/GroupList';
import { GroupDetail } from './components/groups/GroupDetail';
import { JoinGroupView } from './components/groups/JoinGroupView';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { SaveGroupPromptModal } from './components/groups/SaveGroupPromptModal';
import { SaveAccountModal } from './components/auth/SaveAccountModal';

export type AppOverlay = 'menu' | 'new-group' | 'save-prompt' | 'save-account' | null;

export function App() {
  const api = useAPI();
  const profile = useQuery(api.profile.get());
  const signOut = useMutation({
    ...api.auth.signOut(),
    onSuccess: async () => {
      closeOverlay();
      setActiveGroupId(null);
      setJoinCode(null);
      window.history.replaceState({ isGuard: true }, '', '/');
      window.history.pushState({ appRoot: true }, '', '/');
      await profile.refetch();
    },
  });

  // Routing state based on URL
  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/groups\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });
  const [joinCode, setJoinCode] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/join\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });

  // Unified overlay state to prevent race conditions and synchronize with history
  const [activeOverlay, setActiveOverlay] = useState<AppOverlay>(null);
  const activeOverlayRef = useRef<AppOverlay>(null);
  activeOverlayRef.current = activeOverlay;

  const closingOverlayRef = useRef(false);

  function openOverlay(type: NonNullable<AppOverlay>) {
    window.history.pushState({ overlay: type }, '');
    setActiveOverlay(type);
  }

  function transitionOverlay(type: NonNullable<AppOverlay>) {
    window.history.replaceState({ overlay: type }, '');
    setActiveOverlay(type);
  }

  function closeOverlay() {
    if (activeOverlayRef.current) {
      closingOverlayRef.current = true;
      setActiveOverlay(null);
      window.history.back();
    }
  }

  // Anchor initial root history state with a guard buffer to prevent PWA from backing out to black/empty screen
  useEffect(() => {
    if (!window.history.state?.appRoot && !window.history.state?.isGuard) {
      const pathname = window.location.pathname;
      if (pathname === '/') {
        window.history.replaceState({ isGuard: true }, '', '/');
        window.history.pushState({ appRoot: true }, '', '/');
      } else {
        const groupMatch = pathname.match(/^\/groups\/([a-zA-Z0-9_-]+)/);
        const joinMatch = pathname.match(/^\/join\/([a-zA-Z0-9_-]+)/);
        window.history.replaceState({ isGuard: true }, '', '/');
        window.history.pushState(
          groupMatch
            ? { screen: 'group', groupId: groupMatch[1] }
            : joinMatch
              ? { screen: 'join', code: joinMatch[1] }
              : { appRoot: true },
          '',
          pathname + window.location.search,
        );
      }
    }
  }, []);

  // Sync URL changes and back gestures
  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      // 1. If closeOverlay() triggered history.back(), consume it
      if (closingOverlayRef.current) {
        closingOverlayRef.current = false;
        return;
      }

      // 2. If a modal/sheet overlay was open and user performed a back gesture, dismiss overlay
      if (activeOverlayRef.current) {
        setActiveOverlay(null);
        return;
      }

      // 3. If user backed out to the root guard entry, trap it and stay on the app root
      if (e.state?.isGuard) {
        setActiveGroupId(null);
        setJoinCode(null);
        window.history.pushState({ appRoot: true }, '', '/');
        return;
      }

      // 4. Synchronize screen routes
      const pathname = window.location.pathname;
      const groupMatch = pathname.match(/^\/groups\/([a-zA-Z0-9_-]+)/);
      const joinMatch = pathname.match(/^\/join\/([a-zA-Z0-9_-]+)/);

      if (groupMatch) {
        setActiveGroupId(groupMatch[1]);
        setJoinCode(null);
      } else if (joinMatch) {
        setJoinCode(joinMatch[1]);
        setActiveGroupId(null);
      } else {
        setActiveGroupId(null);
        setJoinCode(null);
        if (!e.state?.appRoot) {
          window.history.replaceState({ appRoot: true }, '');
        }
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleSelectGroup(groupId: string) {
    window.history.pushState({ screen: 'group', groupId }, '', `/groups/${groupId}`);
    setActiveGroupId(groupId);
    setJoinCode(null);
  }

  function handleBack() {
    if (activeGroupId || joinCode) {
      window.history.back();
    }
  }

  function handleJoinCode(code: string) {
    window.history.pushState({ screen: 'join', code }, '', `/join/${code}`);
    setJoinCode(code);
    setActiveGroupId(null);
  }

  function handleJoined(groupId: string) {
    window.history.replaceState({ screen: 'group', groupId }, '', `/groups/${groupId}`);
    setJoinCode(null);
    const isGuest =
      (user as unknown as { type?: string; email?: string })?.type === 'guest' ||
      !(user as unknown as { email?: string })?.email;
    if (isGuest) {
      window.history.pushState({ overlay: 'save-prompt' }, '', `/groups/${groupId}`);
      setActiveOverlay('save-prompt');
    }
  }

  const user = profile.data;

  return (
    <MobileShell>
      <AppHeader
        title={activeGroupId ? 'Group' : joinCode ? 'Join Group' : 'Splitwiser'}
        onBack={activeGroupId || joinCode ? handleBack : undefined}
        onOpenMenu={() => openOverlay('menu')}
      />

      <main className="flex-1 flex flex-col">
        {profile.isPending || (profile.isFetching && !user) ? (
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
            onNewGroup={() => openOverlay('new-group')}
            onJoinCode={handleJoinCode}
          />
        )}
      </main>

      {/* Slide-over menu */}
      <AppMenuSheet
        open={activeOverlay === 'menu'}
        onOpenChange={(open) => {
          if (!open) closeOverlay();
        }}
        user={user ?? null}
        onNewGroup={() => transitionOverlay('new-group')}
        onSaveAccount={() => transitionOverlay('save-account')}
        onSignOut={() => signOut.mutate()}
        isSigningOut={signOut.isPending}
      />

      {/* New group modal */}
      {user && (
        <CreateGroupModal
          open={activeOverlay === 'new-group'}
          onOpenChange={(open) => {
            if (!open) closeOverlay();
          }}
          userId={user.id}
          defaultCreatorName={user.name || undefined}
          onSuccess={(newGroupId) => {
            window.history.replaceState(
              { screen: 'group', groupId: newGroupId },
              '',
              `/groups/${newGroupId}`,
            );
            setActiveGroupId(newGroupId);
            setJoinCode(null);

            const isGuest =
              (user as unknown as { type?: string; email?: string })?.type === 'guest' ||
              !(user as unknown as { email?: string })?.email;
            if (isGuest) {
              window.history.pushState({ overlay: 'save-prompt' }, '', `/groups/${newGroupId}`);
              setActiveOverlay('save-prompt');
            } else {
              setActiveOverlay(null);
            }
          }}
        />
      )}

      {/* Guest save group prompt modal */}
      <SaveGroupPromptModal
        open={activeOverlay === 'save-prompt'}
        onOpenChange={(open) => {
          if (!open) closeOverlay();
        }}
        onSave={() => transitionOverlay('save-account')}
      />

      {/* Save account modal */}
      <SaveAccountModal
        open={activeOverlay === 'save-account'}
        onOpenChange={(open) => {
          if (!open) closeOverlay();
        }}
      />
    </MobileShell>
  );
}

export default App;
