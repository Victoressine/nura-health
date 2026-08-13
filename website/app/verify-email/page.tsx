"use client";

// ==============================
// Imports
// ==============================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
} from "firebase/auth";

import { CheckCircle2, Loader2, Mail } from "lucide-react";

import { auth } from "@/lib/firebase";

// ==============================
// Verify Email Page
// ==============================

export default function VerifyEmailPage() {
  const router = useRouter();

  // ==============================
  // State
  // ==============================

  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // Load current user
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setVerified(user.emailVerified);
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  // ==============================
  // Check verification
  // ==============================

  async function handleCheckVerification() {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    setChecking(true);
    setError("");
    setMessage("");

    try {
      await reload(user);

      const refreshedUser = auth.currentUser;

      if (refreshedUser?.emailVerified) {
        setVerified(true);

        setMessage("Your email address has been verified successfully.");
      } else {
        setMessage(
          "Your email has not been verified yet. Check your inbox and click the verification link.",
        );
      }
    } catch (error) {
      console.error("Unable to check verification:", error);

      setError(
        "We could not check your verification status. Please try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  // ==============================
  // Resend verification
  // ==============================

  async function handleResend() {
    const user = auth.currentUser;

    if (!user || user.emailVerified) {
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      await sendEmailVerification(user);

      setMessage(
        "A new verification email has been sent. Please check your inbox. If you do not see it, check your Spam or Junk folder.",
      );
    } catch (error) {
      console.error("Unable to resend verification email:", error);

      setError(
        "We could not send another verification email. Please try again later.",
      );
    } finally {
      setSending(false);
    }
  }

  // ==============================
  // Loading
  // ==============================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking account...</p>
      </main>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              verified
                ? "bg-green-50 text-green-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {verified ? <CheckCircle2 size={27} /> : <Mail size={27} />}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {verified ? "Email verified" : "Verify your email"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {verified
              ? `${email} has been verified.`
              : `We sent a verification link to ${email}. Check your inbox, Spam, or Junk folder.`}
          </p>
        </div>

        {/* Feedback */}

        {message && (
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}

        <div className="mt-6 space-y-3">
          {!verified && (
            <>
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={checking}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {checking && <Loader2 size={17} className="animate-spin" />}

                {checking ? "Checking..." : "I verified my email"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={sending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Resend verification email"}
              </button>
            </>
          )}

          <Link
            href="/dashboard"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
