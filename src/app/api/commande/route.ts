import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/clients';



/* delete Quantité inventaire */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { livre_id, ajout } = await request.json();

    // Récupérer la quantité actuelle
    const { data: produit, error: fetchError } = await supabase
      .from('inventaire')
      .select('quantite')
      .eq('id', livre_id)
      .maybeSingle();

    if (fetchError || !produit) {
      return new Response(JSON.stringify({ error: "Produit non trouvé" }), { status: 404 });
    }

    // Calculer la nouvelle quantité
    const nouvelleQuantite = produit.quantite - ajout;

    // Mettre à jour la quantité
    const { data, error } = await supabase
      .from('inventaire')
      .update({ quantite: nouvelleQuantite })
      .eq('id', livre_id)
      .select()
      .maybeSingle();

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