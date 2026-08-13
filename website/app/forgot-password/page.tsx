"use client";

// ==============================
// Imports
// ==============================

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import NuraLogo from "@/components/brand/nura-logo";
import { auth } from "@/lib/firebase";

// ==============================
// Constants
// ==============================

const MAX_EMAIL_LENGTH = 254;

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for this email address, a password reset link has been sent.";

// ==============================
// Forgot Password Page
// ==============================

export default function ForgotPasswordPage() {
  // ==============================
  // State
  // ==============================

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  // ==============================
  // Handle Password Reset
  // ==============================

  async function handleReset(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (
      cleanEmail.length >
      MAX_EMAIL_LENGTH
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(
        auth,
        cleanEmail
      );

      // ==============================
      // Generic Success Message
      //
      // Do not reveal whether
      // the account exists.
      // ==============================

      setSuccess(
        GENERIC_SUCCESS_MESSAGE
      );
    } catch (
      resetError: unknown
    ) {
      console.error(
        "Password reset error:",
        resetError
      );

      if (
        resetError instanceof
          FirebaseError &&
        resetError.code ===
          "auth/network-request-failed"
      ) {
        setError(
          "Unable to connect. Check your internet connection and try again."
        );

        return;
      }

      // ==============================
      // Keep Other Errors Generic
      // ==============================

      setSuccess(
        GENERIC_SUCCESS_MESSAGE
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // UI
  // ==============================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* ==============================
            Brand
        ============================== */}

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Nura Health home"
          >
            <NuraLogo
              size={72}
              showText={false}
            />
          </Link>

          <p className="mt-5 text-sm font-medium text-blue-600">
            Account recovery
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your account email
            and we&apos;ll send you a
            password reset link.
          </p>
        </div>

        {/* ==============================
            Reset Card
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleReset}
            className="space-y-5"
            noValidate
          >
            {/* ==============================
                Email
            ============================== */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={
                  MAX_EMAIL_LENGTH
                }
                value={email}
                disabled={loading}
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            {/* ==============================
                Success
            ============================== */}

            {success && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-700"
              >
                {success}
              </div>
            )}

            {/* ==============================
                Error
            ============================== */}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {/* ==============================
                Submit
            ============================== */}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending reset link..."
                : "Send reset link"}
            </button>
          </form>

          {/* ==============================
              Back To Login
          ============================== */}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500">
              Remember your
              password?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* ==============================
            Security Notice
        ============================== */}

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          For privacy, Nura Health
          does not confirm whether an
          email address is registered.
        </p>
      </div>
    </main>
  );
}