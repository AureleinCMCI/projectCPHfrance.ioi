'use client';

import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ReactNode } from 'react';
import { NavbarSearch } from '../../component/navbar';
import { usePathname } from 'next/navigation';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/'; // Masque la Navbar sur la page d'accueil (login)

  return (
    <html lang="fr">
      <head />
      <body>
        <MantineProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {!hideNavbar && <NavbarSearch />}
            <main style={{ flex: 1, padding: '24px' }}>
              {children}
            </main>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}