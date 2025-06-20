'use client';

import { Group, Box, Anchor } from '@mantine/core';

export default function SimpleNavbar() {
  return (
    <Box component="nav" px="md" py="sm" style={{ borderBottom: '1px solid #eee' }}>
      <Group gap="lg">
        {/* Logo à gauche */}
        <span style={{ fontWeight: 'bold', fontSize: 20 }}>MonLogo</span>
        {/* Liens de menu à gauche, à côté du logo */}
        <Anchor href="/hom" underline="hover">Accueil</Anchor>
        <Anchor href="/compte" underline="hover">monCompte</Anchor>
        <Anchor href="/contact" underline="hover">Contact</Anchor>
      </Group>
    </Box>
  );
}
