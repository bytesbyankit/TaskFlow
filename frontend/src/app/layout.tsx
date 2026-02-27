import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'TaskFlow — Task Management',
    description: 'A modern task management system for organizing projects and tasks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
                <Providers>
                    <Navbar />
                    <main className="pt-16 min-h-screen">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
