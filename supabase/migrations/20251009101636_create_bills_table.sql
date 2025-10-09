CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  total_amount DECIMAL(10, 2) NOT NULL,
  till_number TEXT NOT NULL,
  number_of_diners INTEGER NOT NULL,
  amount_per_person DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stk', 'link')),
  share_link TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
