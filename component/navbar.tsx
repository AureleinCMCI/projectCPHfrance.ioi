'use client';

import { Anchor, Box, Burger, CloseButton, Drawer, Group } from '@mantine/core';
import { useState } from 'react';
import styles from './style/nav.module.css';

export default function Navbar() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      {/* Bouton burger flottant à gauche */}
      <Box className={styles.burgerBox}>
        <Burger
          opened={opened}
          onClick={() => setOpened((o) => !o)}
          aria-label="Ouvrir le menu"
          size="md"
        />
      </Box>

      {/* Sidebar Drawer à gauche */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={<span style={{ fontWeight: 'bold', fontSize: 20 }}>nav bar</span>}
        padding="md"
        size="xs"
        position="left"
        overlayProps={{ opacity: 0.5, blur: 2 }}
        withCloseButton={false}
      >
        <Box style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <CloseButton aria-label="Fermer le menu" onClick={() => setOpened(false)} />
        </Box>
        <Group gap="xs">
          <Anchor href="#" underline="hover">site link</Anchor>
          <Anchor href="#" underline="hover">site link</Anchor>
          <Anchor href="#" underline="hover">site link</Anchor>
          <Anchor href="#" underline="hover">site link</Anchor>
        </Group>
      </Drawer>
    </>
  );
}