"use client";

// ==============================
// Imports
// ==============================

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { FirebaseError } from "firebase/app";

import NuraLogo from "@/components/brand/nura-logo";
import { auth, db } from "@/lib/firebase";

// ==============================
// Constants
// ==============================

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

// ==============================
// Signup Page
// ==============================

export default function SignupPage() {
  const router = useRouter();

  // ==============================
  // Form State
  // ==============================

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==============================
  // Validate Signup Form
  // ==============================

  function validateForm(): string | null {
    const cleanName =
      fullName.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (
      cleanName.length < 2
    ) {
      return "Please enter your full name.";
    }

    if (
      cleanName.length >
      MAX_NAME_LENGTH
    ) {
      return "Your full name is too long.";
    }

    if (!cleanEmail) {
      return "Please enter your email address.";
    }

    if (
      cleanEmail.length >
      MAX_EMAIL_LENGTH
    ) {
      return "Please enter a valid email address.";
    }

    if (
      password.length <
      MIN_PASSWORD_LENGTH
    ) {
      return `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (
      !/[A-Z]/.test(password)
    ) {
      return "Password must contain at least one uppercase letter.";
    }

    if (
      !/[a-z]/.test(password)
    ) {
      return "Password must contain at least one lowercase letter.";
    }

    if (
      !/[0-9]/.test(password)
    ) {
      return "Password must contain at least one number.";
    }

    if (
      password !==
      confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return null;
  }

  // ==============================
  // Friendly Firebase Errors
  // ==============================

  function getFirebaseErrorMessage(
    signupError: unknown
  ): string {
    if (
      !(
        signupError instanceof
        FirebaseError
      )
    ) {
      return "We could not create your account. Please try again.";
    }

    switch (
      signupError.code
    ) {
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Please choose a stronger password.";

      case "auth/network-request-failed":
        return "Unable to connect. Check your internet connection and try again.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/operation-not-allowed":
        return "Account registration is currently unavailable.";

      case "permission-denied":
        return "Your account was created, but your profile could not be saved.";

      default:
        return "We could not create your account. Please try again.";
    }
  }

  // ==============================
  // Handle Signup
  // ==============================

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    const cleanName =
      fullName.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    setLoading(true);

    try {
      // ==============================
      // 1. Create Firebase Account
      // ==============================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      const user =
        userCredential.user;

      // ==============================
      // 2. Save Display Name
      // ==============================

      await updateProfile(
        user,
        {
          displayName:
            cleanName,
        }
      );

      // ==============================
      // 3. Create Firestore Profile
      // ==============================

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          uid:
            user.uid,

          fullName:
            cleanName,

          email:
            user.email,

          role:
            "patient",

          // ==============================
          // Account Status
          // ==============================

          onboardingComplete:
            false,

          healthProfileComplete:
            false,

          // ==============================
          // Audit Fields
          // ==============================

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      // ==============================
      // 4. Send Verification Email
      // ==============================

      try {
        await sendEmailVerification(
          user
        );
      } catch (
        verificationError
      ) {
        // Account creation remains valid even
        // if verification email delivery fails.

        console.error(
          "Verification email could not be sent:",
          verificationError
        );
      }

      // ==============================
      // 5. Continue To Dashboard
      // ==============================

      router.replace(
        "/dashboard"
      );
    } catch (
      signupError: unknown
    ) {
      console.error(
        "Signup error:",
        signupError
      );

      setError(
        getFirebaseErrorMessage(
          signupError
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
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join Nura Health and
            organise your personal
            health information securely.
          </p>
        </div>

        {/* ==============================
            Signup Card
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={
              handleSignup
            }
            className="space-y-5"
            noValidate
          >
            {/* ==============================
                Full Name
            ============================== */}

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                maxLength={
                  MAX_NAME_LENGTH
                }
                value={fullName}
                disabled={loading}
                onChange={(
                  event
                ) => {
                  setFullName(
                    event.target
                      .value
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Enter your full name"
              />
            </div>

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
                ) => {
                  setEmail(
                    event.target
                      .value
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            {/* ==============================
                Password
            ============================== */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={
                  MIN_PASSWORD_LENGTH
                }
                value={password}
                disabled={loading}
                onChange={(
                  event
                ) => {
                  setPassword(
                    event.target
                      .value
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Create a strong password"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use at least 8
                characters with an
                uppercase letter,
                lowercase letter and
                number.
              </p>
            </div>

            {/* ==============================
                Confirm Password
            ============================== */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                minLength={
                  MIN_PASSWORD_LENGTH
                }
                value={
                  confirmPassword
                }
                disabled={loading}
                onChange={(
                  event
                ) => {
                  setConfirmPassword(
                    event.target
                      .value
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Enter your password again"
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
                Medical Disclaimer
            ============================== */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                Nura Health provides
                general health
                information and
                personal health
                management tools. It
                does not replace
                professional medical
                advice, diagnosis, or
                emergency care.
              </p>
            </div>

            {/* ==============================
                Submit
            ============================== */}

            <button
              type="submit"
              disabled={loading}
              aria-busy={
                loading
              }
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating your account..."
                : "Create account"}
            </button>
          </form>

          {/* ==============================
              Login Link
          ============================== */}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500">
              Already have an
              account?{" "}
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
            Privacy Notice
        ============================== */}

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your account and health
          information are accessible
          only through your
          authenticated Nura Health
          account.
        </p>
      </div>
    </main>
  );
}