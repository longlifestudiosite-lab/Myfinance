-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Minha Casa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Add household_id to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- Add household_id to budget_limits
ALTER TABLE budget_limits ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id);

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for households
CREATE POLICY "Users see own households" ON households
  FOR ALL USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own membership" ON household_members
  FOR ALL USING (user_id = auth.uid());

-- Update transactions policy to use household
DROP POLICY IF EXISTS "Users manage own transactions" ON transactions;
CREATE POLICY "Users manage household transactions" ON transactions
  FOR ALL
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Update budget_limits policy
DROP POLICY IF EXISTS "Users manage own budget_limits" ON budget_limits;
CREATE POLICY "Users manage household budget_limits" ON budget_limits
  FOR ALL
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Create the household for Arrabal family
INSERT INTO households (id, name) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Familia Arrabal');

-- Add both users to the household
INSERT INTO household_members (household_id, user_id) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cec01d88-ea57-4923-88f9-69f0dc2bd085'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd107682e-7cee-466d-93db-d587c6e7a0ec');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_household_members_user ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_household ON transactions(household_id, created_at DESC);
