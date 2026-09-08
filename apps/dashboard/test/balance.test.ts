import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateBalances,
  type BalanceInputExpense,
  type BalanceInputMember,
} from '@splitwiser/shared';

describe('calculateBalances', () => {
  const members: BalanceInputMember[] = [
    { id: 'm1', name: 'Alice' },
    { id: 'm2', name: 'Bob' },
    { id: 'm3', name: 'Charlie' },
    { id: 'm4', name: 'David' },
  ];

  it('calculates 1-to-1 settlement correctly', () => {
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 5000,
        paidByMemberId: 'm1',
        splitType: 'settlement',
        splitWithMemberIds: ['m2'],
      },
    ];

    const { balances, suggestedRepayments } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    assert.equal(balanceMap['m1'], 5000);
    assert.equal(balanceMap['m2'], -5000);
    assert.equal(balanceMap['m3'], 0);
    assert.equal(balanceMap['m4'], 0);

    // Invariant: sum of all balances must be zero
    const sum = Object.values(balanceMap).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, 0);

    assert.equal(suggestedRepayments.length, 1);
    assert.deepEqual(suggestedRepayments[0], {
      fromMemberId: 'm2',
      fromName: 'Bob',
      toMemberId: 'm1',
      toName: 'Alice',
      amountCents: 5000,
    });
  });

  it('splits settlement equally across multiple recipients', () => {
    // Alice pays $60 total to settle with Bob and Charlie ($30 each)
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 6000,
        paidByMemberId: 'm1',
        splitType: 'settlement',
        splitWithMemberIds: ['m2', 'm3'],
      },
    ];

    const { balances, suggestedRepayments } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    assert.equal(balanceMap['m1'], 6000);
    assert.equal(balanceMap['m2'], -3000);
    assert.equal(balanceMap['m3'], -3000);
    assert.equal(balanceMap['m4'], 0);

    // Invariant: sum of all balances must be zero
    const sum = Object.values(balanceMap).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, 0);

    assert.equal(suggestedRepayments.length, 2);
    assert.ok(
      suggestedRepayments.some(
        (r) => r.fromMemberId === 'm2' && r.toMemberId === 'm1' && r.amountCents === 3000,
      ),
    );
    assert.ok(
      suggestedRepayments.some(
        (r) => r.fromMemberId === 'm3' && r.toMemberId === 'm1' && r.amountCents === 3000,
      ),
    );
  });

  it('handles odd penny remainder distribution across recipients deterministically', () => {
    // Alice pays $10.01 (1001 cents) split among Bob, Charlie, and David (3 recipients)
    // 1001 / 3 = 333 with remainder 2
    // First 2 recipients get 334, third gets 333
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 1001,
        paidByMemberId: 'm1',
        splitType: 'settlement',
        splitWithMemberIds: ['m2', 'm3', 'm4'],
      },
    ];

    const { balances } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    assert.equal(balanceMap['m1'], 1001);
    assert.equal(balanceMap['m2'], -334);
    assert.equal(balanceMap['m3'], -334);
    assert.equal(balanceMap['m4'], -333);

    const sum = Object.values(balanceMap).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, 0);
  });

  it('filters out payer if accidentally included in recipient list', () => {
    // Alice pays $40 to Bob and Charlie, but Alice is also in splitWithMemberIds
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 4000,
        paidByMemberId: 'm1',
        splitType: 'settlement',
        splitWithMemberIds: ['m1', 'm2', 'm3'],
      },
    ];

    const { balances } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    // Alice gets +4000, Bob and Charlie each get -2000
    assert.equal(balanceMap['m1'], 4000);
    assert.equal(balanceMap['m2'], -2000);
    assert.equal(balanceMap['m3'], -2000);

    const sum = Object.values(balanceMap).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, 0);
  });

  it('correctly settles debt after equal expense', () => {
    // 1. Alice pays $90 for dinner split among Alice, Bob, and Charlie
    // Each person owes $30 share: Alice net +$60, Bob net -$30, Charlie net -$30
    // 2. Bob pays Alice $30 settlement
    // Result: Alice net +$30, Bob net $0, Charlie net -$30
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 9000,
        paidByMemberId: 'm1',
        splitType: 'equal',
        splitWithMemberIds: ['m1', 'm2', 'm3'],
      },
      {
        amountCents: 3000,
        paidByMemberId: 'm2',
        splitType: 'settlement',
        splitWithMemberIds: ['m1'],
      },
    ];

    const { balances, suggestedRepayments } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    assert.equal(balanceMap['m1'], 3000);
    assert.equal(balanceMap['m2'], 0);
    assert.equal(balanceMap['m3'], -3000);

    const sum = Object.values(balanceMap).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, 0);

    assert.equal(suggestedRepayments.length, 1);
    assert.deepEqual(suggestedRepayments[0], {
      fromMemberId: 'm3',
      fromName: 'Charlie',
      toMemberId: 'm1',
      toName: 'Alice',
      amountCents: 3000,
    });
  });

  it('handles empty recipients gracefully without NaN or division by zero', () => {
    const expenses: BalanceInputExpense[] = [
      {
        amountCents: 5000,
        paidByMemberId: 'm1',
        splitType: 'settlement',
        splitWithMemberIds: [],
      },
    ];

    const { balances } = calculateBalances(members, expenses);
    const balanceMap = Object.fromEntries(balances.map((b) => [b.memberId, b.balanceCents]));

    assert.equal(balanceMap['m1'], 0);
    assert.equal(balanceMap['m2'], 0);
  });
});
