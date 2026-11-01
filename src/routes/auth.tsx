import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSetupStatus } from "@/lib/staff.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ورود به سیستم — شفاخانه چشم الشفاء" },
      { name: "description", content: "ورود کارمندان به سیستم مدیریت شفاخانه چشم الشفاء" },
      { property: "og:title", content: "ورود — شفاخانه چشم الشفاء" },
      { property: "og:description", content: "ورود کارمندان به سیستم مدیریت شفاخانه" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { data: setup } = useQuery({ queryKey: ["setup"], queryFn: () => getSetupStatus() });
  const [mode, setMode] = useState<"in" | "setup">("in");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return void toast.error("ایمیل یا رمز عبور اشتباه است");
      navigate({ to: "/dashboard" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setBusy(false);
      if (error) return void toast.error(error.message.includes("Password") ? "رمز عبور باید حداقل ۸ حرف باشد" : "ثبت ناموفق بود");
      setSent(true);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground"><Eye className="h-5 w-5" /></div>
          <span className="text-lg font-bold">الشفاء</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-relaxed">شفاخانه تخصصی چشم الشفاء</h1>
          <p className="mt-3 text-sidebar-muted">سیستم یکپارچه مدیریت مریضان، داکتران، دواخانه، عینک، عملیات و حسابداری.</p>
        </div>
        <div className="text-xs text-sidebar-muted">هرات، افغانستان</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="card-x w-full max-w-md p-8">
          {sent ? (
            <div className="text-center">
              <h2 className="text-lg font-bold">ایمیل خود را بررسی کنید</h2>
              <p className="mt-2 text-sm text-muted-foreground">یک لینک تأیید به {email} فرستاده شد. بعد از تأیید، وارد سیستم شوید.</p>
              <Button className="mt-6 w-full" onClick={() => { setSent(false); setMode("in"); }}>بازگشت به ورود</Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{mode === "in" ? "ورود به سیستم" : "ایجاد حساب مدیر سیستم"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "in" ? "ایمیل و رمز عبور خود را وارد کنید." : "این اولین حساب سیستم است و دسترسی کامل خواهد داشت."}
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "setup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">نام کامل</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw">رمز عبور</Label>
                  <Input id="pw" type="password" dir="ltr" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="h-11 w-full" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} {mode === "in" ? "ورود" : "ایجاد حساب"}
                </Button>
              </form>
              {setup?.needsAdmin && (
                <button className="mt-4 w-full text-center text-sm text-primary hover:underline" onClick={() => setMode(mode === "in" ? "setup" : "in")}>
                  {mode === "in" ? "راه‌اندازی اولیه: ایجاد حساب مدیر" : "قبلاً حساب دارم"}
                </button>
              )}
              {!setup?.needsAdmin && <p className="mt-4 text-center text-xs text-muted-foreground">حساب کاربری را مدیر سیستم ایجاد می‌کند.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
