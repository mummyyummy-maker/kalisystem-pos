/*
  # Create orders table for Telegram bot integration

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `telegram_user_id` (text, required)
      - `order_id` (text, required for grouping items)
      - `item_name` (text, required)
      - `quantity` (numeric, required)
      - `category` (text, optional)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to manage orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id text NOT NULL,
  order_id text NOT NULL,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_telegram_user_id ON orders(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);