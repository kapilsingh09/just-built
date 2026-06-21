import { type ReactNode } from "react";

// ─── Container ────────────────────────────────────────────────────────────────
// Max-width wrapper with responsive horizontal padding.
// ──────────────────────────────────────────────────────────────────────────────

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container-main ${className}`}>
      {children}
    </div>
  );
}
