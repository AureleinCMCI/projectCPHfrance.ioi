// /app/api/account/page.jsx
import { createClient } from "@/lib/supabase/clients";

export async function GET(req) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  const { data, error } = await supabase
    .from('profiles')
    .select('name, password')
    .eq('id', userId)
    .single();
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ data });
}

export async function PATCH(req) {
  const supabase = createClient();
  const body = await req.json();
  const { id, name, password } = body;
  const { error } = await supabase.from('profiles').upsert({
    id,
    name,
    password,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ message: 'Profile updated!' });
}
