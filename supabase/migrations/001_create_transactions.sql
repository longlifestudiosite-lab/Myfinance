-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'outros',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por data
CREATE INDEX idx_transactions_created_at ON transactions (created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política temporária: permitir tudo (depois adicionaremos auth)
CREATE POLICY "Allow all operations" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
