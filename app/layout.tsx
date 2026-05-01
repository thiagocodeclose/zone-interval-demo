// @ts-nocheck
import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import { getKorivaConfig, buildCssVars } from '@/lib/koriva-config';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Zone Interval Studio — Heart-Rate Training · Austin, TX',
  description: 'Austin\'s most data-driven interval training studio. 5 zones. 45 minutes. Proven results.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getKorivaConfig();
  const vars = buildCssVars(cfg?.brand);
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`} style={vars as React.CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
