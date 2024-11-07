'use client';

import { Web3Provider } from '../components/providers/Web3Provider';
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Web3Provider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </Web3Provider>
  );
} 