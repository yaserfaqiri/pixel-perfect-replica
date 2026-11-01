import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";
import { formatHijri } from "@/lib/format";

export function TopNavbar({ name, roles, onMenu }: { name: string; roles: AppRole[]; onMenu: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="card-x sticky top-4 z-30 mx-4 mt-4 flex h-[66px] items-center gap-3 px-4 lg:mx-6">
      <button onClick={onMenu} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-primary hover:bg-accent lg:hidden" aria-label="منو">
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative hidden min-w-0 max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <input
          placeholder="جستجو..."
          className="h-10 w-full rounded-md bg-muted pr-9 pl-3 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div className="mr-auto flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground md:inline">{formatHijri(new Date())}</span>
        <button className="relative grid h-9 w-9 place-items-center rounded-md text-primary hover:bg-accent" aria-label="اطلاعیه‌ها">
          <Bell className="h-5 w-5" />
        </button>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden min-w-0 text-right sm:block">
              <div className="max-w-[140px] truncate text-sm font-semibold">{name}</div>
              <div className="text-[11px] text-success">{roles[0] ? ROLE_LABELS[roles[0]] : "بدون نقش"}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-right">{name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" /> خروج از سیستم
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
