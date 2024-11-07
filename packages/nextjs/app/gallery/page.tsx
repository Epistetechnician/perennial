'use client';

import React from 'react';
import { AlloPoolsGallery } from '../../components/AlloPoolsGallery';
import { useRouter } from 'next/navigation';

const GalleryPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
          Prediction Markets Gallery
        </h1>
        <button
          onClick={() => router.push('/')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
        >
          <span className="mr-2">←</span>
          Back to Markets
        </button>
      </div>
      
      <AlloPoolsGallery />
    </div>
  );
};

export default GalleryPage; 