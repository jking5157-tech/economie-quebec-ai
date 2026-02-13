import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log('🚀 Sending test receipt to Supabase...');
    // console.log('URL:', supabaseUrl); // Don't log full URL to avoid leaking if not needed, but helpful for debugging

    const { data, error } = await supabase
        .from('receipts')
        .insert({
            merchant_name: 'Test Victoire',
            total_amount: 42.42,
            total_taxes: 0,
            category: 'Alimentation'
        })
        .select();

    if (error) {
        console.error('❌ Error sending receipt:', error.message);
    } else {
        console.log('✅ Success! Receipt sent.');
        console.log('Data:', data);
    }
}

testSupabase();
