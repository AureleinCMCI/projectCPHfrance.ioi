import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/clients';

// Exemple de typage pour une ligne de la table "inventaire"
type HistoriqueResception = {
  id?: number; // id généré par la BDD
  user_id: number;
  date_reception: number;
  quantite: number;
  livre_id: number;
  info: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {  id, user_id, date_reception, quantite , livre_id , info} = await request.json() as HistoriqueResception;

    // Insertion d'une nouvelle commande
    const { data, error } = await supabase.from('inventaire').insert([{ id, user_id, quantite, date_reception , livre_id , info }]).select().maybeSingle();



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