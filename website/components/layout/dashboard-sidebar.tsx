"use client";

// ==============================
// Imports
// ==============================

import Link from "next/link";
import { usePathname } from "next/navigation";

import NuraLogo from "@/components/brand/nura-logo";

import {
  CalendarDays,
  ClipboardPlus,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  UserRound,
} from "lucide-react";

// ==============================
// Navigation
// ==============================

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Health Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
  {
    name: "Assessment",
    href: "/dashboard/assessment",
    icon: ClipboardPlus,
  },
  {
    name: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarDays,
  },
  {
    name: "Health Records",
    href: "/dashboard/records",
    icon: FileText,
  },
  {
    name: "Chat History",
    href: "/dashboard/chat-history",
    icon: History,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// ==============================
// Dashboard Sidebar
// ==============================

export default function DashboardSidebar() {
  const pathname = usePathname();

  // ==============================
  // Active Route Helper
  // ==============================

  function isActiveRoute(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <aside
      className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex"
      aria-label="Nura Health sidebar"
    >
      {/* ==============================
          Brand
      ============================== */}

      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Link
          href="/dashboard"
          className="block rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100"
          aria-label="Go to Nura Health dashboard"
        >
          <NuraLogo
            size={44}
            showText
          />
        </Link>
      </div>

      {/* ==============================
          Navigation
      ============================== */}

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-4"
        aria-label="Dashboard navigation"
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            isActiveRoute(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={19}
                className={`shrink-0 transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
                aria-hidden="true"
              />

              <span className="truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ==============================
          Medical Disclaimer
      ============================== */}

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Medical disclaimer
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Nura Health provides
            general health information
            and does not replace
            professional medical advice,
            diagnosis, or emergency care.
          </p>
        </div>
      </div>
    </aside>
  );
}