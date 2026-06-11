import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
  children: ReactNode;
};

const VARIANT_CLASSES = {
  primary: "btn btn-primary btn-sweep bg-astra-red",
  ghost: "btn btn-ghost border border-white/30 backdrop-blur"
} as const;

/**
 * Shared CTA link. Adds only the hover behaviour layer; each call site keeps
 * its approved text styling (size, tracking, padding) via className.
 * Put `btn-icon` on a trailing arrow icon to get the hover nudge.
 */
export function CtaLink({ href, variant = "primary", className = "", children }: Props) {
  return (
    <Link
      href={href}
      className={`${VARIANT_CLASSES[variant]} inline-flex items-center justify-center gap-2 rounded text-white ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
