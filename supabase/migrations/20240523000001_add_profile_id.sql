-- Add profile_id column for chat profile separation
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES tax_profiles(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_messages_profile_id ON messages(profile_id);
