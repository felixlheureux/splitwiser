import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import app from '../src/app';
import type { ApiEnv } from '../src/errors';

type Env = ApiEnv['Bindings'];

const apiOrigin = 'https://dash.splitwiser.app';
const appOrigin = 'https://dash.splitwiser.app';
const runtime = new Miniflare(
  convertV4MiniflareOptions({
    modules: true,
    script: 'export default { fetch() { return new Response("test"); } }',
    compatibilityDate: '2026-09-03',
    d1Databases: ['DB'],
  }),
);

const emails: Array<{ to: string[]; text: string }> = [];
let env: Env;
const originalFetch = globalThis.fetch;

before(async () => {
  const database = await runtime.getD1Database('DB');
  const directory = new URL('../migrations/', import.meta.url);
  for (const filename of (await readdir(directory))
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    const sql = await readFile(new URL(filename, directory), 'utf8');
    await database.batch(
      sql
        .replace(/--[^\n]*/g, '')
        .split(';')
        .filter((statement) => statement.trim())
        .map((statement) => database.prepare(statement)),
    );
  }
  env = {
    DB: database,
    API_ORIGIN: apiOrigin,
    APP_ORIGIN: appOrigin,
    BETTER_AUTH_SECRET: 'local-test-only-secret-0123456789-abcdef-0123456789',
    RESEND_API_KEY: 'local-test-only-no-email',
    INVITE_SIGNING_SECRET: 'local-test-only-invite-secret',
    TURNSTILE_SECRET_KEY: 'local-test-only-turnstile-secret',
  };
  globalThis.fetch = async (input, init) => {
    if (String(input) !== 'https://api.resend.com/emails') {
      return originalFetch(input, init);
    }
    emails.push(JSON.parse(String(init?.body)));
    return Response.json({ id: 'test-email' });
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  await runtime.dispose();
});

const request = (
  path: string,
  options: {
    body?: unknown;
    cookie?: string;
    method?: string;
    ip?: string;
    headers?: Record<string, string>;
  } = {},
) =>
  app.request(
    `${apiOrigin}${path}`,
    {
      method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
      headers: {
        Origin: appOrigin,
        'Content-Type': 'application/json',
        'cf-connecting-ip': options.ip ?? '192.0.2.1',
        ...(options.cookie ? { Cookie: options.cookie } : {}),
        ...(options.headers ?? {}),
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    },
    env,
  );

async function sendLink(email: string, ip = '192.0.2.1', turnstileToken = 'valid-test-turnstile-token') {
  const response = await request('/api/auth/sign-in/magic-link', {
    body: {
      email,
      callbackURL: `${appOrigin}/`,
      errorCallbackURL: `${appOrigin}/?authError=1`,
      turnstileToken,
    },
    ip,
  });
  assert.equal(response.status, 200, await response.text());
  const link = emails.at(-1)!.text.match(/https:\/\/\S+/)![0];
  return new URL(link);
}

test('guest creates group, invites friend via link, splits bill, and settles up', async () => {
  // 1. Initial caller visits /api/me as guest
  const initialMeRes = await request('/api/me');
  assert.equal(initialMeRes.status, 200);
  const initialMe = await initialMeRes.json();
  assert.equal(initialMe.type, 'guest');
  assert.ok(initialMe.id);

  const guestCookie = initialMeRes.headers
    .getSetCookie()
    .find((c) => c.includes('splitwiser_guest='))!
    .split(';')[0];

  // 2. Guest creates a group "Weekend Cabin" and pre-adds "Charlie"
  const createGroupRes = await request('/api/groups', {
    cookie: guestCookie,
    body: { name: 'Weekend Cabin', creatorName: 'Alice' },
  });
  assert.equal(createGroupRes.status, 201);
  const group = await createGroupRes.json();
  assert.equal(group.name, 'Weekend Cabin');
  assert.ok(group.inviteCode);

  // Pre-add offline member "Charlie"
  const addCharlieRes = await request(`/api/groups/${group.id}/members`, {
    cookie: guestCookie,
    body: { name: 'Charlie' },
  });
  assert.equal(addCharlieRes.status, 201);
  const charlie = await addCharlieRes.json();
  assert.equal(charlie.name, 'Charlie');
  assert.equal(charlie.isClaimed, false);

  // 3. Friend (Bob) clicks invite link /api/groups/join/:code
  const joinInfoRes = await request(`/api/groups/join/${group.inviteCode}`, {
    ip: '192.0.2.2',
  });
  assert.equal(joinInfoRes.status, 200);
  const joinInfo = await joinInfoRes.json();
  assert.equal(joinInfo.group.name, 'Weekend Cabin');
  assert.equal(joinInfo.members.length, 2); // Alice and Charlie

  const bobGuestCookie = joinInfoRes.headers
    .getSetCookie()
    .find((c) => c.includes('splitwiser_guest='))!
    .split(';')[0];

  // Bob claims "Charlie"
  const claimRes = await request(`/api/groups/join/${group.inviteCode}`, {
    cookie: bobGuestCookie,
    ip: '192.0.2.2',
    body: { memberId: charlie.id },
  });
  assert.equal(claimRes.status, 201);

  // Bob tries to join again -> 409 already_member
  const rejoinRes = await request(`/api/groups/join/${group.inviteCode}`, {
    cookie: bobGuestCookie,
    ip: '192.0.2.2',
    body: { name: 'Bob Second Time' },
  });
  assert.equal(rejoinRes.status, 409);
  const rejoinBody = await rejoinRes.json();
  assert.equal(rejoinBody.error.code, 'already_member');

  // Bob checks join info -> alreadyMember is true
  const bobJoinInfoRes = await request(`/api/groups/join/${group.inviteCode}`, {
    cookie: bobGuestCookie,
    ip: '192.0.2.2',
  });
  assert.equal(bobJoinInfoRes.status, 200);
  const bobJoinInfo = await bobJoinInfoRes.json();
  assert.equal(bobJoinInfo.alreadyMember, true);
  assert.equal(bobJoinInfo.myMemberId, charlie.id);

  // Bob lost his session (e.g. cleared cookies / new device) and reclaims Charlie
  const newGuestJoinRes = await request(`/api/groups/join/${group.inviteCode}`, {
    ip: '192.0.2.3',
  });
  const newGuestCookie = newGuestJoinRes.headers
    .getSetCookie()
    .find((c) => c.includes('splitwiser_guest='))!
    .split(';')[0];

  const reclaimRes = await request(`/api/groups/join/${group.inviteCode}`, {
    cookie: newGuestCookie,
    ip: '192.0.2.3',
    body: { memberId: charlie.id },
  });
  assert.equal(reclaimRes.status, 201);
  const reclaimData = await reclaimRes.json();
  assert.equal(reclaimData.member.id, charlie.id);
  assert.equal(reclaimData.member.name, 'Charlie');

  // 4. Alice adds an expense ($60 dinner split equally between Alice and Charlie/Bob)
  const detailRes = await request(`/api/groups/${group.id}`, { cookie: guestCookie });
  const detail = await detailRes.json();
  const aliceMemberId = detail.members.find((m: { name: string }) => m.name === 'Alice').id;

  const expenseRes = await request(`/api/groups/${group.id}/expenses`, {
    cookie: guestCookie,
    body: {
      description: 'Dinner at cabin',
      amountCents: 6000,
      paidByMemberId: aliceMemberId,
      splitType: 'equal',
      splitWithMemberIds: [aliceMemberId, charlie.id],
    },
  });
  assert.equal(expenseRes.status, 201);

  // 5. Verify balances: Alice is owed $30 (+3000), Charlie owes $30 (-3000)
  const balancesDetail = await (await request(`/api/groups/${group.id}`, { cookie: guestCookie })).json();
  const aliceBal = balancesDetail.balances.find((b: { memberId: string }) => b.memberId === aliceMemberId);
  const charlieBal = balancesDetail.balances.find((b: { memberId: string }) => b.memberId === charlie.id);
  assert.equal(aliceBal.balanceCents, 3000);
  assert.equal(charlieBal.balanceCents, -3000);

  // Suggested repayments: Charlie owes Alice $30
  assert.equal(balancesDetail.suggestedRepayments.length, 1);
  assert.equal(balancesDetail.suggestedRepayments[0].fromMemberId, charlie.id);
  assert.equal(balancesDetail.suggestedRepayments[0].toMemberId, aliceMemberId);
  assert.equal(balancesDetail.suggestedRepayments[0].amountCents, 3000);

  // 6. Charlie settles up: records payment of $30 to Alice
  const settlementRes = await request(`/api/groups/${group.id}/expenses`, {
    cookie: bobGuestCookie,
    ip: '192.0.2.2',
    body: {
      description: 'Settled up via Interac',
      amountCents: 3000,
      paidByMemberId: charlie.id,
      splitType: 'settlement',
      splitWithMemberIds: [aliceMemberId],
    },
  });
  assert.equal(settlementRes.status, 201);

  // 7. Verify balances are now 0 and suggested repayments are empty
  const settledDetail = await (await request(`/api/groups/${group.id}`, { cookie: guestCookie })).json();
  const aliceBalAfter = settledDetail.balances.find((b: { memberId: string }) => b.memberId === aliceMemberId);
  const charlieBalAfter = settledDetail.balances.find((b: { memberId: string }) => b.memberId === charlie.id);
  assert.equal(aliceBalAfter.balanceCents, 0);
  assert.equal(charlieBalAfter.balanceCents, 0);
  assert.equal(settledDetail.suggestedRepayments.length, 0);

  // 8. Delete settlement expense
  const deleteRes = await request(`/api/groups/${group.id}/expenses/${(await settlementRes.json()).id}`, {
    method: 'DELETE',
    cookie: guestCookie,
  });
  assert.equal(deleteRes.status, 200);
});

test('guest links email via magic link to save account and retain groups', async () => {
  // 1. Guest creates a group
  const createGroupRes = await request('/api/groups', {
    body: { name: 'Roadtrip 2026', creatorName: 'Dave' },
    ip: '192.0.2.5',
  });
  const guestCookie = createGroupRes.headers
    .getSetCookie()
    .find((c) => c.includes('splitwiser_guest='))!
    .split(';')[0];
  const group = await createGroupRes.json();

  // 2. Guest signs in with magic link to save account
  const link = await sendLink('dave@example.com', '192.0.2.5');
  const verified = await request(`${link.pathname}${link.search}`, {
    cookie: guestCookie,
    ip: '192.0.2.5',
  });
  assert.equal(verified.status, 302);
  const userCookie = verified.headers
    .getSetCookie()
    .find((v) => v.includes('session_token='))!
    .split(';')[0];

  // 3. Check /api/me with user cookie + guest cookie: auto-merges
  const meRes = await request('/api/me', {
    cookie: `${userCookie}; ${guestCookie}`,
    ip: '192.0.2.5',
  });
  const me = await meRes.json();
  assert.equal(me.type, 'user');
  assert.equal(me.email, 'dave@example.com');

  // 4. Group is preserved in user's groups listing
  const groupsListRes = await request('/api/groups', {
    cookie: userCookie,
    ip: '192.0.2.5',
  });
  const groupsList = await groupsListRes.json();
  assert.equal(groupsList.groups.length, 1);
  assert.equal(groupsList.groups[0].id, group.id);
});

test('email requests share a persistent rate limit across auth instances', async () => {
  const initialCount = emails.length;
  for (let index = 0; index < 5; index++) {
    await sendLink('limited@example.com', '192.0.2.9');
  }
  const limited = await request('/api/auth/sign-in/magic-link', {
    body: {
      email: 'limited@example.com',
      callbackURL: `${appOrigin}/`,
      turnstileToken: 'valid-test-turnstile-token',
    },
    ip: '192.0.2.9',
  });
  assert.equal(limited.status, 429);
  assert.equal(emails.length - initialCount, 5);
});

test('turnstile protects magic link from automated abuse', async () => {
  // 1. Missing turnstile token -> 403
  const missingRes = await request('/api/auth/sign-in/magic-link', {
    body: {
      email: 'attacker@example.com',
      callbackURL: `${appOrigin}/`,
    },
  });
  assert.equal(missingRes.status, 403);
  const missingBody = await missingRes.json();
  assert.equal(missingBody.error.code, 'turnstile_failed');

  // 2. Invalid turnstile token -> 403
  const invalidRes = await request('/api/auth/sign-in/magic-link', {
    body: {
      email: 'attacker@example.com',
      callbackURL: `${appOrigin}/`,
      turnstileToken: 'invalid-turnstile-token',
    },
  });
  assert.equal(invalidRes.status, 403);
  const invalidBody = await invalidRes.json();
  assert.equal(invalidBody.error.code, 'turnstile_failed');
});

test('bodyLimit rejects oversized payloads (>50KB)', async () => {
  const largePayload = {
    name: 'Big Group',
    creatorName: 'A'.repeat(60 * 1024), // 60KB
  };
  const res = await request('/api/groups', {
    body: largePayload,
  });
  assert.equal(res.status, 413);
  const body = await res.json();
  assert.equal(body.error.code, 'payload_too_large');
});

