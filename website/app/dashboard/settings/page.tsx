"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, useEffect, useState } from "react";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  CheckCircle2,
  Loader2,
  MailWarning,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

// ==============================
// Account Settings Page
// ==============================

export default function AccountSettingsPage() {
  // ==============================
  // State
  // ==============================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // Load account
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setEmail(user.email ?? "");
          setEmailVerified(user.emailVerified);

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();

            setFullName(
              typeof data.fullName === "string"
                ? data.fullName
                : user.displayName ?? ""
            );
          } else {
            setFullName(user.displayName ?? "");
          }
        } catch (loadError) {
          console.error(
            "Unable to load account settings:",
            loadError
          );

          setError(
            "We could not load your account settings."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ==============================
  // Update name
  // ==============================

  async function handleUpdateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    const cleanName = fullName.trim();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      // Update Firebase Auth
      await updateProfile(user, {
        displayName: cleanName,
      });

      // Update Firestore
      await updateDoc(
        doc(db, "users", user.uid),
        {
          fullName: cleanName,
          updatedAt: serverTimestamp(),
        }
      );

      setSuccess(
        "Your account details have been updated."
      );
    } catch (updateError) {
      console.error(
        "Unable to update account:",
        updateError
      );

      setError(
        "We could not update your account. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==============================
  // Send password reset
  // ==============================

  async function handlePasswordReset() {
    const user = auth.currentUser;

    if (!user?.email) {
      setError(
        "We could not determine your email address."
      );
      return;
    }

    setSendingReset(true);
    setSuccess("");
    setError("");

    try {
      await sendPasswordResetEmail(
        auth,
        user.email
      );

      setSuccess(
        "A password reset link has been sent to your email."
      );
    } catch (resetError) {
      console.error(
        "Unable to send password reset:",
        resetError
      );

      setError(
        "We could not send the password reset email."
      );
    } finally {
      setSendingReset(false);
    }
  }

  // ==============================
  // Loading
  // ==============================

  if (loading) {
    return (
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading account settings...
          </p>
        </div>
      </section>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Account Settings
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Manage your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update your account information and security settings.
        </p>
      </div>

      {/* ==============================
          Account details
      ============================== */}

      <form
        onSubmit={handleUpdateProfile}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Personal information
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </div>

          <div>
            {emailVerified ? (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 size={18} />
                Email verified
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                <MailWarning size={18} />
                Email not yet verified
              </div>
            )}
          </div>
        </div>

        {success && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>

      {/* ==============================
          Security
      ============================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Security
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Use a secure password and keep your account access private.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={sendingReset}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {sendingReset
              ? "Sending reset link..."
              : "Change password"}
          </button>
        </div>
      </div>
    </section>
  );
}