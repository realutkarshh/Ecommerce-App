// app/components/PageNavLinks.tsx
"use client";

import { useUser } from "@/app/context/user-context";
import Link from "next/link";

export default function PageNavLinks() {
  const { user, logout } = useUser();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Hello, {user.username}</span>
        <Link href="/orders" className="mr-4">
          Orders
        </Link>
        <Link href="/profile" className="mr-4">
          Profile
        </Link>
        <button
          onClick={logout}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  // Not logged in
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="px-3 py-2 text-blue-500 hover:underline text-sm"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-3 py-2 text-blue-500 hover:underline text-sm"
      >
        Register
      </Link>
    </div>
  );
}
