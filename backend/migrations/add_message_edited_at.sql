-- Lets a message's sender edit their own DM after sending it.
ALTER TABLE messages ADD COLUMN edited_at DATETIME NULL;
