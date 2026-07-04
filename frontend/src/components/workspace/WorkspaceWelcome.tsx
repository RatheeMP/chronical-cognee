"use client";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

export default function WorkspaceWelcome() {
  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated border-[rgb(99_102_241/0.2)] p-6 sm:p-8" glow>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ChroniAvatar size="lg" interactive={false} />
          <div className="min-w-0 flex-1">
            <span className="badge badge-cyan">Chroni</span>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
              Welcome to Chronicle Playground
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Import organizational memory or load the NovaTech sample. Ask any
              question. Chronicle reasons only from the memories you provide.
            </p>
          </div>
        </div>
      </Card>
    </MotionDiv>
  );
}
