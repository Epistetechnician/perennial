'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import PerennialPredictor with no SSR
const PerennialPredictor = dynamic(() => import('./perrenialpredictor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  ),
});

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    }>
      <main className="flex flex-col min-h-screen">
        <PerennialPredictor />
      </main>
    </Suspense>
  );
}
