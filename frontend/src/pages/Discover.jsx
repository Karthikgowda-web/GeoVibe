import React from 'react';
import Sidebar from '../components/Sidebar';

const Discover = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Discover Mode</h1>
        <p className="text-gray-500">The world is yours to explore. Feature coming soon!</p>
      </main>
    </div>
  );
};

export default Discover;
