"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ==============================
// Types
// ==============================

type HealthProfile = {
  dateOfBirth: string;
  sex: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: string;
  conditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
};

// ==============================
// Default values
// ==============================

const initialProfile: HealthProfile = {
  dateOfBirth: "",
  sex: "",
  bloodType: "",
  height: "",
  weight: "",
  allergies: "",
  conditions: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
};

// ==============================
// Health Profile Page
// ==============================

export default function HealthProfilePage() {
  const [profile, setProfile] = useState<HealthProfile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // Load existing profile
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(
          db,
          "users",
          user.uid,
          "healthProfile",
          "profile"
        );

        const snapshot = await getDoc(profileRef);

        if (snapshot.exists()) {
          setProfile(snapshot.data() as HealthProfile);
        }
      } catch (error) {
        console.error("Unable to load health profile:", error);
        setError("Unable to load your health profile.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ==============================
  // Handle field changes
  // ==============================

  function updateField(field: keyof HealthProfile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==============================
  // Save health profile
  // ==============================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const profileRef = doc(
        db,
        "users",
        user.uid,
        "healthProfile",
        "profile"
      );

      await setDoc(
        profileRef,
        {
          ...profile,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Health profile saved successfully.");
    } catch (error) {
      console.error("Unable to save health profile:", error);
      setError("Unable to save your health profile.");
    } finally {
      setSaving(false);
    }
  }

  // ==============================
  // Loading state
  // ==============================

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Loading health profile...</p>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Personal Health Information
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Health Profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep your basic health information up to date so Nura Health can
          provide a more useful and organized experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==============================
            Basic health details
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Basic health details
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date of birth
              </label>

              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(event) =>
                  updateField("dateOfBirth", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sex
              </label>

              <select
                value={profile.sex}
                onChange={(event) => updateField("sex", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Blood type
              </label>

              <select
                value={profile.bloodType}
                onChange={(event) =>
                  updateField("bloodType", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Height (cm)
                </label>

                <input
                  type="number"
                  min="0"
                  value={profile.height}
                  onChange={(event) =>
                    updateField("height", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={profile.weight}
                  onChange={(event) =>
                    updateField("weight", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==============================
            Medical background
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Medical background
          </h2>

          <div className="mt-5 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Allergies
              </label>

              <textarea
                value={profile.allergies}
                onChange={(event) =>
                  updateField("allergies", event.target.value)
                }
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Example: Penicillin, peanuts, none known"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Existing conditions
              </label>

              <textarea
                value={profile.conditions}
                onChange={(event) =>
                  updateField("conditions", event.target.value)
                }
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Example: Asthma, hypertension, none known"
              />
            </div>
          </div>
        </div>

        {/* ==============================
            Emergency contact
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Emergency contact
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>

              <input
                type="text"
                value={profile.emergencyContactName}
                onChange={(event) =>
                  updateField("emergencyContactName", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>

              <input
                type="tel"
                value={profile.emergencyContactPhone}
                onChange={(event) =>
                  updateField("emergencyContactPhone", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Relationship
              </label>

              <input
                type="text"
                value={profile.emergencyContactRelationship}
                onChange={(event) =>
                  updateField(
                    "emergencyContactRelationship",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Parent, spouse, sibling..."
              />
            </div>
          </div>
        </div>

        {/* ==============================
            Feedback
        ============================== */}

        {message && (
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* ==============================
            Save action
        ============================== */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save health profile"}
          </button>
        </div>
      </form>
    </section>
  );
}