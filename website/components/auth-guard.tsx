"use client";

// ==============================
// Imports
// ==============================

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// ==============================
// Auth Guard
// ==============================

export default function AuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCheckingAuth(false);
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    });

    return unsubscribe;
  }, [router]);

  // ==============================
  // Loading state
  // ==============================

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Checking your account...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}