"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

// ==============================
// Options
// ==============================

const severityOptions = [
  {
    label: "Mild",
    value: "mild",
    description: "Noticeable but manageable",
  },
  {
    label: "Moderate",
    value: "moderate",
    description: "Affecting normal activities",
  },
  {
    label: "Severe",
    value: "severe",
    description: "Very difficult to manage",
  },
];

const bodyAreas = [
  "Head",
  "Neck",
  "Chest",
  "Abdomen",
  "Back",
  "Arms",
  "Hands",
  "Legs",
  "Feet",
  "Skin",
  "Whole body",
  "Other",
];

// ==============================
// Health Assessment Page
// ==============================

export default function HealthAssessmentPage() {
  // ==============================
  // Main assessment state
  // ==============================

  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("");
  const [bodyArea, setBodyArea] = useState("");
  const [customBodyArea, setCustomBodyArea] = useState("");
  const [duration, setDuration] = useState("");

  // ==============================
  // Safety screening state
  // ==============================

  const [difficultyBreathing, setDifficultyBreathing] =
    useState(false);

  const [chestPain, setChestPain] =
    useState(false);

  const [lossOfConsciousness, setLossOfConsciousness] =
    useState(false);

  const [heavyBleeding, setHeavyBleeding] =
    useState(false);

  const [otherSafetyConcern, setOtherSafetyConcern] =
    useState("");

  // ==============================
  // UI state
  // ==============================

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // Emergency state
  // ==============================

  const emergencyWarning = useMemo(() => {
    return (
      difficultyBreathing ||
      chestPain ||
      lossOfConsciousness ||
      heavyBleeding
    );
  }, [
    difficultyBreathing,
    chestPain,
    lossOfConsciousness,
    heavyBleeding,
  ]);

  // ==============================
  // Final body area
  // ==============================

  const finalBodyArea =
    bodyArea === "Other"
      ? customBodyArea.trim()
      : bodyArea;

  // ==============================
  // Form validation
  // ==============================

  function validateAssessment() {
    if (!symptoms.trim()) {
      return "Please describe your symptoms.";
    }

    if (symptoms.trim().length < 5) {
      return "Please provide a little more detail about your symptoms.";
    }

    if (!severity) {
      return "Please select a severity level.";
    }

    if (!bodyArea) {
      return "Please select the affected body area.";
    }

    if (
      bodyArea === "Other" &&
      !customBodyArea.trim()
    ) {
      return "Please describe the affected body area.";
    }

    return null;
  }

  // ==============================
  // Reset form
  // ==============================

  function resetForm() {
    setSymptoms("");
    setSeverity("");
    setBodyArea("");
    setCustomBodyArea("");
    setDuration("");

    setDifficultyBreathing(false);
    setChestPain(false);
    setLossOfConsciousness(false);
    setHeavyBleeding(false);

    setOtherSafetyConcern("");
  }

  // ==============================
  // Submit assessment
  // ==============================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setSuccess("");
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError(
        "You must be signed in to save an assessment."
      );
      return;
    }

    const validationError =
      validateAssessment();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // ==============================
      // Save assessment
      // ==============================

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "assessments"
        ),
        {
          // Main symptoms
          symptoms: symptoms.trim(),
          severity,
          bodyArea: finalBodyArea,
          duration: duration.trim(),

          // Safety screening
          emergencyFlags: {
            difficultyBreathing,
            chestPain,
            lossOfConsciousness,
            heavyBleeding,
          },

          // User-entered concern
          otherSafetyConcern:
            otherSafetyConcern.trim(),

          // Assessment state
          emergencyWarning,

          status: emergencyWarning
            ? "urgent-review"
            : "submitted",

          // Metadata
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      // ==============================
      // Success state
      // ==============================

      setSuccess(
        emergencyWarning
          ? "Assessment saved. Because you selected an emergency warning sign, please seek immediate professional medical care."
          : "Your health assessment has been saved successfully."
      );

      resetForm();
    } catch (error) {
      console.error(
        "Unable to save health assessment:",
        error
      );

      setError(
        "We could not save your assessment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // UI
  // ==============================

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* ==============================
          Page heading
      ============================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Health Assessment
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Tell us how you&apos;re feeling
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Record your current symptoms and basic
          health information. Your assessment will
          be saved securely to your Nura Health
          account.
        </p>
      </div>

      {/* ==============================
          Medical disclaimer
      ============================== */}

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-red-600"
            size={21}
          />

          <div>
            <p className="text-sm font-semibold text-red-900">
              Emergency warning
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              Nura Health does not provide emergency
              medical care. If your symptoms are
              severe, rapidly worsening, or you
              believe your condition may be
              life-threatening, seek immediate
              professional medical attention.
            </p>
          </div>
        </div>
      </div>

      {/* ==============================
          Assessment form
      ============================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ==============================
            Symptoms
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Symptoms
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Describe what you are currently
            experiencing in your own words.
          </p>

          <div className="mt-5">
            <label
              htmlFor="symptoms"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              How are you feeling?
            </label>

            <textarea
              id="symptoms"
              name="symptoms"
              rows={5}
              required
              maxLength={1500}
              value={symptoms}
              onChange={(event) =>
                setSymptoms(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              placeholder="Example: I have had a headache, fever, weakness and body aches since yesterday..."
            />

            <div className="mt-2 flex justify-between gap-4">
              <p className="text-xs text-slate-400">
                Include anything you think may be
                relevant.
              </p>

              <p className="shrink-0 text-xs text-slate-400">
                {symptoms.length}/1500
              </p>
            </div>
          </div>
        </div>

        {/* ==============================
            Severity
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Severity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            How much are these symptoms affecting
            you?
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {severityOptions.map((option) => {
              const selected =
                severity === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setSeverity(option.value)
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-blue-700"
                        : "text-slate-800"
                    }`}
                  >
                    {option.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==============================
            Symptom details
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Symptom details
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Body area */}

            <div>
              <label
                htmlFor="bodyArea"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Affected body area
              </label>

              <select
                id="bodyArea"
                name="bodyArea"
                required
                value={bodyArea}
                onChange={(event) => {
                  setBodyArea(event.target.value);

                  if (
                    event.target.value !== "Other"
                  ) {
                    setCustomBodyArea("");
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  Select body area
                </option>

                {bodyAreas.map((area) => (
                  <option
                    key={area}
                    value={area}
                  >
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}

            <div>
              <label
                htmlFor="duration"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                How long have you had these symptoms?
              </label>

              <input
                id="duration"
                name="duration"
                type="text"
                maxLength={100}
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="Example: 2 days"
              />
            </div>
          </div>

          {/* Custom body area */}

          {bodyArea === "Other" && (
            <div className="mt-5">
              <label
                htmlFor="customBodyArea"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Describe the affected area
              </label>

              <input
                id="customBodyArea"
                name="customBodyArea"
                type="text"
                maxLength={100}
                value={customBodyArea}
                onChange={(event) =>
                  setCustomBodyArea(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="Type the affected body area"
              />
            </div>
          )}
        </div>

        {/* ==============================
            Safety check
        ============================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Safety check
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select any warning signs you are
            currently experiencing. You can also
            describe another symptom or concern
            below.
          </p>

          <div className="mt-5 space-y-3">
            {/* Difficulty breathing */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={difficultyBreathing}
                onChange={(event) =>
                  setDifficultyBreathing(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm text-slate-700">
                Difficulty breathing
              </span>
            </label>

            {/* Chest pain */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={chestPain}
                onChange={(event) =>
                  setChestPain(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm text-slate-700">
                Severe or persistent chest pain
              </span>
            </label>

            {/* Loss of consciousness */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={lossOfConsciousness}
                onChange={(event) =>
                  setLossOfConsciousness(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm text-slate-700">
                Fainting or loss of consciousness
              </span>
            </label>

            {/* Heavy bleeding */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={heavyBleeding}
                onChange={(event) =>
                  setHeavyBleeding(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm text-slate-700">
                Heavy or uncontrolled bleeding
              </span>
            </label>
          </div>

          {/* ==============================
              Other safety concern
          ============================== */}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <label
              htmlFor="otherSafetyConcern"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Other symptom or concern
            </label>

            <p className="mb-3 text-xs leading-5 text-slate-500">
              If your concern is not listed above,
              describe it here in your own words.
            </p>

            <textarea
              id="otherSafetyConcern"
              name="otherSafetyConcern"
              rows={4}
              maxLength={500}
              value={otherSafetyConcern}
              onChange={(event) =>
                setOtherSafetyConcern(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              placeholder="Example: I feel unusually dizzy when I stand up, or I have a symptom that is not listed above..."
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {otherSafetyConcern.length}/500
            </p>
          </div>

          {/* ==============================
              Emergency alert
          ============================== */}

          {emergencyWarning && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-red-600"
                  size={19}
                />

                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Urgent medical attention may
                    be required.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    Please seek immediate
                    professional medical care
                    rather than waiting for
                    guidance from Nura Health.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==============================
            Success message
        ============================== */}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4"
          >
            <CheckCircle2
              className="mt-0.5 shrink-0 text-green-600"
              size={19}
            />

            <p className="text-sm leading-6 text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* ==============================
            Error message
        ============================== */}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-100 bg-red-50 p-4"
          >
            <p className="text-sm leading-6 text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ==============================
            Submit
        ============================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Saving this assessment does not send it
            to a doctor or emergency service.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {loading
              ? "Saving assessment..."
              : "Save assessment"}
          </button>
        </div>
      </form>
    </section>
  );
}