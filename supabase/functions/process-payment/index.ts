import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate PayFast signature
async function generateSignature(data: Record<string, string>, passphrase: string): Promise<string> {
  // Create parameter string
  let pfOutput = "";
  for (const key in data) {
    if (data.hasOwnProperty(key) && data[key] !== "") {
      pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
    }
  }
  
  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passphrase) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  // Create MD5 hash
  const encoder = new TextEncoder();
  const data_arr = encoder.encode(getString);
  
  const hashBuffer = await crypto.subtle.digest("MD5", data_arr);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, item_name, item_description, email_address, name_first, name_last } = await req.json();

    // Get PayFast credentials from environment
    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID');
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY');
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE');
    const mode = Deno.env.get('PAYFAST_MODE') || 'sandbox';

    if (!merchantId || !merchantKey) {
      console.error('PayFast credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build PayFast payment data
    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      cancel_url: `${req.headers.get('origin')}/booking`,
      notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-notify`,
      name_first: name_first || '',
      name_last: name_last || '',
      email_address: email_address,
      m_payment_id: crypto.randomUUID(),
      amount: amount.toFixed(2),
      item_name: item_name,
      item_description: item_description || '',
      custom_str1: user.id, // Store user ID for verification
    };

    // Generate signature
    const signature = await generateSignature(paymentData, passphrase || '');
    paymentData.signature = signature;

    // PayFast endpoint
    const payfastUrl = mode === 'live' 
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    console.log(`Payment initiated for user ${user.id}, amount: R${amount}`);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: payfastUrl,
        payment_data: paymentData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});