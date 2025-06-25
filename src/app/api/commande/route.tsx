import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/clients';

type Inventaire = {
  id?: number; // id généré par la BDD
  author: string;
  name: string;
  quantite: number;
  price: number;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { author, name, quantite, price } = await request.json() as Inventaire;

    // Insertion d'une nouvelle commande
    const { data, error } = await supabase
      .from('commande')
      .insert([{ name, author, quantite, price }])
      .select()
      .maybeSingle();

    console.log("Résultat Supabase :", data, error);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'Inscription réussie !', user: data, success: true }),
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Erreur serveur :", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err.message }),
      { status: 500 }
    );
  }
}
