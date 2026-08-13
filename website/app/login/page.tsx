"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { FirebaseError } from "firebase/app";

import NuraLogo from "@/components/brand/nura-logo";
import { auth } from "@/lib/firebase";

// ==============================
// Login Page
// ==============================

export default function LoginPage() {
  const router = useRouter();

  // ==============================
  // Form State
  // ==============================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==============================
  // Friendly Firebase Errors
  // ==============================

  function getLoginErrorMessage(
    error: unknown
  ) {
    if (
      !(
        error instanceof
        FirebaseError
      )
    ) {
      return "We could not sign you in. Please try again.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/too-many-requests":
        return "Too many sign-in attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Unable to connect. Check your internet connection and try again.";

      default:
        return "We could not sign you in. Please try again.";
    }
  }

  // ==============================
  // Handle Login
  // ==============================

  async function handleLogin(
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

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      // ==============================
      // Persist Authentication
      // ==============================

      await setPersistence(
        auth,
        browserLocalPersistence
      );

      // ==============================
      // Sign In
      // ==============================

      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // ==============================
      // Continue To Dashboard
      // ==============================

      router.replace(
        "/dashboard"
      );
    } catch (
      loginError: unknown
    ) {
      console.error(
        "Login error:",
        loginError
      );

      setError(
        getLoginErrorMessage(
          loginError
        )
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

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to your
            Nura Health account.
          </p>
        </div>

        {/* ==============================
            Login Card
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleLogin}
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
                maxLength={254}
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            {/* ==============================
                Password
            ============================== */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Enter your password"
              />
            </div>

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
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          {/* ==============================
              Signup Link
          ============================== */}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an
              account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* ==============================
            Security Notice
        ============================== */}

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Access to your Nura Health
          account is protected by
          Firebase Authentication.
        </p>
      </div>
    </main>
  );
}