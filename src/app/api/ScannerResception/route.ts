import { createClient } from '@/lib/supabase/clients';
import { NextRequest } from 'next/server';





export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {id, ajout } = await request.json();

    // Récupérer la quantité actuelle
    const { data: produit, error: fetchError } = await supabase
      .from('inventaire')
      .select('quantite')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !produit) {
      return new Response(JSON.stringify({ error: "Produit non trouvé" }), { status: 404 });
    }

    // Calculer la nouvelle quantité
    const nouvelleQuantite = produit.quantite + ajout;

    // Mettre à jour la quantité
    const { data, error } = await supabase
      .from('inventaire')
      .update({ quantite: nouvelleQuantite })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'Quantité mise à jour', produit: data, success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur:', err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err}),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const {id, supprimer } = await request.json();

    // Récupérer la quantité actuelle
    const { data: produit, error: fetchError } = await supabase
      .from('inventaire')
      .select('quantite')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !produit) {
      return new Response(JSON.stringify({ error: "Produit non trouvé" }), { status: 404 });
    }

    // Calculer la nouvelle quantité
    const nouvelleQuantite = produit.quantite - supprimer;

    // Mettre à jour la quantité
    const { data, error } = await supabase
      .from('inventaire')
      .update({ quantite: nouvelleQuantite })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'Quantité mise à jour', produit: data, success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur:', err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err}),
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { id, livre_id, newIsbn, oldIsbn } = await request.json();

    if (!id || !livre_id || !newIsbn || !oldIsbn) {
      return new Response(JSON.stringify({ error: "id, livre_id, newIsbn et oldIsbn requis" }), { status: 400 });
    }

    // 1. Mettre à jour l'ISBN dans inventaire (clé primaire id)
    const { error: inventaireError } = await supabase
      .from('inventaire')
      .update({ isbn: newIsbn })
      .eq('id', id);

    if (inventaireError) {
      return new Response(JSON.stringify({ error: inventaireError.message }), { status: 400 });
    }

    // 2. Supprimer l'ancien ISBN dans la table isbn
    const { error: deleteIsbnError } = await supabase
      .from('isbn')
      .delete()
      .eq('livre_id', livre_id)
      .eq('isbn', oldIsbn);

    if (deleteIsbnError) {
      return new Response(JSON.stringify({ error: deleteIsbnError.message }), { status: 400 });
    }

    // 3. Insérer le nouveau ISBN dans la table isbn
    const { error: insertIsbnError } = await supabase
      .from('isbn')
      .insert([{ isbn: newIsbn, livre_id }]);

    if (insertIsbnError) {
      return new Response(JSON.stringify({ error: insertIsbnError.message }), { status: 400 });
    }

    // 4. (Optionnel) Mettre à jour l'ISBN principal dans livre
    await supabase
      .from('livre')
      .update({ isbn: newIsbn })
      .eq('id', livre_id);

    return new Response(
      JSON.stringify({ message: 'ISBN mis à jour dans toutes les tables', success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur:', err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: err }),
      { status: 500 }
    );
  }
}

