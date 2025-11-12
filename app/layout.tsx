import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Counter',
  description: 'Admin-controlled event counter with real-time updates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
