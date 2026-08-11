-- Drop old transactions table structure and recreate with new fields
-- Add new columns to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'once' CHECK (recurrence IN ('once', 'fixed', 'installment'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installments_total INTEGER DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_current INTEGER DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS start_month INTEGER DEFAULT NULL; -- 1-12
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS start_year INTEGER DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES transactions(id) ON DELETE CASCADE DEFAULT NULL;

-- Index for parent lookup
CREATE INDEX IF NOT EXISTS idx_transactions_parent ON transactions(parent_id);
