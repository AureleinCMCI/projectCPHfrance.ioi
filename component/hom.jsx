'use client';
import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Paper } from '@mantine/core';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

export default function Hom() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

useEffect(() => {
  const storedToken = localStorage.getItem('jwt');
  if (storedToken) {
    try {
      const decoded = jwtDecode(storedToken);
      setUser(decoded);
      console.log("Utilisateur connecté :", decoded);
    } catch (e) {
      setUser(null);
    }
  }
}, []);
  return (
    <Container size="sm" my={40}>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} align="center" mb="md">
          Bienvenue sur l'inventaire
        </Title>
        <Text align="center" color="dimmed" mb="lg">
          Ceci est une page d’accueil construite avec Mantine et Next.js.
        </Text>
        {/* Affichage du jeton JWT */}
        {token && (
          <Text align="center" color="gray" mb="md" size="xs" style={{ wordBreak: 'break-all' }}>
            <b>Jeton JWT :</b> {token}
          </Text>
        )}
        <Link href="/commande" passHref legacyBehavior>
          <Button
            component="a"
            fullWidth
            size="md"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            Passer une commande
          </Button>
        </Link>
      </Paper>
    </Container>
  );
}
