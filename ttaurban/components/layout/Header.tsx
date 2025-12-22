"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏙️</span>
        <h1 className="font-bold text-xl">TTA-Urban</h1>
      </div>
      <nav className="flex gap-6">
        <Link href="/" className="hover:text-indigo-200 transition">
          Home
        </Link>
        <Link href="/dashboard" className="hover:text-indigo-200 transition">
          Dashboard
        </Link>
        <Link href="/contact" className="hover:text-indigo-200 transition">
          Contact
        </Link>
        <Link href="/login" className="hover:text-indigo-200 transition">
          Sign In
        </Link>
      </nav>
    </header>
  );
}
