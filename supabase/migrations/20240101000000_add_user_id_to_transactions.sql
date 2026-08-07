-- Migration: Add user_id column to transactions table for RLS compliance
-- This ensures all transactions are associated with authenticated users

-- Add user_id column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users NOT NULL;

-- Create index for user_id performance (common query pattern)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Note: For existing records, you may need to handle NULL values
-- Alternatively, if creating the table new:
-- CREATE TABLE IF NOT EXISTS transactions (
--   id BIGSERIAL PRIMARY KEY,
--   user_id UUID REFERENCES auth.users NOT NULL,
--   amount DECIMAL(10,2) NOT NULL,
--   type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
--   category TEXT NOT NULL,
--   description TEXT,
--   payment_method TEXT,
--   status TEXT,
--   date DATE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- RLS Policies for user-level security
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow full access for authenticated users" 
-- ON transactions FOR ALL 
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
