"use client";

import { UserButton } from "@clerk/nextjs";
import { Workflow } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-surface border-b border-border shrink-0">
      <Link href="/workflow" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Workflow size={20} className="text-accent" />
        <span className="text-sm font-bold text-white tracking-tight">
          NextFlow
        </span>
      </Link>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-7 h-7",
          },
        }}
      />
    </header>
  );
}
