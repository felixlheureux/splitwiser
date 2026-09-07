import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, test } from 'node:test';

const directory = new URL('../migrations/', import.meta.url);
const migrations = readdirSync(directory)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => readFileSync(new URL(name, directory), 'utf8'));

let db: DatabaseSync;

function insert(table: string, values: Record<string, string | number | null>) {
  const columns = Object.keys(values);
  db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`)
    .run(...Object.values(values));
}

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  for (const sql of migrations) db.exec(sql);

  insert('groups', {
    id: 'g1',
    name: 'Weekend Trip',
    invite_code: 'trip123',
    created_by: 'u1',
    created_at: 'now',
  });

  insert('group_members', {
    id: 'm1',
    group_id: 'g1',
    name: 'Alice',
    user_id: 'u1',
    guest_id: null,
    created_at: 'now',
  });

  insert('group_members', {
    id: 'm2',
    group_id: 'g1',
    name: 'Bob',
    user_id: null,
    guest_id: 'g_bob',
    created_at: 'now',
  });

  insert('expenses', {
    id: 'e1',
    group_id: 'g1',
    description: 'Dinner',
    amount_cents: 6000,
    paid_by_member_id: 'm1',
    split_type: 'equal',
    split_with_member_ids: JSON.stringify(['m1', 'm2']),
    created_at: 'now',
  });
});

afterEach(() => db.close());

test('foreign key constraints prevent invalid group references', () => {
  assert.throws(() => {
    insert('group_members', {
      id: 'm_invalid',
      group_id: 'nonexistent',
      name: 'Invalid',
      user_id: null,
      guest_id: null,
      created_at: 'now',
    });
  }, /FOREIGN KEY constraint failed/);

  assert.throws(() => {
    insert('expenses', {
      id: 'e_invalid',
      group_id: 'g1',
      description: 'Invalid Payer',
      amount_cents: 1000,
      paid_by_member_id: 'nonexistent_member',
      split_type: 'equal',
      split_with_member_ids: JSON.stringify(['m1']),
      created_at: 'now',
    });
  }, /FOREIGN KEY constraint failed/);
});

test('deleting a group cascades to its members and expenses', () => {
  db.exec("DELETE FROM groups WHERE id = 'g1'");
  const members = db.prepare("SELECT count(*) as count FROM group_members WHERE group_id = 'g1'").get() as { count: number };
  const expenses = db.prepare("SELECT count(*) as count FROM expenses WHERE group_id = 'g1'").get() as { count: number };
  assert.equal(members.count, 0);
  assert.equal(expenses.count, 0);
});
