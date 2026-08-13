"use client";

// ==============================
// Imports
// ==============================

import { useEffect, useState } from "react";
import Link from "next/link";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";

import { Activity, CalendarDays, ClipboardPlus, FileText } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import StatCard from "@/components/dashboard/stat-card";

// ==============================
// Types
// ==============================

type UserProfile = {
  fullName?: string;
  email?: string;
  role?: string;
};

// ==============================
// Dashboard Page
// ==============================

export default function DashboardPage() {
  // ==============================
  // State
  // ==============================

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [healthProfileComplete, setHealthProfileComplete] = useState(false);

  const [assessmentCount, setAssessmentCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // Load dashboard data
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        // ==============================
        // Load main user profile
        // ==============================

        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setProfile(userSnapshot.data() as UserProfile);
        }

        // ==============================
        // Check health profile
        // ==============================

        const healthProfileRef = doc(
          db,
          "users",
          user.uid,
          "healthProfile",
          "profile",
        );

        const healthProfileSnapshot = await getDoc(healthProfileRef);

        setHealthProfileComplete(healthProfileSnapshot.exists());

        // ==============================
        // Count assessments
        // ==============================

        const assessmentsRef = collection(db, "users", user.uid, "assessments");

        const assessmentsSnapshot = await getCountFromServer(assessmentsRef);

        setAssessmentCount(assessmentsSnapshot.data().count);

        // ==============================
        // Count appointments
        // ==============================

        const appointmentsRef = collection(
          db,
          "users",
          user.uid,
          "appointments",
        );

        const appointmentsSnapshot = await getCountFromServer(appointmentsRef);

        setAppointmentCount(appointmentsSnapshot.data().count);

        // ==============================
        // Count health records
        // ==============================

        const recordsRef = collection(db, "users", user.uid, "records");

        const recordsSnapshot = await getCountFromServer(recordsRef);

        setRecordCount(recordsSnapshot.data().count);
      } catch (error) {
        console.error("Unable to load dashboard data:", error);

        setError("We could not load your dashboard information.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ==============================
  // Loading state
  // ==============================

  if (loading) {
    return (
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading your health dashboard...
          </p>
        </div>
      </section>
    );
  }

  // ==============================
  // Dashboard UI
  // ==============================

  return (
    <section className="space-y-8">
      {/* ==============================
          Welcome section
      ============================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Personal Health Dashboard
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
          {profile?.fullName ? `, ${profile.fullName}` : ""}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep track of your health profile, assessments, appointments and
          medical records securely in one place.
        </p>
      </div>

      {/* ==============================
          Error state
      ============================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ==============================
          Overview cards
      ============================== */}
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Health profile"
        value={healthProfileComplete ? "Complete" : "Setup"}
        helper={
          healthProfileComplete
            ? "Your health profile is available"
            : "Complete your personal health details"
        }
        icon={Activity}
        href="/dashboard/profile"
      />

      <StatCard
        title="Assessments"
        value={assessmentCount.toString()}
        helper={
          assessmentCount === 0
            ? "No assessments recorded yet"
            : `${assessmentCount} assessment${
                assessmentCount === 1 ? "" : "s"
              } saved`
        }
        icon={ClipboardPlus}
        href="/dashboard/assessment"
      />

      <StatCard
        title="Appointments"
        value={appointmentCount.toString()}
        helper={
          appointmentCount === 0
            ? "No appointments recorded"
            : `${appointmentCount} appointment${
                appointmentCount === 1 ? "" : "s"
              } recorded`
        }
        icon={CalendarDays}
        href="/dashboard/appointments"
      />

      <StatCard
        title="Health records"
        value={recordCount.toString()}
        helper={
          recordCount === 0
            ? "No records saved yet"
            : `${recordCount} health record${
                recordCount === 1 ? "" : "s"
              } available`
        }
        icon={FileText}
        href="/dashboard/records"
      />
      </div>
      {/* ==============================
          Main dashboard grid
      ============================== */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent activity */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent health activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest assessments, records and health updates will appear
            here.
          </p>

          <div className="mt-8 flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
            <div className="text-center">
              <Activity className="mx-auto text-slate-400" size={28} />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No recent activity
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Start a health assessment or add a health record to begin
                building your health history.
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common actions for your health account.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard/profile"
              className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {healthProfileComplete
                ? "Update health profile"
                : "Complete health profile"}
            </Link>

            <Link
              href="/dashboard/assessment"
              className="block rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Start health assessment
            </Link>

            <Link
              href="/dashboard/records"
              className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View health records
            </Link>
          </div>
        </div>
      </div>

      {/* ==============================
          Medical notice
      ============================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Health information notice
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Nura Health helps you organize personal health information. It does
          not replace professional medical advice, diagnosis or emergency care.
        </p>
      </div>
    </section>
  );
}
