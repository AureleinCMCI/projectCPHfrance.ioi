import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/clients';

// Exemple de typage pour une ligne de la table "inventaire"
type Inventaire = {
  id?: number; // id généré par la BDD
  author: string;
  title: string;
  description:string;
  isbn:number
};
// affiche les infos 

// insert dans inventaire
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { author, title, description, isbn } = await request.json() as Inventaire;

    // Insertion d'une nouvelle commande
    const { data, error } = await supabase.from('livre').insert([{ title, author,description,isbn }]).select().maybeSingle();



    console.log("Résultat Supabase :", data, error);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'ajout réussie', user: data, success: true }),
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
