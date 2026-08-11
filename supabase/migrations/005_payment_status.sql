-- Add due_day (day of month for payment/receipt) and status fields
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_day INTEGER DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 31);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'received', 'overdue'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL;
