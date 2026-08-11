-- Add user_id to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create budget_limits table
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  limit_amount DECIMAL(10, 2) NOT NULL CHECK (limit_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Enable RLS on budget_limits
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policy on transactions
DROP POLICY IF EXISTS "Allow all operations" ON transactions;

-- RLS: Users can only see/modify their own transactions
CREATE POLICY "Users manage own transactions" ON transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can only see/modify their own budget limits
CREATE POLICY "Users manage own budget_limits" ON budget_limits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits (user_id);
