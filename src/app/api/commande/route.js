import { createClient } from '@/lib/supabase/clients';

export async function POST(request) {
  try {
    const supabase = createClient();
    const { author, name , quantite , price} = await request.json();


    // Insère une nouvel commande 
    const { data, error } = await supabase
      .from('inventaire')
      .insert([{ name, author , quantite , price }])
      .select()
      .maybeSingle();

    console.log("Résultat Supabase :", data, error);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: 'Inscription réussie !', user: data, success: true }), { status: 201 });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur", details: err.message }), { status: 500 });
  }
}