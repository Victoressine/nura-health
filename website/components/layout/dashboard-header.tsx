"use client";

// ==============================
// Imports
// ==============================

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bell,
  CheckCircle2,
  LogOut,
  MailWarning,
  Menu,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

// ==============================
// Props
// ==============================

type DashboardHeaderProps = {
  onOpenMenu: () => void;
};

// ==============================
// Dashboard Header
// ==============================

export default function DashboardHeader({
  onOpenMenu,
}: DashboardHeaderProps) {
  const router = useRouter();

  // ==============================
  // State
  // ==============================

  const [authReady, setAuthReady] =
    useState(false);

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  // ==============================
  // Watch Authentication State
  // ==============================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setEmail("");
            setEmailVerified(false);
            setAuthReady(true);

            router.replace(
              "/login"
            );

            return;
          }

          setEmail(
            user.email ?? ""
          );

          setEmailVerified(
            user.emailVerified
          );

          setAuthReady(true);
        }
      );

    return unsubscribe;
  }, [router]);

  // ==============================
  // Logout
  // ==============================

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await signOut(auth);

      router.replace(
        "/login"
      );
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      setLoggingOut(false);
    }
  }

  // ==============================
  // Auth Loading State
  // ==============================

  if (!authReady) {
    return (
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />

        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
      </header>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* ==============================
          Mobile Menu
      ============================== */}

      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu
          size={22}
          aria-hidden="true"
        />
      </button>

      {/* ==============================
          Desktop Heading
      ============================== */}

      <div className="hidden lg:block">
        <p className="text-sm font-medium text-slate-900">
          Nura Health
        </p>

        <p className="text-xs text-slate-500">
          Your personal health workspace
        </p>
      </div>

      {/* ==============================
          Header Actions
      ============================== */}

      <div className="flex items-center gap-2">
        {/* ==============================
            Email Verification
        ============================== */}

        {emailVerified ? (
          <div
            className="hidden items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700 sm:flex"
            title={
              email
                ? `${email} is verified`
                : "Email verified"
            }
          >
            <CheckCircle2
              size={16}
              aria-hidden="true"
            />

            Verified
          </div>
        ) : (
          <Link
            href="/verify-email"
            className="hidden items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100 sm:flex"
          >
            <MailWarning
              size={16}
              aria-hidden="true"
            />

            Verify email
          </Link>
        )}

        {/* ==============================
            Notifications
        ============================== */}

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
          aria-label="Notifications"
        >
          <Bell
            size={20}
            aria-hidden="true"
          />

          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600"
            aria-hidden="true"
          />
        </button>

        {/* ==============================
            Sign Out
        ============================== */}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut
            size={17}
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </span>
        </button>
      </div>
    </header>
  );
}