-- Migration: Update business_hours table to support individual time slots
-- Run this in your Supabase SQL editor

-- First, check if the table exists and add id column if missing
DO $$
BEGIN
    -- Add id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'business_hours' AND column_name = 'id'
    ) THEN
        ALTER TABLE business_hours ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    
    -- Add selected_slots column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'business_hours' AND column_name = 'selected_slots'
    ) THEN
        ALTER TABLE business_hours ADD COLUMN selected_slots JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add a unique constraint to prevent duplicate day entries per business
ALTER TABLE business_hours 
ADD CONSTRAINT unique_business_day UNIQUE (business_id, day_of_week);

-- Update the table structure to be more flexible
-- We'll keep the existing columns for backward compatibility but rely on selected_slots

-- Create an index on the selected_slots column for better performance
CREATE INDEX idx_business_hours_selected_slots ON business_hours USING GIN (selected_slots);

-- Sample data structure for selected_slots:
-- selected_slots: [8, 9, 10, 11, 12, 13, 14, 15, 16] 
-- Where each number represents a 30-minute slot starting from 5:00 AM
-- Slot 0 = 5:00 AM, Slot 1 = 5:30 AM, Slot 8 = 9:00 AM, etc.

-- Add some helpful comments
COMMENT ON COLUMN business_hours.selected_slots IS 'Array of 30-minute time slot numbers (0-37, where 0=5:00AM, 37=11:30PM)';
COMMENT ON COLUMN business_hours.day_of_week IS 'Day of week (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)';
COMMENT ON COLUMN business_hours.is_closed IS 'Whether the business is closed on this day';

-- Create a function to convert time slots to readable format (optional, for debugging)
CREATE OR REPLACE FUNCTION slot_to_time(slot_number INTEGER)
RETURNS TIME AS $$
BEGIN
    -- Convert slot number to time (starting from 5:00 AM)
    RETURN (TIME '05:00:00' + (slot_number * INTERVAL '30 minutes'));
END;
$$ LANGUAGE plpgsql;

-- Example usage: SELECT slot_to_time(8); -- Returns 09:00:00
