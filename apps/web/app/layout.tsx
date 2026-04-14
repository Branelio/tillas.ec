import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'TILLAS.EC — Sneakers #1 de Ecuador',
  description: 'La tienda de zapatillas más innovadora de Ecuador. Compra sneakers originales Nike, Jordan, Adidas, New Balance y más. Envío a todo Ecuador.',
  keywords: ['sneakers', 'zapatillas', 'tillas', 'ecuador', 'quito', 'nike', 'jordan', 'adidas', 'comprar sneakers ecuador'],
  openGraph: {
    title: 'TILLAS.EC — Sneakers #1 de Ecuador',
    description: 'La tienda de zapatillas más innovadora de Ecuador. Sneakers originales con envío a todo el país.',
    url: 'https://tillas.ec',
    siteName: 'TILLAS.EC',
    type: 'website',
    locale: 'es_EC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TILLAS.EC — Sneakers #1 de Ecuador',
    description: 'Compra sneakers originales en Ecuador. Envío a todo el país.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-tillas-bg text-white antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
