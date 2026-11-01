import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MedicalSidebar } from "@/components/layout/MedicalSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LoadingState, EmptyState } from "@/components/medical/ui";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppShell,
});

function AppShell() {
  const { data: me, isLoading } = useCurrentUser();
  const [open, setOpen] = useState(false);

  if (isLoading || !me) return <LoadingState />;

  return (
    <div className="min-h-screen">
      <MedicalSidebar roles={me.roles} open={open} onNavigate={() => setOpen(false)} />
      {open && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:mr-[260px]">
        <TopNavbar name={me.fullName} roles={me.roles} onMenu={() => setOpen(true)} />
        <main className="p-4 lg:p-6">
          {me.roles.length === 0 ? (
            <div className="card-x">
              <EmptyState icon={ShieldAlert} title="هنوز نقشی برای شما تعیین نشده" text="لطفاً از مدیر سیستم بخواهید دسترسی شما را فعال کند." />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
