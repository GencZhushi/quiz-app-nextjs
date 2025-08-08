import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 flex flex-col sm:flex-row items-center gap-2 w-full px-4 md:px-6">
      <p className="text-xs text-gray-600">© 2024 EducHorizon. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        {["terms","privacy","contact"].map((href) => (
          <Link key={href} href={`/${href}`} className="text-xs text-gray-600 hover:underline underline-offset-4">
            {href === "terms" ? "Terms of Service" : href === "privacy" ? "Privacy Policy" : "Contact"}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
