"use client";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

export default function WorkspaceWelcome() {
  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated border-[rgb(99_102_241/0.22)] p-6 sm:p-8" glow>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ChroniAvatar size="lg" interactive />
          <div className="min-w-0 flex-1">
            <span className="badge badge-cyan">Chroni</span>
            <h1 className="page-heading mt-3">
              Welcome to Chronicle Playground
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Import your own organizational memory, or generate one instantly using
              the included Claude prompt, or simply explore the pre-loaded NovaTech
              sample.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
              Ask any question. Chronicle reasons only from the memories you provide.
            </p>
          </div>
        </div>
      </Card>
    </MotionDiv>
  );
}
