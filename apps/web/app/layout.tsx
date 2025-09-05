import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Salon Admin',
  description: 'Admin dashboard for salon booking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}

