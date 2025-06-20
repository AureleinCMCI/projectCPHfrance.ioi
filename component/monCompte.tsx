'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { jwtDecode } from 'jwt-decode';

// Typage du payload du JWT (adapte selon ta structure réelle)
type JwtPayload = {
  id: string;
  name: string;
  [key: string]: any;
};

export default function UpdateProfile() {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);

  // Lire l'utilisateur connecté via le JWT
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserId(decoded.id);
        setUser(decoded);
        setName(decoded.name); // Préremplir le champ nom
      } catch (e) {
        setUserId(null);
        setUser(null);
      }
    }
  }, []);

  // Fonction pour mettre à jour le profil
  const handleUpdate = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, name, password }),
    });
    setLoading(false);
    if (res.ok) {
      alert('Profil mis à jour !');
    } else {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  return (
    <div>
      {/* Affichage de l'utilisateur connecté */}
      {user ? (
        <div style={{ marginBottom: 12 }}>
          <b>Utilisateur connecté :</b> {user.name} (ID : {user.id})
        </div>
      ) : (
        <div style={{ marginBottom: 12, color: 'red' }}>
          Aucun utilisateur connecté.
        </div>
      )}
      <input
        value={name}
        onChange={handleNameChange}
        placeholder="Nouveau nom"
      />
      <input
        value={password}
        onChange={handlePasswordChange}
        placeholder="Nouveau mot de passe"
        type="password"
      />
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
    </div>
  );
}
