import { Link, useRouterState } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { canAccess, type AppRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function MedicalSidebar({ roles, open, onNavigate }: { roles: AppRole[]; open: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-[260px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-[74px] shrink-0 items-center gap-3 px-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
          <Eye className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold">الشفاء</div>
          <div className="truncate text-[11px] text-sidebar-muted">شفاخانه تخصصی چشم</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => canAccess(roles, i.roles));
          if (!items.length) return null;
          return (
            <div key={group.label} className="mt-4">
              <div className="mb-2 px-2 text-[11px] font-semibold tracking-wide text-sidebar-muted">{group.label}</div>
              <ul className="space-y-1">
                {items.map((item) => {
                  const href = `/${item.key}`;
                  const active = path === href;
                  return (
                    <li key={item.key}>
                      <Link
                        to="/$module"
                        params={{ module: item.key }}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-active)]"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
