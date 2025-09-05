import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Salon Admin',
  description: 'Admin dashboard for salon booking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

