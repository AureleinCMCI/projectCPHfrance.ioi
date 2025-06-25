'use client';
import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Paper, Center } from '@mantine/core';
import Link from 'next/link';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Définis le type User selon ton JWT
type User = JwtPayload & {
  name?: string;
  // Ajoute ici d'autres propriétés si besoin
};

export default function Hom() {
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode<User>(storedToken);
        setUser(decoded);
        console.log('Utilisateur connecté :', decoded);
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  return (
    <Container size="sm" my={40}>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} mb="md">
          Bienvenue sur l'inventaire
        </Title>
        <Text color="dimmed" mb="lg">
          Ceci est une page d’accueil construite avec Mantine et Next.js.
        </Text>
        <Center p={15}>
          <Link href="/commande" passHref>
            <Button component="a">
              Passer une commande
            </Button>
          </Link>
          <Link href="/inventaire" passHref>
            <Button component="a" ml={30}>
              Inventaire
            </Button>
          </Link>
        </Center>
      </Paper>
    </Container>
  );
}
