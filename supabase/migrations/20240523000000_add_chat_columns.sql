-- Add columns for chat notifications and roles
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_from_advisor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Optional: Add index for performance on notification queries
CREATE INDEX IF NOT EXISTS idx_messages_notifications ON messages(user_id, is_from_advisor, is_read);
