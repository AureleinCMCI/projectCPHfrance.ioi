import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <head />
      <body>
        <MantineProvider
          theme={{
            /** Couleur principale de l’application */
            primaryColor: 'indigo',

            /** Palette de couleurs personnalisée */
            colors: {
              indigo: [
                '#e0e7ff', // 0
                '#c7d2fe', // 1
                '#a5b4fc', // 2
                '#818cf8', // 3
                '#6366f1', // 4
                '#4f46e5', // 5
                '#4338ca', // 6
                '#3730a3', // 7
                '#312e81', // 8
                '#1e1b4b', // 9
              ],
            },

            /** Police par défaut */
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',

            /** Radius par défaut */
            defaultRadius: 'md',

            
            /** Mode sombre ou clair */
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
