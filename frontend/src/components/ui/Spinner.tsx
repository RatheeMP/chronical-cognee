"use client";

import { Loader2 } from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import { MotionDiv, fadeIn, transition } from "@/components/ui/motion";

type SpinnerProps = {
  label?: string;
  size?: "sm" | "md";
  showChroni?: boolean;
};

export default function Spinner({
  label,
  size = "sm",
  showChroni = false,
}: SpinnerProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (showChroni) {
    return (
      <MotionDiv
        {...fadeIn}
        transition={transition}
        className="flex items-center gap-3"
      >
        <ChroniAvatar size="sm" interactive={false} />
        {label && (
          <span className="text-sm text-slate-400">{label}</span>
        )}
      </MotionDiv>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-400">
      <Loader2
        className={`${iconSize} animate-spin text-[#818CF8]`}
        aria-hidden
      />
      {label && <span>{label}</span>}
    </div>
  );
}
