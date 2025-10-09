CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
DECLARE
  total_participants INTEGER;
  paid_participants INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'paid')
  INTO total_participants, paid_participants
  FROM payments
  WHERE bill_id = NEW.bill_id;

  IF paid_participants = total_participants THEN
    UPDATE bills
    SET status = 'completed'
    WHERE id = NEW.bill_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_bill_status
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_status();


ALTER TABLE bills ADD COLUMN status TEXT;
