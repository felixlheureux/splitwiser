PRAGMA foreign_keys = ON;

CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  currency_exponent INTEGER NOT NULL CHECK (currency_exponent BETWEEN 0 AND 9),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  purge_after TEXT
);

CREATE TABLE group_participants (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 80),
  status TEXT NOT NULL CHECK (status IN ('active', 'archived', 'locked')),
  position INTEGER NOT NULL CHECK (position >= 0),
  created_by_membership_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE group_memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  participant_id TEXT REFERENCES group_participants(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL CHECK (status IN ('active', 'left', 'removed')),
  joined_via_invite_id TEXT,
  joined_at TEXT NOT NULL,
  left_at TEXT,
  removed_at TEXT
);

CREATE TABLE group_invites (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by_membership_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 120),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  payer_participant_id TEXT NOT NULL REFERENCES group_participants(id),
  split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'exact')),
  occurred_on TEXT NOT NULL CHECK (occurred_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_by_membership_id TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_by_membership_id TEXT
);

CREATE TABLE expense_splits (
  expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES group_participants(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  allocation_order INTEGER NOT NULL CHECK (allocation_order >= 0),
  PRIMARY KEY (expense_id, participant_id)
);

CREATE TABLE settlements (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_participant_id TEXT NOT NULL REFERENCES group_participants(id),
  to_participant_id TEXT NOT NULL REFERENCES group_participants(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  occurred_on TEXT NOT NULL CHECK (occurred_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_by_membership_id TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_by_membership_id TEXT,
  CHECK (from_participant_id <> to_participant_id)
);

CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  actor_membership_id TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary_json TEXT NOT NULL CHECK (json_valid(summary_json)),
  created_at TEXT NOT NULL
);

CREATE TABLE idempotency_records (
  actor_user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (actor_user_id, idempotency_key)
);

CREATE UNIQUE INDEX memberships_user_group_unique
  ON group_memberships (group_id, user_id);

CREATE UNIQUE INDEX memberships_participant_unique
  ON group_memberships (participant_id)
  WHERE participant_id IS NOT NULL;

CREATE UNIQUE INDEX memberships_active_owner_unique
  ON group_memberships (group_id)
  WHERE role = 'owner' AND status = 'active';

CREATE UNIQUE INDEX group_active_invite_unique
  ON group_invites (group_id)
  WHERE revoked_at IS NULL;

CREATE INDEX memberships_by_user_status
  ON group_memberships (user_id, status, group_id);

CREATE INDEX memberships_by_group_status
  ON group_memberships (group_id, status, joined_at, id);

CREATE INDEX participants_by_group_status_position
  ON group_participants (group_id, status, position, id);

CREATE INDEX invites_by_group
  ON group_invites (group_id, revoked_at, id);

CREATE INDEX expenses_by_group_history
  ON expenses (group_id, deleted_at, occurred_on, created_at, id);

CREATE INDEX splits_by_participant
  ON expense_splits (participant_id, expense_id);

CREATE INDEX settlements_by_group_history
  ON settlements (group_id, deleted_at, occurred_on, created_at, id);

CREATE INDEX activity_by_group_history
  ON activity_events (group_id, created_at, id);

CREATE INDEX idempotency_by_created_at
  ON idempotency_records (created_at);
