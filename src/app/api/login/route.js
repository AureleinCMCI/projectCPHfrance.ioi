import { createClient } from "@/lib/supabase/clients";
import jwt from "jsonwebtoken";

// À remplacer par une vraie clé secrète, idéalement dans une variable d'environnement
const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete_ultra_longue";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { name, password } = await request.json();
    console.log("Tentative de connexion avec :", name, password);

    // Recherche de l'utilisateur par nom et mot de passe
    const { data, error } = await supabase
      .from('USER')
      .select('*')
      .eq('name', name)
      .eq('password', password)
      .maybeSingle();

    console.log("Résultat Supabase :", data, error);

    if (error) {
      console.error("Erreur Supabase :", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    if (!data) {
      return new Response(JSON.stringify({ error: "Nom ou mot de passe incorrect", success: false }), { status: 401 });
    }

    // On ne retourne pas le mot de passe dans la réponse !
    const { password: _, ...userWithoutPassword } = data;

    // Création du jeton JWT
    const token = jwt.sign(
      {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        // Ajoute d'autres infos si besoin
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return new Response(JSON.stringify({
      message: 'Connexion réussie !',
      user: userWithoutPassword,
      token, // Le jeton JWT est renvoyé ici
      success: true
    }), { status: 200 });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur", details: err.message }), { status: 500 });
  }
}
