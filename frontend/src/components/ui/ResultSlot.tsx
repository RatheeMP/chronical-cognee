import type { ReactNode } from "react";

type ResultSlotProps = {
  minHeight?: number;
  children: ReactNode;
};

/** Reserves vertical space so loading → result transitions don't shift layout during recording. */
export default function ResultSlot({ minHeight = 0, children }: ResultSlotProps) {
  return (
    <div
      className="animate-reveal"
      style={minHeight > 0 ? { minHeight: `${minHeight}px` } : undefined}
    >
      {children}
    </div>
  );
}
