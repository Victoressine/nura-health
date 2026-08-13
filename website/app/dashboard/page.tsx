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
  getDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import {
  Activity,
  CalendarDays,
  ClipboardPlus,
  FileText,
} from "lucide-react";

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

type Assessment = {
  id: string;
  symptoms: string;
  severity: string;
  createdAt?: Timestamp;
};

type Appointment = {
  id: string;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status?: string;
};

// ==============================
// Date helpers
// ==============================

function formatAssessmentDate(timestamp?: Timestamp) {
  if (!timestamp) {
    return "Date unavailable";
  }

  return timestamp.toDate().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAppointmentDate(date: string) {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==============================
// Dashboard Page
// ==============================

export default function DashboardPage() {
  // ==============================
  // State
  // ==============================

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [
    healthProfileComplete,
    setHealthProfileComplete,
  ] = useState(false);

  const [assessmentCount, setAssessmentCount] =
    useState(0);

  const [appointmentCount, setAppointmentCount] =
    useState(0);

  const [recordCount, setRecordCount] =
    useState(0);

  const [latestAssessment, setLatestAssessment] =
    useState<Assessment | null>(null);

  const [nextAppointment, setNextAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==============================
  // Load dashboard data
  // ==============================

  useEffect(() => {
    let unsubscribeHealthProfile:
      | (() => void)
      | undefined;

    let unsubscribeAssessments:
      | (() => void)
      | undefined;

    let unsubscribeAppointments:
      | (() => void)
      | undefined;

    // ==============================
    // Monitor authentication
    // ==============================

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        // Remove old Firestore listeners
        unsubscribeHealthProfile?.();
        unsubscribeAssessments?.();
        unsubscribeAppointments?.();

        if (!user) {
          setProfile(null);
          setHealthProfileComplete(false);
          setAssessmentCount(0);
          setAppointmentCount(0);
          setRecordCount(0);
          setLatestAssessment(null);
          setNextAppointment(null);
          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          // ==============================
          // Load main user profile
          // ==============================

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const userSnapshot =
            await getDoc(userRef);

          if (userSnapshot.exists()) {
            const data = userSnapshot.data();

            setProfile({
              fullName:
                typeof data.fullName === "string"
                  ? data.fullName
                  : "",
              email:
                typeof data.email === "string"
                  ? data.email
                  : user.email ?? "",
              role:
                typeof data.role === "string"
                  ? data.role
                  : "patient",
            });
          } else {
            setProfile({
              fullName: user.displayName ?? "",
              email: user.email ?? "",
              role: "patient",
            });
          }

          // ==============================
          // Monitor health profile
          // ==============================

          const healthProfileRef = doc(
            db,
            "users",
            user.uid,
            "healthProfile",
            "profile"
          );

          unsubscribeHealthProfile =
            onSnapshot(
              healthProfileRef,
              (snapshot) => {
                setHealthProfileComplete(
                  snapshot.exists()
                );
              },
              (snapshotError) => {
                console.error(
                  "Unable to load health profile:",
                  snapshotError
                );
              }
            );

          // ==============================
          // Monitor assessments
          // ==============================

          const assessmentsRef = collection(
            db,
            "users",
            user.uid,
            "assessments"
          );

          unsubscribeAssessments =
            onSnapshot(
              assessmentsRef,
              (snapshot) => {
                // ==============================
                // Count assessments
                // ==============================

                setAssessmentCount(
                  snapshot.size
                );

                // Health Records currently
                // represents assessment history.
                setRecordCount(snapshot.size);

                // ==============================
                // No assessments
                // ==============================

                if (snapshot.empty) {
                  setLatestAssessment(null);
                  return;
                }

                // ==============================
                // Convert assessment documents
                // ==============================

                const assessments: Assessment[] =
                  snapshot.docs.map(
                    (document) => {
                      const data =
                        document.data();

                      return {
                        id: document.id,

                        symptoms:
                          typeof data.symptoms ===
                          "string"
                            ? data.symptoms
                            : "",

                        severity:
                          typeof data.severity ===
                          "string"
                            ? data.severity
                            : "",

                        createdAt:
                          data.createdAt instanceof
                          Timestamp
                            ? data.createdAt
                            : undefined,
                      };
                    }
                  );

                // ==============================
                // Sort newest assessment first
                // ==============================

                assessments.sort((a, b) => {
                  const aTime =
                    a.createdAt
                      ?.toMillis() ?? 0;

                  const bTime =
                    b.createdAt
                      ?.toMillis() ?? 0;

                  return bTime - aTime;
                });

                // ==============================
                // Set latest assessment
                // ==============================

                setLatestAssessment(
                  assessments[0] ?? null
                );
              },
              (snapshotError) => {
                console.error(
                  "Unable to load assessments:",
                  snapshotError
                );

                setError(
                  "We could not load your assessments."
                );
              }
            );

          // ==============================
          // Monitor appointments
          // ==============================

          const appointmentsRef =
            collection(
              db,
              "users",
              user.uid,
              "appointments"
            );

          unsubscribeAppointments =
            onSnapshot(
              appointmentsRef,
              (snapshot) => {
                // ==============================
                // Appointment count
                // ==============================

                setAppointmentCount(
                  snapshot.size
                );

                // ==============================
                // Convert appointment documents
                // ==============================

                const appointments: Appointment[] =
                  snapshot.docs.map(
                    (document) => {
                      const data =
                        document.data();

                      return {
                        id: document.id,

                        reason:
                          typeof data.reason ===
                          "string"
                            ? data.reason
                            : "",

                        appointmentDate:
                          typeof data.appointmentDate ===
                          "string"
                            ? data.appointmentDate
                            : "",

                        appointmentTime:
                          typeof data.appointmentTime ===
                          "string"
                            ? data.appointmentTime
                            : "",

                        appointmentType:
                          typeof data.appointmentType ===
                          "string"
                            ? data.appointmentType
                            : "",

                        status:
                          typeof data.status ===
                          "string"
                            ? data.status
                            : "",
                      };
                    }
                  );

                // ==============================
                // Current date and time
                // ==============================

                const now = new Date();

                // ==============================
                // Find upcoming appointments
                // ==============================

                const upcoming =
                  appointments
                    .filter(
                      (appointment) => {
                        if (
                          !appointment.appointmentDate
                        ) {
                          return false;
                        }

                        const dateTime =
                          new Date(
                            `${
                              appointment.appointmentDate
                            }T${
                              appointment.appointmentTime ||
                              "23:59"
                            }`
                          );

                        if (
                          Number.isNaN(
                            dateTime.getTime()
                          )
                        ) {
                          return false;
                        }

                        const status =
                          appointment.status
                            ?.trim()
                            .toLowerCase();

                        // Do not show cancelled
                        // or completed appointments
                        if (
                          status ===
                            "cancelled" ||
                          status ===
                            "canceled" ||
                          status ===
                            "completed"
                        ) {
                          return false;
                        }

                        return dateTime >= now;
                      }
                    )
                    .sort((a, b) => {
                      const aDate =
                        new Date(
                          `${
                            a.appointmentDate
                          }T${
                            a.appointmentTime ||
                            "23:59"
                          }`
                        ).getTime();

                      const bDate =
                        new Date(
                          `${
                            b.appointmentDate
                          }T${
                            b.appointmentTime ||
                            "23:59"
                          }`
                        ).getTime();

                      return aDate - bDate;
                    });

                // ==============================
                // Set nearest appointment
                // ==============================

                setNextAppointment(
                  upcoming[0] ?? null
                );
              },
              (snapshotError) => {
                console.error(
                  "Unable to load appointments:",
                  snapshotError
                );

                setError(
                  "We could not load your appointments."
                );
              }
            );
        } catch (loadError) {
          console.error(
            "Unable to load dashboard:",
            loadError
          );

          setError(
            "We could not load your dashboard information."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    // ==============================
    // Cleanup
    // ==============================

    return () => {
      unsubscribeAuth();
      unsubscribeHealthProfile?.();
      unsubscribeAssessments?.();
      unsubscribeAppointments?.();
    };
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
          Welcome
      ============================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Personal Health Dashboard
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
          {profile?.fullName
            ? `, ${profile.fullName}`
            : ""}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep track of your health information,
          assessments, appointments and medical
          records securely in one place.
        </p>
      </div>

      {/* ==============================
          Error
      ============================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ==============================
          Dashboard Stats
      ============================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Health profile"
          value={
            healthProfileComplete
              ? "Complete"
              : "Setup"
          }
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
                  assessmentCount === 1
                    ? ""
                    : "s"
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
                  appointmentCount === 1
                    ? ""
                    : "s"
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
                  recordCount === 1
                    ? ""
                    : "s"
                } available`
          }
          icon={FileText}
          href="/dashboard/records"
        />
      </div>

      {/* ==============================
          Main Dashboard Content
      ============================== */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ==============================
            Recent Health Activity
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent health activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest assessment and next
            appointment.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* ==============================
                Latest Assessment
            ============================== */}

            <Link
              href="/dashboard/records"
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <ClipboardPlus size={18} />

                <p className="text-sm font-semibold">
                  Latest assessment
                </p>
              </div>

              {latestAssessment ? (
                <>
                  <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-slate-800">
                    {latestAssessment.symptoms ||
                      "Assessment saved"}
                  </p>

                  {latestAssessment.severity && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {
                          latestAssessment.severity
                        }
                      </span>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    {formatAssessmentDate(
                      latestAssessment.createdAt
                    )}
                  </p>

                  <p className="mt-4 text-xs font-semibold text-blue-600">
                    View assessment →
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm text-slate-500">
                    No assessment recorded yet.
                  </p>

                  <p className="mt-4 text-xs font-semibold text-blue-600">
                    Start assessment →
                  </p>
                </>
              )}
            </Link>

            {/* ==============================
                Next Appointment
            ============================== */}

            <Link
              href="/dashboard/appointments"
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <CalendarDays size={18} />

                <p className="text-sm font-semibold">
                  Next appointment
                </p>
              </div>

              {nextAppointment ? (
                <>
                  <p className="mt-4 text-sm font-medium leading-6 text-slate-800">
                    {nextAppointment.reason ||
                      "Health appointment"}
                  </p>

                  {nextAppointment.appointmentType && (
                    <p className="mt-2 text-xs capitalize text-slate-500">
                      {nextAppointment.appointmentType.replaceAll(
                        "-",
                        " "
                      )}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    {formatAppointmentDate(
                      nextAppointment.appointmentDate
                    )}

                    {nextAppointment.appointmentTime
                      ? ` • ${nextAppointment.appointmentTime}`
                      : ""}
                  </p>

                  <p className="mt-4 text-xs font-semibold text-blue-600">
                    View appointment →
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm text-slate-500">
                    No upcoming appointment.
                  </p>

                  <p className="mt-4 text-xs font-semibold text-blue-600">
                    Add appointment →
                  </p>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* ==============================
            Quick Actions
        ============================== */}

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
              href="/dashboard/appointments"
              className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Manage appointments
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
          Health Information Notice
      ============================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Health information notice
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Nura Health helps you organise personal
          health information. It does not replace
          professional medical advice, diagnosis or
          emergency care.
        </p>
      </div>
    </section>
  );
}