import { createClient } from '@/lib/supabase/clients';

export async function GET(req) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('inventaire')
    .select('*');

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ data }); // Ici, data est bien défini
}
