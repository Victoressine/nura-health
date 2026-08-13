"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MailCheck,
  MailWarning,
  RefreshCw,
  Send,
  Stethoscope,
  Trash2,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

// ==============================
// Types
// ==============================

type AppointmentStatus =
  | "pending_confirmation"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | string;

type Appointment = {
  id: string;

  reason: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;

  notes?: string;

  teamMemberId: string;
  teamMemberName?: string;
  teamMemberSpecialty?: string;

  status: AppointmentStatus;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  reviewedAt?: Timestamp | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;

  cancelledAt?: Timestamp | null;
  cancelledBy?: string | null;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  active: boolean;
};

// ==============================
// Status helper
// ==============================

function getAppointmentStatus(status: AppointmentStatus) {
  switch (status) {
    case "pending_confirmation":
      return {
        label: "Pending Confirmation",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "confirmed":
      return {
        label: "Confirmed",
        className: "border-green-200 bg-green-50 text-green-700",
      };

    case "rejected":
      return {
        label: "Rejected",
        className: "border-red-200 bg-red-50 text-red-700",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        className: "border-slate-200 bg-slate-100 text-slate-600",
      };

    // Old appointments created before
    // the approval workflow existed.
    case "scheduled":
      return {
        label: "Legacy Appointment",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };

    default:
      return {
        label: "Pending Confirmation",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

// ==============================
// Date helper
// ==============================

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==============================
// Appointments Page
// ==============================

export default function AppointmentsPage() {
  // ==============================
  // Booking form state
  // ==============================

  const [reason, setReason] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");

  const [appointmentTime, setAppointmentTime] = useState("");

  const [appointmentType, setAppointmentType] = useState("");

  const [notes, setNotes] = useState("");

  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");

  // ==============================
  // Data state
  // ==============================

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // ==============================
  // Verification state
  // ==============================

  const [userEmail, setUserEmail] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);

  const [checkingVerification, setCheckingVerification] = useState(false);

  const [sendingVerification, setSendingVerification] = useState(false);

  // ==============================
  // Page state
  // ==============================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // ==============================
  // Selected team member
  // ==============================

  const selectedTeamMember = useMemo(
    () =>
      teamMembers.find(
        (teamMember) => teamMember.id === selectedTeamMemberId,
      ) ?? null,
    [selectedTeamMemberId, teamMembers],
  );

  // ==============================
  // Load authentication,
  // appointments and team directory
  // ==============================

  useEffect(() => {
    let unsubscribeAppointments: (() => void) | undefined;

    let unsubscribeTeamDirectory: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Remove previous listeners
      unsubscribeAppointments?.();
      unsubscribeTeamDirectory?.();

      if (!user) {
        setUserEmail("");
        setEmailVerified(false);
        setAppointments([]);
        setTeamMembers([]);
        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");

      // ==============================
      // Authentication state
      // ==============================

      setUserEmail(user.email ?? "");

      setEmailVerified(user.emailVerified);

      // ==============================
      // Realtime appointments
      // ==============================

      const appointmentsRef = collection(db, "users", user.uid, "appointments");

      const appointmentsQuery = query(
        appointmentsRef,
        orderBy("createdAt", "desc"),
      );

      unsubscribeAppointments = onSnapshot(
        appointmentsQuery,

        (snapshot) => {
          const items: Appointment[] = snapshot.docs.map((document) => {
            const data = document.data();

            return {
              id: document.id,

              reason: typeof data.reason === "string" ? data.reason : "",

              appointmentDate:
                typeof data.appointmentDate === "string"
                  ? data.appointmentDate
                  : "",

              appointmentTime:
                typeof data.appointmentTime === "string"
                  ? data.appointmentTime
                  : "",

              appointmentType:
                typeof data.appointmentType === "string"
                  ? data.appointmentType
                  : "",

              notes: typeof data.notes === "string" ? data.notes : "",

              teamMemberId:
                typeof data.teamMemberId === "string" ? data.teamMemberId : "",

              teamMemberName:
                typeof data.teamMemberName === "string"
                  ? data.teamMemberName
                  : "",

              teamMemberSpecialty:
                typeof data.teamMemberSpecialty === "string"
                  ? data.teamMemberSpecialty
                  : "",

              status:
                typeof data.status === "string"
                  ? data.status
                  : "pending_confirmation",

              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt
                  : undefined,

              updatedAt:
                data.updatedAt instanceof Timestamp
                  ? data.updatedAt
                  : undefined,

              reviewedAt:
                data.reviewedAt instanceof Timestamp ? data.reviewedAt : null,

              reviewedBy:
                typeof data.reviewedBy === "string" ? data.reviewedBy : null,

              rejectionReason:
                typeof data.rejectionReason === "string"
                  ? data.rejectionReason
                  : null,

              cancelledAt:
                data.cancelledAt instanceof Timestamp ? data.cancelledAt : null,

              cancelledBy:
                typeof data.cancelledBy === "string" ? data.cancelledBy : null,
            };
          });

          setAppointments(items);

          setLoading(false);
        },

        (snapshotError) => {
          console.error("Unable to monitor appointments:", snapshotError);

          setError("We could not load your appointments.");

          setLoading(false);
        },
      );

      // ==============================
      // Active team directory
      // ==============================

      const teamDirectoryRef = collection(db, "teamDirectory");

      const teamDirectoryQuery = query(
        teamDirectoryRef,
        where("active", "==", true),
      );

      unsubscribeTeamDirectory = onSnapshot(
        teamDirectoryQuery,

        (snapshot) => {
          const directory: TeamMember[] = snapshot.docs.map((document) => {
            const data = document.data();

            return {
              id: document.id,

              name: typeof data.name === "string" ? data.name : "Medical Team",

              role: typeof data.role === "string" ? data.role : "",

              specialty:
                typeof data.specialty === "string" ? data.specialty : "",

              active: data.active === true,
            };
          });

          directory.sort((a, b) => a.name.localeCompare(b.name));

          setTeamMembers(directory);

          // Auto-select when
          // only one team exists.
          if (directory.length === 1) {
            setSelectedTeamMemberId((current) => current || directory[0].id);
          }
        },

        (snapshotError) => {
          console.error(
            "Unable to load medical team directory:",
            snapshotError,
          );

          setError("We could not load the medical team directory.");
        },
      );
    });

    // ==============================
    // Cleanup
    // ==============================

    return () => {
      unsubscribeAuth();
      unsubscribeAppointments?.();
      unsubscribeTeamDirectory?.();
    };
  }, []);

  // ==============================
  // Check verification
  // ==============================

  async function handleCheckVerification() {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");

      return;
    }

    setCheckingVerification(true);
    setSuccess("");
    setError("");

    try {
      await reload(user);

      const refreshedUser = auth.currentUser;

      if (refreshedUser?.emailVerified) {
        setEmailVerified(true);

        setSuccess(
          "Your email is verified. You can now request an appointment.",
        );

        return;
      }

      setEmailVerified(false);

      setError(
        "Your email is still not verified. Check your inbox, Spam, or Junk folder and open the verification link.",
      );
    } catch (verificationError) {
      console.error("Unable to check verification:", verificationError);

      setError("We could not check your email verification status.");
    } finally {
      setCheckingVerification(false);
    }
  }

  // ==============================
  // Resend verification email
  // ==============================

  async function handleResendVerification() {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");

      return;
    }

    if (user.emailVerified) {
      setEmailVerified(true);

      setSuccess("Your email is already verified.");

      return;
    }

    setSendingVerification(true);
    setSuccess("");
    setError("");

    try {
      await sendEmailVerification(user);

      setSuccess(
        `A verification email has been sent to ${
          user.email ?? "your email address"
        }. Please check your inbox. If you do not see it, check your Spam or Junk folder.`,
      );
    } catch (verificationError) {
      console.error("Unable to send verification email:", verificationError);

      setError("We could not send another verification email right now.");
    } finally {
      setSendingVerification(false);
    }
  }

  // ==============================
  // Submit appointment request
  // ==============================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");

      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      // ==============================
      // Refresh verification status
      // ==============================

      await reload(user);

      const refreshedUser = auth.currentUser;

      if (!refreshedUser?.emailVerified) {
        setEmailVerified(false);

        setError(
          "You must verify your email before requesting an appointment.",
        );

        return;
      }

      setEmailVerified(true);

      // ==============================
      // Validate team member
      // ==============================

      if (!selectedTeamMember) {
        setError("Please select a medical team.");

        return;
      }

      // ==============================
      // Validate reason
      // ==============================

      const cleanReason = reason.trim();

      if (!cleanReason) {
        setError("Please enter the reason for the appointment.");

        return;
      }

      // ==============================
      // Validate appointment type
      // ==============================

      if (!appointmentType) {
        setError("Please select an appointment type.");

        return;
      }

      // ==============================
      // Validate date
      // ==============================

      if (!appointmentDate) {
        setError("Please select an appointment date.");

        return;
      }

      // ==============================
      // Validate time
      // ==============================

      if (!appointmentTime) {
        setError("Please select an appointment time.");

        return;
      }

      // ==============================
      // Prevent past appointments
      // ==============================

      const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

      if (Number.isNaN(dateTime.getTime())) {
        setError("Please select a valid appointment date and time.");

        return;
      }

      if (dateTime.getTime() <= Date.now()) {
        setError("Please select a future appointment date and time.");

        return;
      }

      // ==============================
      // Appointment document
      // ==============================

      await addDoc(collection(db, "users", refreshedUser.uid, "appointments"), {
        // Patient appointment data
        reason: cleanReason,

        appointmentDate,
        appointmentTime,
        appointmentType,

        notes: notes.trim(),

        // ==============================
        // Medical team assignment
        // ==============================

        teamMemberId: selectedTeamMember.id,

        teamMemberName: selectedTeamMember.name,

        teamMemberSpecialty: selectedTeamMember.specialty,

        // ==============================
        // Approval workflow
        // ==============================

        status: "pending_confirmation",

        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,

        cancelledAt: null,
        cancelledBy: null,

        // ==============================
        // Timestamps
        // ==============================

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      // ==============================
      // Reset form
      // ==============================

      setReason("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentType("");
      setNotes("");

      // Keep selected medical team.

      setSuccess(
        "Your appointment request has been submitted and is pending confirmation from the medical team.",
      );

      // onSnapshot automatically
      // refreshes the list.
    } catch (saveError) {
      console.error("Unable to request appointment:", saveError);

      setError(
        "We could not submit your appointment request. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ==============================
  // Cancel appointment
  // ==============================

  async function handleCancel(appointment: Appointment) {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in.");

      return;
    }

    // Only statuses permitted by
    // the Firestore rules.
    if (
      appointment.status !== "pending_confirmation" &&
      appointment.status !== "confirmed"
    ) {
      setError("This appointment can no longer be cancelled.");

      return;
    }

    setCancellingId(appointment.id);

    setSuccess("");
    setError("");

    try {
      const appointmentRef = doc(
        db,
        "users",
        user.uid,
        "appointments",
        appointment.id,
      );

      await updateDoc(appointmentRef, {
        status: "cancelled",

        cancelledAt: serverTimestamp(),

        cancelledBy: user.uid,

        updatedAt: serverTimestamp(),
      });

      setSuccess("Your appointment has been cancelled.");

      // No manual state mutation.
      // onSnapshot receives the change.
    } catch (cancelError) {
      console.error("Unable to cancel appointment:", cancelError);

      setError("We could not cancel this appointment.");
    } finally {
      setCancellingId(null);
    }
  }

  // ==============================
  // Loading state
  // ==============================

  if (loading) {
    return (
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-blue-600" />

            <p className="text-sm text-slate-500">Loading appointments...</p>
          </div>
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
          Header
      ============================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">Appointments</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Manage appointments
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Request healthcare appointments and track their confirmation status.
        </p>
      </div>

      {/* ==============================
          Verification
      ============================== */}

      {emailVerified ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
          <MailCheck size={20} className="mt-0.5 shrink-0 text-green-700" />

          <div>
            <p className="text-sm font-semibold text-green-900">
              Email verified
            </p>

            <p className="mt-1 text-sm text-green-700">
              {userEmail} is verified. You can request appointments.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <MailWarning size={20} className="mt-0.5 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Email verification required
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                Verify {userEmail || "your email"} before requesting an
                appointment. If you cannot find the email, check Spam or Junk.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checkingVerification || sendingVerification}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {checkingVerification ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}

              {checkingVerification ? "Checking..." : "I verified my email"}
            </button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={sendingVerification || checkingVerification}
              className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 disabled:opacity-60"
            >
              {sendingVerification ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}

              {sendingVerification ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        </div>
      )}

      {/* ==============================
          Messages
      ============================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

          {success}
        </div>
      )}

      {/* ==============================
          Appointment Form
      ============================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Request appointment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Requests require confirmation from the selected medical team.
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
              emailVerified
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {emailVerified ? "Verified" : "Not Verified"}
          </span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Medical team */}

          <div>
            <label
              htmlFor="teamMember"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Doctor / Medical team
            </label>

            <select
              id="teamMember"
              required
              disabled={!emailVerified || saving}
              value={selectedTeamMemberId}
              onChange={(event) => setSelectedTeamMemberId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Select medical team</option>

              {teamMembers.map((teamMember) => (
                <option key={teamMember.id} value={teamMember.id}>
                  {teamMember.name}
                  {teamMember.specialty ? ` — ${teamMember.specialty}` : ""}
                </option>
              ))}
            </select>

            {teamMembers.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No active medical team is currently available.
              </p>
            )}
          </div>

          {/* Appointment type */}

          <div>
            <label
              htmlFor="appointmentType"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Appointment type
            </label>

            <select
              id="appointmentType"
              required
              disabled={!emailVerified || saving}
              value={appointmentType}
              onChange={(event) => setAppointmentType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Select type</option>

              <option value="general-consultation">General consultation</option>

              <option value="follow-up">Follow-up</option>

              <option value="specialist">Specialist</option>

              <option value="lab-test">Lab test</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Reason */}

          <div className="md:col-span-2">
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Reason
            </label>

            <input
              id="reason"
              type="text"
              required
              maxLength={150}
              disabled={!emailVerified || saving}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="Example: General check-up"
            />
          </div>

          {/* Date */}

          <div>
            <label
              htmlFor="appointmentDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred date
            </label>

            <input
              id="appointmentDate"
              type="date"
              required
              min={getTodayDate()}
              disabled={!emailVerified || saving}
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* Time */}

          <div>
            <label
              htmlFor="appointmentTime"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred time
            </label>

            <input
              id="appointmentTime"
              type="time"
              required
              disabled={!emailVerified || saving}
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Notes */}

        <div className="mt-5">
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="notes"
            rows={3}
            maxLength={500}
            disabled={!emailVerified || saving}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            placeholder="Optional notes about your appointment"
          />
        </div>

        {/* Submit */}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || !emailVerified || teamMembers.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}

            {!emailVerified
              ? "Verify email to request"
              : saving
                ? "Submitting request..."
                : "Request appointment"}
          </button>
        </div>
      </form>

      {/* ==============================
          Appointment List
      ============================== */}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Your appointments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your appointment requests and confirmation status.
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <CalendarDays size={32} className="mx-auto text-slate-400" />

            <h3 className="mt-4 font-semibold text-slate-900">
              No appointments yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your appointment requests will appear here.
            </p>
          </div>
        ) : (
          appointments.map((appointment) => {
            const status = getAppointmentStatus(appointment.status);

            const canCancel =
              appointment.status === "pending_confirmation" ||
              appointment.status === "confirmed";

            return (
              <article
                key={appointment.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    {/* Status */}

                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>

                    {/* Reason */}

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {appointment.reason}
                    </h3>

                    {/* Type */}

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {appointment.appointmentType.replaceAll("-", " ")}
                    </p>

                    {/* Team */}

                    {appointment.teamMemberName && (
                      <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                        <Stethoscope size={16} className="mt-0.5 shrink-0" />

                        <span>
                          {appointment.teamMemberName}

                          {appointment.teamMemberSpecialty
                            ? ` — ${appointment.teamMemberSpecialty}`
                            : ""}
                        </span>
                      </div>
                    )}

                    {/* Date/time */}

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={16} />

                        {appointment.appointmentDate}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock size={16} />

                        {appointment.appointmentTime}
                      </span>
                    </div>

                    {/* Notes */}

                    {appointment.notes && (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {appointment.notes}
                      </p>
                    )}

                    {/* Rejected reason */}

                    {appointment.status === "rejected" &&
                      appointment.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                          <p className="text-xs font-semibold text-red-700">
                            Rejection reason
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            {appointment.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Pending notice */}

                    {appointment.status === "pending_confirmation" && (
                      <p className="mt-4 text-xs leading-5 text-amber-700">
                        Your appointment request is waiting for confirmation
                        from the medical team.
                      </p>
                    )}
                  </div>

                  {/* Cancel */}

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appointment)}
                      disabled={cancellingId === appointment.id}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === appointment.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      {cancellingId === appointment.id
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ==============================
          Appointment Notice
      ============================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Appointment confirmation
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Submitting an appointment request does not mean it has been confirmed.
          New requests remain Pending Confirmation until reviewed by the medical
          team.
        </p>
      </div>
    </section>
  );
}
