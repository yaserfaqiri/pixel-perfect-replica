import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarClock, Wallet, Scissors, UserCog, Building2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, PageHeader, StatisticCard } from "@/components/medical/ui";
import { formatAFN, formatHijriShort, formatNumber } from "@/lib/format";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "داشبورد — شفاخانه چشم الشفاء" },
      { name: "description", content: "نمای کلی فعالیت روزانه شفاخانه" },
      { property: "og:title", content: "داشبورد شفاخانه" },
      { property: "og:description", content: "نمای کلی فعالیت روزانه شفاخانه" },
    ],
  }),
  component: Dashboard,
});

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: formatHijriShort(d), patients: 0, revenue: 0 };
  });
}

function Dashboard() {
  const { data: me } = useCurrentUser();
  const { data: counts } = useQuery({
    queryKey: ["dash-counts"],
    queryFn: async () => {
      const [staff, branches] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("branches").select("id", { count: "exact", head: true }),
      ]);
      return { staff: staff.count ?? 0, branches: branches.count ?? 0 };
    },
  });
  const data = last7Days();

  return (
    <div>
      <PageHeader title={`خوش آمدید، ${me?.fullName ?? ""}`} subtitle="نمای کلی امروز شفاخانه" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard label="مریضان امروز" value={formatNumber(0)} hint="از ماژول پذیرش" icon={Users} />
        <StatisticCard label="نوبت‌های امروز" value={formatNumber(0)} hint="در انتظار و تکمیل‌شده" icon={CalendarClock} tone="warning" />
        <StatisticCard label="درآمد امروز" value={formatAFN(0)} hint="مجموع پرداخت‌ها" icon={Wallet} tone="success" />
        <StatisticCard label="عملیات‌های امروز" value={formatNumber(0)} hint="برنامه‌ریزی‌شده" icon={Scissors} tone="danger" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card title="جریان مریضان (۷ روز گذشته)" className="xl:col-span-2">
          <div className="h-[280px]" dir="ltr">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="patients" name="مریضان" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="صف امروز">
          <EmptyState title="صف خالی است" text="بعد از فعال شدن پذیرش، مریضان در انتظار اینجا نمایش داده می‌شوند." />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card title="درآمد (۷ روز گذشته)" className="xl:col-span-2">
          <div className="h-[240px]" dir="ltr">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip />
                <Bar dataKey="revenue" name="درآمد" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid gap-5">
          <StatisticCard label="کارمندان فعال" value={formatNumber(counts?.staff ?? 0)} icon={UserCog} />
          <StatisticCard label="شعبه‌ها" value={formatNumber(counts?.branches ?? 0)} icon={Building2} tone="success" />
        </div>
      </div>
    </div>
  );
}
