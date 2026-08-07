# Supabase Migration: Add user_id to transactions table

## Purpose
This migration adds a `user_id` column to the `transactions` table to enable Row Level Security (RLS) compliance. All transactions will be associated with authenticated users.

## Files
- `20240101000000_add_user_id_to_transactions.sql` - SQL migration script

## Application Changes
The client-side code already includes `user_id` in:
- Transaction type definitions (`src/types/database.types.ts`)
- Transaction creation (`src/actions/transactions.ts`)
- Supabase client integration

## Application Changes Required
If you're running this migration on an existing database with data:

1. Add the column:
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;
```

2. For existing records, you'll need to populate user_id manually or set a default value based on your data model.

3. Enable RLS on the transactions table:
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

4. Create policy for authenticated users:
```sql
CREATE POLICY "Allow full access for authenticated users" 
ON transactions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

## Client-Side Integration
- **Transaction Insert**: Includes `user_id: user.id` when saving via Supabase
- **Transaction Fetch**: Can be filtered by `user_id` for user-specific data
- **Auth Integration**: Uses `supabase.auth.getUser()` to get current user context

## Testing
After applying this migration:
1. Log in to the application
2. Create a new transaction
3. Verify it appears in the Supabase dashboard under your user's records
4. Verify other users cannot see your transactions (RLS enforcement)

## Deployment
Apply this migration in the Supabase Dashboard under:
- SQL Editor → New Query
- Or via Supabase CLI: `supabase db push`
