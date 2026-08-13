// ==============================
// Imports
// ==============================

import Link from "next/link";
import { LucideIcon } from "lucide-react";

// ==============================
// Types
// ==============================

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  href: string;
};

// ==============================
// Stat Card
// ==============================

export default function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  href,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="block"
    >
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {value}
            </p>

            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {helper}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={21} />
          </div>
        </div>
      </div>
    </Link>
  );
}