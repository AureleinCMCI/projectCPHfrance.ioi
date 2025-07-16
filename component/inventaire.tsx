'use client';

import {Button,Center, Checkbox,Loader, Paper,Table,Title,} from '@mantine/core';
import { IconBook, IconListDetails } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './style/inventaire.module.css';

type InventaireItem = {
  id: number;
  title: string;
  author: string;
  quantite: number;
  price: number;
};

export default function Inventaire() {
  const [inventaire, setInventaire] = useState<InventaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<number[]>([]);

  const handleCheckbox = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    async function fetchInventaire() {
      const response = await fetch('/api/inventaire');
      const result = await response.json();
      setInventaire(result.data || []);
      setLoading(false);
    }
    fetchInventaire();
  }, []);

  const rows = inventaire.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Checkbox
          checked={selected.includes(item.id)}
          onChange={() => handleCheckbox(item.id)}
        />
      </Table.Td>
      <Table.Td>
        <span style={{ color: '#aaa', fontSize: 12 }}>Aucune</span>
      </Table.Td>
      <Table.Td>{item.title}</Table.Td>
      <Table.Td>{item.author}</Table.Td>
      <Table.Td>{item.quantite}</Table.Td>
      <Table.Td>{item.price} €</Table.Td>
      <Table.Td></Table.Td>
      <Table.Td>
        <span style={{ color: '#228B22', fontWeight: 600 }}>EN STOCK</span>
      </Table.Td>
      <Table.Td>
        <Button variant="subtle" color="gray" radius="xl" size="xs">
          ...
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className={styles.bgGradient}>
      <Paper shadow="xl" radius="lg" p="xl" withBorder className={styles.cardTable}>
        <div className={styles.headerRow}>
          <Title order={1} mb="lg" ta="center" className={styles.title}>
            <IconBook size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Livres en stock
          </Title>
          <div className={styles.actions}>
            <Link href="/inventaire/ScannerResception" passHref legacyBehavior>
              <Button
                color="violet"
                radius="xl"
                leftSection={<IconListDetails size={18} />}
              >
                Accéder à l&apos;ajout de livre
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table
              striped
              highlightOnHover
              withColumnBorders
              className={styles.tableModern}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Image</Table.Th>
                  <Table.Th>Titre</Table.Th>
                  <Table.Th>Auteur</Table.Th>
                  <Table.Th>Quantité</Table.Th>
                  <Table.Th>Prix</Table.Th>
                  <Table.Th>ISBN</Table.Th>
                  <Table.Th>Statut</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </div>
        )}
      </Paper>
    </div>
  );
}
