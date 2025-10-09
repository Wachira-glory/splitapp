CREATE OR REPLACE VIEW payment_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'paid') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count,
  SUM(amount) FILTER (WHERE status = 'paid') AS total_paid_amount,
  SUM(amount) FILTER (WHERE status = 'pending') AS total_pending_amount,
  COUNT(DISTINCT bill_id) AS total_bills
FROM payments;
