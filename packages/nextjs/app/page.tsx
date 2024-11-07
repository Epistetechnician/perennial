"use client";

import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';

// Dynamically import the PerennialPredictor component with no SSR
const PerennialPredictor = dynamic(
  () => import('./perrenialpredictor'),
  { ssr: false }
);

export default function Page() {
  return (
    <ErrorBoundary>
      <PerennialPredictor />
    </ErrorBoundary>
  );
}
