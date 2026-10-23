"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview", icon: "◧" },
  { href: "/users", label: "Users", icon: "◉" },
  { href: "/posts", label: "AI media", icon: "▦" },
  { href: "/votes", label: "Votes", icon: "▲" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-black/[.06] text-black dark:bg-white/[.1] dark:text-white"
                : "text-zinc-600 hover:bg-black/[.04] hover:text-black dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-white"
            }`}
          >
            <span aria-hidden className="w-4 text-center text-xs opacity-70">
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
