"use client";                       // interactive nav highlighting could live here
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  const nav = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing",  label: "Pricing" },
  ];
  return (
    <header className="h-16 flex items-center border-b px-4 lg:px-6">
      <Link href="/" className="flex items-center">
        <div className="relative flex items-center">
          <div className="h-4 w-8 border-t-2 border-gray-400 rounded-tl-full" />
          <div className="h-3 w-3 -mx-1 rounded-full bg-gradient-to-r from-red-400 to-red-500 relative top-1" />
          <div className="h-4 w-8 border-t-2 border-gray-400 rounded-tr-full" />
        </div>
        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-red-400 to-white/90 bg-clip-text text-transparent drop-shadow-sm">
          EducHorizon
        </span>
      </Link>

      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        {nav.map(({ href, label }) => (
          <Link key={href} href={href} className="text-sm font-medium text-white/90 hover:text-white hover:underline underline-offset-4">
            {label}
          </Link>
        ))}
        <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white hover:underline underline-offset-4">
          Login
        </Link>
        <Button asChild className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm">
          <Link href="/register">Register</Link>
        </Button>
      </nav>
    </header>
  );
}
