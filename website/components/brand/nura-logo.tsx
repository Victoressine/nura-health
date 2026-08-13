// ==============================
// Imports
// ==============================

import Image from "next/image";

// ==============================
// Types
// ==============================

type NuraLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

// ==============================
// Nura Logo
// ==============================

export default function NuraLogo({
  size = 44,
  showText = true,
  className = "",
}: NuraLogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
    >
      <Image
        src="/nura-logo.webp"
        alt="Nura Health"
        width={size}
        height={size}
        priority
        className="rounded-xl object-contain"
      />

      {showText && (
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">
            Nura Health
          </p>

          <p className="text-xs text-slate-500">
            Personal Health
          </p>
        </div>
      )}
    </div>
  );
}