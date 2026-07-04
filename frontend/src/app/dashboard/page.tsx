import ChronicleDashboard from "@/components/ChronicleDashboard";
import DashboardNav from "@/components/ui/DashboardNav";

export default function DashboardPage() {
  return (
    <>
      <DashboardNav />
      <main className="min-h-screen text-slate-100">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <ChronicleDashboard />
        </div>
      </main>
    </>
  );
}
