CREATE OR REPLACE FUNCTION get_bill_details(bill_id_param TEXT)
RETURNS TABLE (
  bill_id TEXT,
  total_amount DECIMAL,
  till_number TEXT,
  number_of_diners INTEGER,
  payment_method TEXT,
  share_link TEXT,
  bill_status TEXT,
  participant_name TEXT,
  participant_phone TEXT,
  participant_amount DECIMAL,
  participant_status TEXT,
  participant_paid_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.total_amount,
    b.till_number,
    b.number_of_diners,
    b.payment_method,
    b.share_link,
    b.status,
    p.name,
    p.phone,
    p.amount,
    p.status,
    p.paid_at
  FROM bills b
  LEFT JOIN payments p ON b.id = p.bill_id
  WHERE b.id = bill_id_param;
END;
$$ LANGUAGE plpgsql;
