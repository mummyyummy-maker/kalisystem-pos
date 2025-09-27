import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface GoogleSheetsCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// JWT implementation for Google API authentication
async function createJWT(credentials: GoogleSheetsCredentials, scopes: string[]): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: scopes.join(' '),
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Import private key
  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  
  // Extract base64 content from PEM format
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');
  
  // Convert base64 to Uint8Array properly
  const binaryString = atob(pemContents);
  const keyBytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
  
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signatureInput}.${signatureB64}`;
}

async function getAccessToken(credentials: GoogleSheetsCredentials): Promise<string> {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const jwt = await createJWT(credentials, scopes);

  const response = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function readFromGoogleSheets(accessToken: string, spreadsheetId: string, range: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to read from Google Sheets: ${response.statusText}`);
  }

  return await response.json();
}

async function writeToGoogleSheets(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: values
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to write to Google Sheets: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Google Service Account credentials from environment
    const credentialsJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS');
    if (!credentialsJson) {
      throw new Error('Google Service Account credentials not found');
    }

    const credentials: GoogleSheetsCredentials = JSON.parse(credentialsJson);
    const spreadsheetId = Deno.env.get('GOOGLE_SPREADSHEET_ID') || '16v611yCsHQZ_CG949DwmEjT9kUAEK4cWuXcfk7nWuLU';
    if (!spreadsheetId) {
      throw new Error('Google Spreadsheet ID not found');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'sync-from-sheets':
        // Read from Google Sheets and update Supabase
        const accessToken = await getAccessToken(credentials);
        const sheetsData = await readFromGoogleSheets(accessToken, spreadsheetId, 'Form Responses 1!A:H');
        
        if (!sheetsData.values || sheetsData.values.length === 0) {
          return new Response(JSON.stringify({ error: 'No data found in Google Sheets' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }

        // Skip header row and map to database format
        const [headers, ...rows] = sheetsData.values;
        const items = rows.map((row: string[]) => ({
          item_name: row[0] || '',
          category: row[1] || '',
          default_supplier: row[2] || '',
          supplier_alternative: row[3] || null,
          order_quantity: row[4] || null,
          measure_unit: row[5] || null,
          default_quantity: row[6] || null,
          brand_tag: row[7] || null
        }));

        // Clear existing items and insert new ones
        await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error: insertError } = await supabaseClient.from('items').insert(items);

        if (insertError) {
          throw new Error(`Failed to insert items: ${insertError.message}`);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Synced ${items.length} items from Google Sheets to Supabase` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'sync-to-sheets':
        // Read from Supabase and update Google Sheets
        const { data: supabaseItems, error: fetchError } = await supabaseClient
          .from('items')
          .select('item_name, category, default_supplier, supplier_alternative, order_quantity, measure_unit, default_quantity, brand_tag')
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw new Error(`Failed to fetch items from Supabase: ${fetchError.message}`);
        }

        if (!supabaseItems || supabaseItems.length === 0) {
          return new Response(JSON.stringify({ error: 'No items found in Supabase' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }

        // Convert to Google Sheets format
        const sheetsHeaders = ['Item_name', 'category', 'default_supplier', 'supplier_alternative', 'order_quantity', 'measure_unit', 'default_quantity', 'brand_tag'];
        const sheetsRows = supabaseItems.map(item => [
          item.item_name || '',
          item.category || '',
          item.default_supplier || '',
          item.supplier_alternative || '',
          item.order_quantity || '',
          item.measure_unit || '',
          item.default_quantity || '',
          item.brand_tag || ''
        ]);

        const allRows = [sheetsHeaders, ...sheetsRows];
        const writeAccessToken = await getAccessToken(credentials);
        await writeToGoogleSheets(writeAccessToken, spreadsheetId, 'Form Responses 1!A:H', allRows);

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Synced ${supabaseItems.length} items from Supabase to Google Sheets` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'two-way-sync':
        // Perform both operations
        const syncAccessToken = await getAccessToken(credentials);
        
        // First, sync from Sheets to Supabase
        const syncSheetsData = await readFromGoogleSheets(syncAccessToken, spreadsheetId, 'Form Responses 1!A:H');
        if (syncSheetsData.values && syncSheetsData.values.length > 1) {
          const [syncHeaders, ...syncRows] = syncSheetsData.values;
          const syncItems = syncRows.map((row: string[]) => ({
            item_name: row[0] || '',
            category: row[1] || '',
            default_supplier: row[2] || '',
            supplier_alternative: row[3] || null,
            order_quantity: row[4] || null,
            measure_unit: row[5] || null,
            default_quantity: row[6] || null,
            brand_tag: row[7] || null
          }));

          await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseClient.from('items').insert(syncItems);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Two-way sync completed successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid action. Use: sync-from-sheets, sync-to-sheets, or two-way-sync' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
    }

  } catch (error) {
    console.error('Error in google-sheets-sync:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});