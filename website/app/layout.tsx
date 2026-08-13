// ==============================
// Imports
// ==============================

import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

// ==============================
// Fonts
// ==============================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ==============================
// Site Configuration
// ==============================

function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

const siteUrl = getSiteUrl();

// ==============================
// Metadata
// ==============================

export const metadata: Metadata = {
  // ==============================
  // Metadata Base
  // ==============================

  metadataBase: new URL(siteUrl),

  // ==============================
  // Core Metadata
  // ==============================

  title: {
    default: "Nura Health",
    template: "%s | Nura Health",
  },

  description:
    "Nura Health is a secure personal health workspace for managing health profiles, assessments, appointments, health records, and AI-assisted health guidance.",

  applicationName: "Nura Health",

  // ==============================
  // Branding
  // ==============================

  icons: {
    icon: [
      {
        url: "/nura-logo.webp",
        type: "image/webp",
      },
    ],

    shortcut: "/nura-logo.webp",

    apple: [
      {
        url: "/nura-logo.webp",
      },
    ],
  },

  // ==============================
  // Search Metadata
  // ==============================

  keywords: [
    "Nura Health",
    "personal health",
    "health assessment",
    "health records",
    "medical appointments",
    "AI health assistant",
    "health management",
  ],

  authors: [
    {
      name: "Nura Health",
    },
  ],

  creator: "Nura Health",
  publisher: "Nura Health",

  // ==============================
  // Robots
  // ==============================

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // ==============================
  // Open Graph
  // ==============================

  openGraph: {
    type: "website",

    url: siteUrl,

    siteName: "Nura Health",

    title: "Nura Health",

    description:
      "A secure personal health workspace for assessments, appointments, health records, and AI-assisted health guidance.",

    images: [
      {
        url: "/nura-logo.webp",
        alt: "Nura Health",
      },
    ],
  },

  // ==============================
  // Twitter / Social Preview
  // ==============================

  twitter: {
    card: "summary",

    title: "Nura Health",

    description:
      "A secure personal health workspace for managing your personal health information.",

    images: [
      "/nura-logo.webp",
    ],
  },

  // ==============================
  // Additional Metadata
  // ==============================

  category: "health",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// ==============================
// Viewport
// ==============================

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: "#ffffff",
};

// ==============================
// Root Layout
// ==============================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}