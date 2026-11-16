import type { ReactNode } from 'react';
import '@fontsource-variable/instrument-sans';
import './globals.css';

export const metadata = { title: 'Acme with Nulvless and Next.js' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
