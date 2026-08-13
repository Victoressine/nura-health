"use client";

// ==============================
// Imports
// ==============================

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

// ==============================
// Types
// ==============================

type Assessment = {
  id: string;
  symptoms: string;
  severity: string;
  bodyArea: string;
  duration: string;
  otherSafetyConcern?: string;
  emergencyWarning: boolean;
  status: string;
  createdAt?: Timestamp;
  emergencyFlags?: {
    difficultyBreathing?: boolean;
    chestPain?: boolean;
    lossOfConsciousness?: boolean;
    heavyBleeding?: boolean;
  };
};

// ==============================
// Helpers
// ==============================

function formatDate(timestamp?: Timestamp) {
  if (!timestamp) {
    return "Date unavailable";
  }

  return timestamp.toDate().toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityLabel(severity: string) {
  switch (severity) {
    case "mild":
      return "Mild";
    case "moderate":
      return "Moderate";
    case "severe":
      return "Severe";
    default:
      return severity;
  }
}

// ==============================
// Health Records Page
// ==============================

export default function HealthRecordsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // Load assessments
  // ==============================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        const assessmentsRef = collection(
          db,
          "users",
          user.uid,
          "assessments"
        );

        const assessmentsQuery = query(
          assessmentsRef,
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(assessmentsQuery);

        const items: Assessment[] = snapshot.docs.map((document) => ({
          id: document.id,
          ...(document.data() as Omit<Assessment, "id">),
        }));

        setAssessments(items);
      } catch (error) {
        console.error("Unable to load assessments:", error);

        setError(
          "We could not load your assessment history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ==============================
  // Loading
  // ==============================

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading your health records...
          </p>
        </div>
      </section>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* ==============================
          Heading
      ============================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Health Records
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Your health history
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review your previous health assessments and saved health information.
        </p>
      </div>

      {/* ==============================
          Error
      ============================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ==============================
          Empty state
      ============================== */}

      {!error && assessments.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <ClipboardPlus
            className="mx-auto text-slate-400"
            size={32}
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No assessments yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your completed health assessments will appear here.
          </p>
        </div>
      )}

      {/* ==============================
          Assessment list
      ============================== */}

      <div className="space-y-4">
        {assessments.map((assessment) => {
          const expanded = expandedId === assessment.id;

          return (
            <article
              key={assessment.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* ==============================
                  Summary
              ============================== */}

              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {severityLabel(assessment.severity)}
                      </span>

                      {assessment.emergencyWarning && (
                        <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          <AlertTriangle size={13} />
                          Urgent
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                      {assessment.symptoms}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span>
                        Body area: {assessment.bodyArea || "Not provided"}
                      </span>

                      <span>
                        Duration: {assessment.duration || "Not provided"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      {formatDate(assessment.createdAt)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expanded ? null : assessment.id)
                    }
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {expanded ? "Hide details" : "View details"}

                    {expanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* ==============================
                  Expanded details
              ============================== */}

              {expanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Symptoms
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {assessment.symptoms}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Severity
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {severityLabel(assessment.severity)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Body area
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {assessment.bodyArea || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Duration
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {assessment.duration || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {assessment.otherSafetyConcern && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Other concern
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {assessment.otherSafetyConcern}
                      </p>
                    </div>
                  )}

                  {/* ==============================
                      Safety flags
                  ============================== */}

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Safety screening
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p className="text-sm text-slate-700">
                        Difficulty breathing:{" "}
                        {assessment.emergencyFlags?.difficultyBreathing
                          ? "Yes"
                          : "No"}
                      </p>

                      <p className="text-sm text-slate-700">
                        Chest pain:{" "}
                        {assessment.emergencyFlags?.chestPain
                          ? "Yes"
                          : "No"}
                      </p>

                      <p className="text-sm text-slate-700">
                        Loss of consciousness:{" "}
                        {assessment.emergencyFlags?.lossOfConsciousness
                          ? "Yes"
                          : "No"}
                      </p>

                      <p className="text-sm text-slate-700">
                        Heavy bleeding:{" "}
                        {assessment.emergencyFlags?.heavyBleeding
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                  </div>

                  {/* ==============================
                      Status
                  ============================== */}

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="text-sm text-slate-500">
                      Status:{" "}
                      <span className="font-medium text-slate-700">
                        {assessment.status === "urgent-review"
                          ? "Urgent review"
                          : "Submitted"}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ==============================
          Medical notice
      ============================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          About your assessment history
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          These records show information you entered into Nura Health. They are
          not a diagnosis or a replacement for a clinician&apos;s medical
          record.
        </p>
      </div>
    </section>
  );
}