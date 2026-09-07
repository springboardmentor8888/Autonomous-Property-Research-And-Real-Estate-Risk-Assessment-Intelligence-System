import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import ToastHost from '@/components/ToastHost';

export const metadata: Metadata = {
  title: 'Real Estate Due Diligence Agent',
  description: 'Property research and risk assessment platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        <Navbar />
        <main>{children}</main>
        <ToastHost />
      </body>
    </html>
  );
}
