import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";

export default function DashboardNav() {
  return (
    <header className="nav-glass sticky top-0 z-40 border-b border-[rgb(99_102_241/0.12)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Link
          href="/guided"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors duration-300 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Interactive Demo
        </Link>
        <div className="flex items-center gap-2.5">
          <ChroniAvatar size="sm" interactive={false} />
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-100">
              Chronicle Playground
            </p>
            <p className="text-[10px] text-slate-500">Validation workspace</p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs text-slate-500 transition-colors duration-300 hover:text-[#818CF8]"
        >
          Overview
        </Link>
      </div>
    </header>
  );
}
