'use client';
import React, { useEffect, useState } from 'react';
import { Container, Title, Table, Center, Loader , Button ,  } from '@mantine/core';
import Link from 'next/link';

// Définis le type pour un élément de l'inventaire
type InventaireItem = {
  id: number;
  name: string;
  author: string;
  quantite: number;
  price: number;
};

export default function Inventaire() {
  const [inventaire, setInventaire] = useState<InventaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchInventaire() {
      const response = await fetch('/api/inventaire', {
        method: 'GET',
      });
      // On suppose que la réponse est { data: InventaireItem[] }
      const result = await response.json();
      setInventaire(result.data || []);
      setLoading(false);
    }
    fetchInventaire();
  }, []);

  return (
    <Container>
      <Title order={1} mb="md">
        Livres Reçus
      </Title>
      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <>
            <Link href="/inventaire/ScannerResception" passHref>
              <Button >
                Inventaire
              </Button>
            </Link>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Auteur</th>
              <th>Quantité</th>
              <th>Prix</th>
              
            </tr>
          </thead>
          <tbody>
            {inventaire.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.author}</td>
                <td>{item.quantite}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </>
      )}
      
    </Container>
  );
}
