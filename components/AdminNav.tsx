"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    title: "CapCity",
    links: [
      { href: "/", label: "Overview", icon: "◧" },
      { href: "/users", label: "Users", icon: "◉" },
      { href: "/posts", label: "AI media", icon: "▦" },
      { href: "/votes", label: "Votes", icon: "▲" },
    ],
  },
  {
    title: "AI pipeline",
    links: [
      { href: "/chains", label: "Prompt chains", icon: "⛓" },
      { href: "/requests", label: "Generation requests", icon: "↻" },
      { href: "/responses", label: "LLM responses", icon: "✎" },
      { href: "/terms", label: "Terms", icon: "≡" },
      { href: "/examples", label: "Examples", icon: "★" },
      { href: "/models", label: "LLM models", icon: "◆" },
      { href: "/providers", label: "LLM providers", icon: "◇" },
    ],
  },
  {
    title: "Access",
    links: [
      { href: "/signup-domains", label: "Signup domains", icon: "@" },
      { href: "/whitelist", label: "Whitelisted emails", icon: "✓" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:min-h-0 md:gap-4 md:overflow-y-auto">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex gap-1 md:flex-col">
          <p className="hidden px-3 text-[11px] font-semibold tracking-wide text-[var(--text-secondary)] uppercase md:block">
            {group.title}
          </p>
          {group.links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
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
        </div>
      ))}
    </nav>
  );
}
