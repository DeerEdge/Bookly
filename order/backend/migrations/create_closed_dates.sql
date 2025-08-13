-- Create closed_dates table for storing specific dates when business is closed
CREATE TABLE IF NOT EXISTS closed_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  closed_date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, closed_date)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_closed_dates_business_date ON closed_dates(business_id, closed_date);
CREATE INDEX IF NOT EXISTS idx_closed_dates_business ON closed_dates(business_id);

-- Add some sample data (optional - remove if not needed)
-- INSERT INTO closed_dates (business_id, closed_date, reason) VALUES 
-- ('your-business-id', '2024-12-25', 'Christmas Day'),
-- ('your-business-id', '2024-01-01', 'New Year''s Day');
