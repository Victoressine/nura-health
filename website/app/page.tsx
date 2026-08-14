// ==============================
// Imports
// ==============================

import Link from "next/link";

import {
  Activity,
  Bot,
  CalendarDays,
  ClipboardPlus,
  FileText,
  ShieldCheck,
} from "lucide-react";

import NuraLogo from "@/components/brand/nura-logo";

// ==============================
// Home Page
// ==============================

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ==============================
          Header
      ============================== */}

      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Nura Health home"
          >
            <NuraLogo />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ==============================
          Hero
      ============================== */}

      <section className="bg-gradient-to-b from-blue-50/70 to-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              <ShieldCheck
                size={15}
                aria-hidden="true"
              />

              Your personal health workspace
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Understand and manage your health with
              <span className="text-blue-600">
                {" "}
                Nura Health
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Keep your health information organized, complete guided
              assessments, manage appointments and records, and get general
              health guidance from Nura AI.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Create your account
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Nura Health provides health information and personal
              health-management tools. It does not replace professional
              medical advice, diagnosis, treatment, or emergency care.
            </p>
          </div>

          {/* ==============================
              Product Preview
          ============================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
              <p className="text-sm font-semibold text-blue-600">
                Personal Health Dashboard
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Your health, organized in one place.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Securely keep track of the health information that matters
                to you.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <FeatureCard
                  icon={Activity}
                  title="Health profile"
                  description="Keep important health information organized."
                />

                <FeatureCard
                  icon={ClipboardPlus}
                  title="Assessments"
                  description="Record and review guided health assessments."
                />

                <FeatureCard
                  icon={CalendarDays}
                  title="Appointments"
                  description="Keep your appointments easy to access."
                />

                <FeatureCard
                  icon={FileText}
                  title="Health records"
                  description="Maintain your personal health history."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          Features
      ============================== */}

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Built around your health journey
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Simple tools for managing your personal health information
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Nura Health brings your core health-management tools into a
              secure and easy-to-use workspace.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <InfoCard
              icon={Bot}
              title="Nura AI"
              description="Ask general health questions and receive cautious, easy-to-understand health information."
            />

            <InfoCard
              icon={ClipboardPlus}
              title="Health assessments"
              description="Record symptoms and important health context through guided assessments."
            />

            <InfoCard
              icon={ShieldCheck}
              title="Private workspace"
              description="Your personal dashboard and health information are protected behind your authenticated account."
            />
          </div>
        </div>
      </section>

      {/* ==============================
          CTA
      ============================== */}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Start managing your health information today.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Create your Nura Health account and access your personal
                health dashboard.
              </p>
            </div>

            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* ==============================
          Footer
      ============================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Nura Health.
          </p>

          <p>
            General health information only — not a substitute for
            professional medical care.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ==============================
// Feature Card
// ==============================

type FeatureCardProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?:
      | boolean
      | "true"
      | "false";
  }>;
  title: string;
  description: string;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon
          size={18}
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ==============================
// Information Card
// ==============================

type InfoCardProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?:
      | boolean
      | "true"
      | "false";
  }>;
  title: string;
  description: string;
};

function InfoCard({
  icon: Icon,
  title,
  description,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon
          size={21}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}