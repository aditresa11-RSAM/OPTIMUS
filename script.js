import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('master_indikator')
    .update({ target: '24 jam' })
    .ilike('indicator_title', '%Jam buka pelayanan Gawat darurat%')
    .eq('target', '≥ 24 jam')
    .select();

  console.log('Update result:', data, error);
}

run();
