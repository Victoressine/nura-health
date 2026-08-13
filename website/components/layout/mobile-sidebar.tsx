"use client";

// ==============================
// Imports
// ==============================

import { useEffect } from "react";

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
  X,
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
// Props
// ==============================

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

// ==============================
// Mobile Sidebar
// ==============================

export default function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  const pathname = usePathname();

  // ==============================
  // Active Route Helper
  // ==============================

  function isActiveRoute(
    href: string
  ) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  // ==============================
  // Close With Escape
  // Lock Body Scroll
  // ==============================

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  // ==============================
  // Hidden State
  // ==============================

  if (!open) {
    return null;
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* ==============================
          Backdrop
      ============================== */}

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close navigation"
      />

      {/* ==============================
          Sidebar
      ============================== */}

      <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl">
        {/* ==============================
            Brand
        ============================== */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Go to Nura Health dashboard"
          >
            <NuraLogo
              size={42}
              showText
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Close navigation"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ==============================
            Navigation
        ============================== */}

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Mobile dashboard navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              isActiveRoute(
                item.href
              );

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
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
              Nura Health provides general
              health information and does not
              replace professional medical
              advice, diagnosis, or emergency
              care.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}