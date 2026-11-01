import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { createStaff, listStaff, updateStaff } from "@/lib/staff.functions";
import { ALL_ROLES, ROLE_LABELS, type AppRole } from "@/lib/roles";
import { Card, EmptyState, LoadingState, PageHeader, StatusBadge } from "@/components/medical/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatHijri } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({ meta: [{ title: "کارمندان — شفاخانه چشم الشفاء" }, { name: "description", content: "مدیریت کارمندان و دسترسی‌ها" }, { property: "og:title", content: "کارمندان" }, { property: "og:description", content: "مدیریت کارمندان و دسترسی‌ها" }] }),
  component: StaffPage,
});

type Staff = Awaited<ReturnType<typeof listStaff>>[number];

function RolePicker({ value, onChange }: { value: AppRole[]; onChange: (r: AppRole[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_ROLES.map((r) => (
        <label key={r} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
          <Checkbox checked={value.includes(r)} onCheckedChange={(c) => onChange(c ? [...value, r] : value.filter((x) => x !== r))} />
          {ROLE_LABELS[r]}
        </label>
      ))}
    </div>
  );
}

function StaffPage() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const list = useServerFn(listStaff);
  const create = useServerFn(createStaff);
  const update = useServerFn(updateStaff);
  const isAdmin = me?.roles.includes("admin");
  const { data, isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => list(), enabled: !!isAdmin });
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  const rows = useMemo(() => (data ?? []).filter((s) => !q || s.full_name.includes(q) || s.email.includes(q)), [data, q]);

  const createM = useMutation({
    mutationFn: (d: Parameters<typeof create>[0]["data"]) => create({ data: d }),
    onSuccess: () => { toast.success("کارمند اضافه شد"); setAdding(false); qc.invalidateQueries({ queryKey: ["staff"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateM = useMutation({
    mutationFn: (d: Parameters<typeof update>[0]["data"]) => update({ data: d }),
    onSuccess: () => { toast.success("تغییرات ذخیره شد"); setEditing(null); qc.invalidateQueries({ queryKey: ["staff"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return <Card><EmptyState title="دسترسی ندارید" /></Card>;

  return (
    <div>
      <PageHeader title="کارمندان" subtitle="ایجاد حساب، تعیین نقش و فعال/غیرفعال کردن" actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> کارمند جدید</Button>} />
      <Card>
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pr-9" placeholder="جستجوی نام یا ایمیل" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {isLoading ? <LoadingState /> : rows.length === 0 ? <EmptyState title="کارمندی پیدا نشد" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-xs text-muted-foreground">
                  <th className="py-3 font-medium">نام</th><th className="font-medium">ایمیل</th><th className="font-medium">نقش‌ها</th><th className="font-medium">تاریخ ثبت</th><th className="font-medium">وضعیت</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/60">
                    <td className="py-3 font-medium">{s.full_name}</td>
                    <td dir="ltr" className="text-right text-muted-foreground">{s.email}</td>
                    <td><div className="flex flex-wrap gap-1">{s.roles.map((r) => <StatusBadge key={r}>{ROLE_LABELS[r as AppRole]}</StatusBadge>)}</div></td>
                    <td className="text-muted-foreground">{formatHijri(s.created_at)}</td>
                    <td>{s.is_active ? <StatusBadge tone="success">فعال</StatusBadge> : <StatusBadge tone="danger">غیرفعال</StatusBadge>}</td>
                    <td className="text-left"><Button size="sm" variant="outline" onClick={() => setEditing(s)}>ویرایش</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddDialog open={adding} onClose={() => setAdding(false)} busy={createM.isPending} onSubmit={(d) => createM.mutate(d)} />
      {editing && <EditDialog staff={editing} onClose={() => setEditing(null)} busy={updateM.isPending} onSubmit={(d) => updateM.mutate(d)} />}
    </div>
  );
}

function AddDialog({ open, onClose, onSubmit, busy }: { open: boolean; onClose: () => void; busy: boolean; onSubmit: (d: { full_name: string; email: string; password: string; phone?: string; roles: AppRole[] }) => void }) {
  const [f, setF] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [roles, setRoles] = useState<AppRole[]>([]);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!roles.length) return toast.error("حداقل یک نقش انتخاب کنید");
    if (f.password.length < 8) return toast.error("رمز عبور باید حداقل ۸ حرف باشد");
    onSubmit({ ...f, phone: f.phone || undefined, roles });
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle className="text-right">کارمند جدید</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>نام کامل</Label><Input required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>شماره تماس</Label><Input dir="ltr" placeholder="07X XXX XXXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>ایمیل</Label><Input type="email" dir="ltr" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>رمز عبور</Label><Input dir="ltr" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          </div>
          <Label>نقش‌ها</Label>
          <RolePicker value={roles} onChange={setRoles} />
          <Button type="submit" className="w-full" disabled={busy}>ایجاد حساب</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ staff, onClose, onSubmit, busy }: { staff: Staff; onClose: () => void; busy: boolean; onSubmit: (d: { id: string; roles: AppRole[]; is_active: boolean }) => void }) {
  const [roles, setRoles] = useState<AppRole[]>(staff.roles as AppRole[]);
  const [active, setActive] = useState(staff.is_active);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle className="text-right">{staff.full_name}</DialogTitle></DialogHeader>
        <RolePicker value={roles} onChange={setRoles} />
        <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          حساب فعال باشد <Switch checked={active} onCheckedChange={setActive} />
        </label>
        <Button disabled={busy} onClick={() => onSubmit({ id: staff.id, roles, is_active: active })}>ذخیره</Button>
      </DialogContent>
    </Dialog>
  );
}
