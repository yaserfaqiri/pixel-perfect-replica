import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string | undefined; actions?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-x", className)}>
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const tones = {
  primary: { bar: "bg-primary", soft: "bg-primary-soft text-primary" },
  warning: { bar: "bg-warning", soft: "bg-warning-soft text-warning" },
  success: { bar: "bg-success", soft: "bg-success-soft text-success" },
  danger: { bar: "bg-destructive", soft: "bg-destructive-soft text-destructive" },
} as const;

export function StatisticCard({ label, value, hint, icon: Icon, tone = "primary" }: {
  label: string; value: ReactNode; hint?: string; icon: LucideIcon; tone?: keyof typeof tones;
}) {
  const t = tones[tone];
  return (
    <div className="card-x flex items-stretch gap-4 p-5">
      <span className={cn("w-1 shrink-0 rounded-full", t.bar)} />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
        {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div className={cn("grid h-12 w-12 shrink-0 place-items-center self-center rounded-full", t.soft)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export function StatusBadge({ tone = "primary", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-flex rounded px-2 py-0.5 text-[11px] font-semibold", tones[tone].soft)}>{children}</span>;
}

export function EmptyState({ title, text, icon: Icon = Inbox }: { title: string; text?: string | undefined; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><Icon className="h-6 w-6" /></div>
      <div className="mt-3 font-semibold">{title}</div>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-primary">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
