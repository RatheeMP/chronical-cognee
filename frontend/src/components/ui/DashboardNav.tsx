import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";

export default function DashboardNav() {
  return (
    <header className="nav-glass sticky top-0 z-40">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/guided"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors duration-300 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Guided tour
        </Link>
        <div className="flex items-center gap-2.5">
          <ChroniAvatar size="sm" interactive={false} />
          <p className="text-sm font-semibold tracking-tight text-slate-100">
            Workspace
          </p>
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
