import ChronicleDashboard from "@/components/ChronicleDashboard";
import DashboardNav from "@/components/ui/DashboardNav";

export default function DashboardPage() {
  return (
    <>
      <DashboardNav />
      <main className="min-h-screen bg-[rgb(8_7_20)] text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:py-12">
          <ChronicleDashboard />
        </div>
      </main>
    </>
  );
}
