/*
  # Add Google Sheets Sync Support

  1. Functions
    - Add function to handle Google Sheets synchronization
    - Support for bidirectional sync between Google Sheets and Supabase

  2. Security
    - Ensure proper RLS policies are maintained
    - Add indexes for better sync performance

  3. Notes
    - Requires Google Service Account credentials in environment variables
    - Requires GOOGLE_SPREADSHEET_ID in environment variables
*/

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists on items table
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add index for better sync performance
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at DESC);

-- Add a sync log table to track sync operations
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL CHECK (sync_type IN ('from_sheets', 'to_sheets', 'two_way')),
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  items_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on sync_logs
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Add policy for sync_logs (service role only)
CREATE POLICY "Service role can manage sync logs"
  ON sync_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add index for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at DESC);