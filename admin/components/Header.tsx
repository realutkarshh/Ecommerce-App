// components/Header.tsx
'use client';

import { useAdmin } from '../context/AdminContext';

export default function Header() {
  const { admin } = useAdmin();

  return (
    <header className="bg-white shadow-sm px-6 py-4 border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {admin?.username}
          </span>
        </div>
      </div>
    </header>
  );
}
