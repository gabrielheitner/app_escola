-- Migration: Add dispatch tracking fields to payments table
-- Purpose: Track message dispatches and conversion metrics

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS dispatch_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS message_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS conversion_time_hours integer,
ADD COLUMN IF NOT EXISTS last_sync_date timestamp with time zone;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_dispatch_date ON payments(dispatch_date);
CREATE INDEX IF NOT EXISTS idx_payments_message_sent ON payments(message_sent);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add comment to document the fields
COMMENT ON COLUMN payments.dispatch_date IS 'Data e hora em que a mensagem de cobrança foi enviada via n8n';
COMMENT ON COLUMN payments.message_sent IS 'Flag indicando se a mensagem de cobrança foi enviada';
COMMENT ON COLUMN payments.conversion_time_hours IS 'Tempo em horas entre o disparo da mensagem e o pagamento';
COMMENT ON COLUMN payments.last_sync_date IS 'Data da última sincronização com a API do Asaas';

-- Create function to automatically calculate conversion_time_hours
CREATE OR REPLACE FUNCTION calculate_conversion_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Se payment_date e dispatch_date existem, calcular tempo de conversão
  IF NEW.payment_date IS NOT NULL AND NEW.dispatch_date IS NOT NULL THEN
    NEW.conversion_time_hours := EXTRACT(EPOCH FROM (NEW.payment_date - NEW.dispatch_date)) / 3600;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate conversion time
DROP TRIGGER IF EXISTS trigger_calculate_conversion_time ON payments;
CREATE TRIGGER trigger_calculate_conversion_time
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_conversion_time();
