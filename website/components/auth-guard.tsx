"use client";

// ==============================
// Imports
// ==============================

import { ReactNode, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";

// ==============================
// Types
// ==============================

type AuthGuardProps = {
  children: ReactNode;
};

// ==============================
// Auth Guard
// ==============================

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  // ==============================
  // State
  // ==============================

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [authenticated, setAuthenticated] = useState(false);

  // ==============================
  // Watch Authentication State
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthenticated(false);
        setCheckingAuth(false);

        router.replace("/login");

        return;
      }

      setAuthenticated(true);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, [router]);

  // ==============================
  // Loading / Redirect State
  // ==============================

  if (checkingAuth || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  // ==============================
  // Protected Content
  // ==============================

  return <>{children}</>;
}
