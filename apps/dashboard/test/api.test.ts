import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { apiRoutes, type Group, type Me } from '@splitwiser/shared';
import { MutationObserver, QueryClient } from '@tanstack/react-query';
import { createAPI } from '../src/features/api/options';

const alice: Me = { id: 'alice', name: 'Alice', email: 'alice@example.com' };
const group: Group = {
  id: 'trip', name: 'Trip', inviteCode: 'trip123', createdAt: '2026-09-06',
};

function setup(t: TestContext, handler: (path: string, options?: RequestInit) => Response | Promise<Response>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  t.mock.method(globalThis, 'fetch', (url: string, options?: RequestInit) => {
    assert.equal(options?.credentials, 'include');
    return handler(new URL(url).pathname, options);
  });
  t.after(() => client.clear());
  return { client, api: createAPI(client, 'https://dash.splitwiser.app') };
}

test('query and mutation options share routes, infer data, and update the group cache', async (t) => {
  const { client, api } = setup(t, (path, options) => {
    if (path === apiRoutes.profile) return Response.json(alice);
    assert.equal(path, apiRoutes.groups);
    if (options?.method === 'POST') {
      assert.deepEqual(JSON.parse(String(options.body)), { name: 'Trip', creatorName: 'Alice' });
      return Response.json(group, { status: 201 });
    }
    return Response.json({ groups: [] });
  });
  assert.equal(api.routes, apiRoutes);
  await client.query(api.profile.get());
  await client.query(api.groups.list(alice.id));
  const create = new MutationObserver(client, api.groups.create(alice.id));
  await create.mutate({ name: 'Trip', creatorName: 'Alice' });
  assert.deepEqual(client.getQueryData(api.groups.list(alice.id).queryKey), { groups: [group] });
  assert.equal(client.getQueryState(api.keys.groups.list(alice.id))?.isInvalidated, true);
  assert.notDeepEqual(api.keys.groups.list('alice'), api.keys.groups.list('bob'));
});

test('session expiry clears private groups and returns the app to sign-in', async (t) => {
  const { client, api } = setup(t, () => Response.json({ error: { code: 'auth_required', message: 'Sign in again.' } }, { status: 401 }));
  client.setQueryData(api.keys.profile, alice);
  client.setQueryData(api.keys.groups.list(alice.id), { groups: [group] });
  await assert.rejects(client.query({ ...api.groups.list(alice.id), staleTime: 0 }));
  assert.equal(client.getQueryData(api.keys.profile), null);
  assert.equal(client.getQueryData(api.keys.groups.list(alice.id)), undefined);
});

test('a create request finishing after sign-out cannot restore private cached data', async (t) => {
  let finishCreate!: (response: Response) => void;
  let started!: () => void;
  const requestStarted = new Promise<void>((resolve) => { started = resolve; });
  const { client, api } = setup(t, (path) => {
    if (path === apiRoutes.auth.signOut) return Response.json({ success: true });
    return new Promise<Response>((resolve) => { finishCreate = resolve; started(); });
  });
  client.setQueryData(api.keys.profile, alice);
  const create = new MutationObserver(client, api.groups.create(alice.id));
  const pending = create.mutate({ name: 'Trip', creatorName: 'Alice' });
  await requestStarted;
  await new MutationObserver(client, api.auth.signOut()).mutate();
  finishCreate(Response.json(group));
  await pending;
  assert.equal(client.getQueryData(api.keys.profile), null);
  assert.equal(client.getQueryData(api.keys.groups.list(alice.id)), undefined);
});

test('refreshing the profile for a different user removes the previous user’s groups', async (t) => {
  const bob = { ...alice, id: 'bob', name: 'Bob' };
  const { client, api } = setup(t, () => Response.json(bob));
  client.setQueryData(api.keys.profile, alice);
  client.setQueryData(api.keys.groups.list(alice.id), { groups: [group] });
  assert.deepEqual(await client.query(api.profile.get()), bob);
  assert.equal(client.getQueryData(api.keys.groups.list(alice.id)), undefined);
});

test('formatCents formats numbers with commas and currency symbols properly', async () => {
  const { formatCents } = await import('../src/lib/utils');
  assert.equal(formatCents(650000), '$6,500.00');
  assert.equal(formatCents(6500), '$65.00');
  assert.equal(formatCents(0), '$0.00');
  assert.equal(formatCents(-650000), '-$6,500.00');
  assert.equal(formatCents(123456789), '$1,234,567.89');
});

