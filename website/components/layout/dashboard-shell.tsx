"use client";

// ==============================
// Imports
// ==============================

import { useState } from "react";

import DashboardHeader from "@/components/layout/dashboard-header";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import NuraChatWidget from "@/components/chat/nura-chat-widget";

// ==============================
// Dashboard Shell
// ==============================

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}

        <DashboardSidebar />

        {/* Mobile sidebar */}

        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() =>
            setMobileMenuOpen(false)
          }
        />

        {/* Main content */}

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            onOpenMenu={() =>
              setMobileMenuOpen(true)
            }
          />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>

        {/* ==============================
            Nura AI Chat Widget
        ============================== */}

        <NuraChatWidget />
      </div>
    </div>
  );
}