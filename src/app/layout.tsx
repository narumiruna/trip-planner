import type { Metadata } from 'next';
import Link from 'next/link';
import AuthNav from '@/components/AuthNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trip Planner Atelier',
  description: 'Boutique luxury AI travel planning, concierge itinerary design, maps, and collaboration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#f7f1e8] text-stone-950">
        <nav className="sticky top-0 z-40 border-b border-amber-100/80 bg-[#fffaf2]/90 px-4 py-3 shadow-sm shadow-amber-900/5 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-stone-950 transition-colors hover:text-amber-800">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1f1710] text-lg text-amber-50 shadow-lg shadow-amber-900/20">✈️</span>
              <span>
                <span className="block leading-tight">Trip Planner</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Atelier</span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-white/65 p-1 text-sm font-bold text-stone-600 sm:flex">
              <Link href="/" className="rounded-full bg-white px-4 py-2 shadow-sm transition-colors hover:text-amber-800">My Trips</Link>
              <span className="px-4 py-2 text-amber-700/70">Concierge itinerary design</span>
            </div>
            <AuthNav />
          </div>
        </nav>
        <main className="min-h-screen bg-[linear-gradient(180deg,_#fbf7ef_0%,_#ffffff_48%,_#f7f1e8_100%)]">
          {children}
        </main>
      </body>
    </html>
  );
}
