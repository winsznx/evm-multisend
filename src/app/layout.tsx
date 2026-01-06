import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import ContextProvider from '@/context';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'EVM MultiSend - Send Tokens to Multiple Addresses',
  description: 'Send ETH and ERC20 tokens to multiple addresses in one transaction across all EVM networks. Fast, secure, and easy to use.',
  keywords: ['ethereum', 'multisend', 'batch transfer', 'crypto', 'blockchain', 'evm', 'tokens'],
  authors: [{ name: 'EVM MultiSend' }],
  openGraph: {
    title: 'EVM MultiSend - Send Tokens to Multiple Addresses',
    description: 'Send ETH and ERC20 tokens to multiple addresses in one transaction across all EVM networks.',
    type: 'website',
    locale: 'en_US',
    siteName: 'EVM MultiSend',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EVM MultiSend - Send Tokens to Multiple Addresses',
    description: 'Send ETH and ERC20 tokens to multiple addresses in one transaction across all EVM networks.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get('cookie');

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>
          <Header />
          <main>{children}</main>
        </ContextProvider>
      </body>
    </html>
  );
}
