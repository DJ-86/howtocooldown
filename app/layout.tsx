import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://howtocooldown.com'),
  title: 'How To Cool Down — Clear advice for a hot room',
  description: 'Fast, practical advice to cool your room and yourself safely.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'How to cool down.',
    description: 'Clear advice for a hot room.',
    type: 'website',
    url: '/',
    images: [{ url: '/og.webp', width: 1200, height: 628, alt: 'How to cool down — clear advice for a hot room' }],
  },
  twitter: { card: 'summary_large_image', title: 'How to cool down.', description: 'Clear advice for a hot room.', images: ['/og.webp'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
