// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '../context/AdminContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAdmin();

  const menuItems = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/products', icon: '🍔', label: 'Products' },
    { href: '/orders', icon: '📦', label: 'Orders' },
    { href: '/users', icon: '👥', label: 'Users' },
  ];

  return (
    <div className="w-64 bg-white shadow-sm flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">🍔 Admin Panel</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
