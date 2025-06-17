// src/app/layout.tsx
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';


export default function RootLayout({ children }) {
  return (
    <html>
      <head />
      <body>

        <MantineProvider withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
