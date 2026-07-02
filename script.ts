import { createClient } from '@supabase/supabase-js';

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

if (rawUrl.endsWith('/rest/v1')) {
  rawUrl = rawUrl.replace('/rest/v1', '');
} else if (rawUrl.endsWith('/rest/v1/')) {
  rawUrl = rawUrl.replace('/rest/v1/', '');
}
const supabaseUrl = rawUrl.replace(/\/+$/, "");
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('master_indikator')
    .update({ target: '24 jam' })
    .eq('id', 'bcf94686-a38c-49ad-8dd0-94d28a2eff7b')
    .select();

  console.log('Update result:', data, error);
}

run();
