import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, LoadingState, PageHeader } from "@/components/medical/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "تنظیمات — شفاخانه چشم الشفاء" }, { name: "description", content: "تنظیمات عمومی شفاخانه" }, { property: "og:title", content: "تنظیمات" }, { property: "og:description", content: "تنظیمات عمومی شفاخانه" }] }),
  component: SettingsPage,
});

const FIELDS = [
  { k: "name_fa", label: "نام شفاخانه (دری)" },
  { k: "name_en", label: "نام شفاخانه (انگلیسی)", ltr: true },
  { k: "address", label: "آدرس" },
  { k: "phone", label: "شماره تماس", ltr: true, placeholder: "+93 7X XXX XXXX" },
  { k: "email", label: "ایمیل", ltr: true },
  { k: "logo_url", label: "لینک لوگو", ltr: true },
] as const;

function SettingsPage() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["hospital-settings"],
    queryFn: async () => (await supabase.from("hospital_settings").select("*").eq("id", 1).single()).data,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data) setForm(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? "" : String(v)])));
  }, [data]);

  if (!me?.roles.includes("admin")) return <Card><EmptyState title="دسترسی ندارید" /></Card>;
  if (isLoading) return <LoadingState />;

  async function save(e: FormEvent): Promise<void> {
    e.preventDefault();
    const rate = Number((form["usd_rate"] ?? ""));
    if (!(form["name_fa"] ?? "")?.trim()) return void toast.error("نام شفاخانه الزامی است");
    if (!(rate > 0)) return void toast.error("نرخ دالر باید بیشتر از صفر باشد");
    setBusy(true);
    const { error } = await supabase.from("hospital_settings").update({
      name_fa: (form["name_fa"] ?? "").trim(), name_en: (form["name_en"] ?? "").trim(), address: (form["address"] ?? "") || null, phone: (form["phone"] ?? "") || null,
      email: (form["email"] ?? "") || null, logo_url: (form["logo_url"] ?? "") || null, usd_rate: rate, updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setBusy(false);
    if (error) return void toast.error("ذخیره ناموفق بود");
    toast.success("تنظیمات ذخیره شد");
    qc.invalidateQueries({ queryKey: ["hospital-settings"] });
  }

  return (
    <div>
      <PageHeader title="تنظیمات" subtitle="معلومات عمومی شفاخانه و ارز" />
      <form onSubmit={save} className="grid gap-5 xl:grid-cols-3">
        <Card title="معلومات شفاخانه" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.k} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input dir={"ltr" in f ? "ltr" : undefined} placeholder={"placeholder" in f ? f.placeholder : undefined} value={form[f.k] ?? ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="ارز">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>ارز پیش‌فرض</Label><Input value="افغانی (AFN)" disabled /></div>
            <div className="space-y-1.5">
              <Label>نرخ یک دالر به افغانی</Label>
              <Input type="number" step="0.01" dir="ltr" value={(form["usd_rate"] ?? "") ?? ""} onChange={(e) => setForm({ ...form, usd_rate: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>ذخیره تنظیمات</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
