// ==============================
// Imports
// ==============================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "http://localhost:3000";

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
  // Branding / Icons
  // ==============================

  icons: {
    icon: [
      {
        url: "/nura-logo.webp",
        type: "image/webp",
      },
    ],

    shortcut: [
      {
        url: "/nura-logo.webp",
        type: "image/webp",
      },
    ],
  },

  // ==============================
  // Search Metadata
  // ==============================

  keywords: [
    "Nura Health",
    "personal health",
    "health assessments",
    "appointments",
    "health records",
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

    url: "/",

    siteName: "Nura Health",

    title: "Nura Health",

    description:
      "A secure personal health workspace for assessments, appointments, health records, and AI-assisted health guidance.",

    images: [
      {
        url: "/nura-logo.webp",
        alt: "Nura Health logo",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}