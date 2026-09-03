CREATE INDEX group_participants_id_group_unique
  ON group_participants (id, group_id);

CREATE TRIGGER expenses_payer_same_group_insert
BEFORE INSERT ON expenses
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM group_participants
  WHERE id = NEW.payer_participant_id AND group_id = NEW.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'expense payer must belong to the expense group');
END;

CREATE TRIGGER expenses_payer_same_group_update
BEFORE UPDATE OF group_id, payer_participant_id ON expenses
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM group_participants
  WHERE id = NEW.payer_participant_id AND group_id = NEW.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'expense payer must belong to the expense group');
END;

CREATE TRIGGER expense_splits_same_group_insert
BEFORE INSERT ON expense_splits
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM expenses
  JOIN group_participants ON group_participants.id = NEW.participant_id
  WHERE expenses.id = NEW.expense_id
    AND expenses.group_id = group_participants.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'expense split participant must belong to the expense group');
END;

CREATE TRIGGER expense_splits_same_group_update
BEFORE UPDATE OF expense_id, participant_id ON expense_splits
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM expenses
  JOIN group_participants ON group_participants.id = NEW.participant_id
  WHERE expenses.id = NEW.expense_id
    AND expenses.group_id = group_participants.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'expense split participant must belong to the expense group');
END;

CREATE TRIGGER settlements_parties_same_group_insert
BEFORE INSERT ON settlements
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM group_participants AS from_participant
  JOIN group_participants AS to_participant
    ON to_participant.id = NEW.to_participant_id
  WHERE from_participant.id = NEW.from_participant_id
    AND from_participant.group_id = NEW.group_id
    AND to_participant.group_id = NEW.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'settlement parties must belong to the settlement group');
END;

CREATE TRIGGER settlements_parties_same_group_update
BEFORE UPDATE OF group_id, from_participant_id, to_participant_id ON settlements
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM group_participants AS from_participant
  JOIN group_participants AS to_participant
    ON to_participant.id = NEW.to_participant_id
  WHERE from_participant.id = NEW.from_participant_id
    AND from_participant.group_id = NEW.group_id
    AND to_participant.group_id = NEW.group_id
)
BEGIN
  SELECT RAISE(ABORT, 'settlement parties must belong to the settlement group');
END;

CREATE TRIGGER memberships_participant_same_group_insert
BEFORE INSERT ON group_memberships
FOR EACH ROW
WHEN NEW.participant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM group_participants
    WHERE id = NEW.participant_id AND group_id = NEW.group_id
  )
BEGIN
  SELECT RAISE(ABORT, 'membership participant must belong to the membership group');
END;

CREATE TRIGGER memberships_participant_same_group_update
BEFORE UPDATE OF group_id, participant_id ON group_memberships
FOR EACH ROW
WHEN NEW.participant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM group_participants
    WHERE id = NEW.participant_id AND group_id = NEW.group_id
  )
BEGIN
  SELECT RAISE(ABORT, 'membership participant must belong to the membership group');
END;
