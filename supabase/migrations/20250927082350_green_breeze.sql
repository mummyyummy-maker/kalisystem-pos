/*
  # Create items table for inventory management

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `item_name` (text, not null)
      - `category` (text)
      - `default_supplier` (text)
      - `supplier_alternative` (text)
      - `order_quantity` (text)
      - `measure_unit` (text)
      - `default_quantity` (text)
      - `brand_tag` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `items` table
    - Add policy for authenticated users to read and write items
    - Add policy for service role to manage items

  3. Indexes
    - Add index on item_name for faster searches
    - Add index on category for filtering
    - Add index on default_supplier for filtering
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text,
  default_supplier text,
  supplier_alternative text,
  order_quantity text,
  measure_unit text,
  default_quantity text,
  brand_tag text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can read items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete items"
  ON items
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for service role (for Edge Functions)
CREATE POLICY "Service role can manage items"
  ON items
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_item_name ON items (item_name);
CREATE INDEX IF NOT EXISTS idx_items_category ON items (category);
CREATE INDEX IF NOT EXISTS idx_items_default_supplier ON items (default_supplier);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items (created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();