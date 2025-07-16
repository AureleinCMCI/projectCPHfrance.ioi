import { createClient } from '@/lib/supabase/clients';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('commande').select('*');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err.message }),
      { status: 500 }
    );
  }
}

/* delete Quantité inventaire */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { livre_id, quantite , user_id} = await request.json();

    const { data, error } = await supabase.from('commande').insert([{ livre_id , quantite, user_id}]).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'Quantité mise à jour', produit: data, success: true }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err.message }),
      { status: 500 }
    );
  }
}