import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleEnum = z.enum(["admin", "reception", "triage", "doctor", "pharmacy", "optical", "diagnostics", "surgery", "cashier", "inventory"]);

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("فقط مدیر سیستم اجازه این کار را دارد");
}

/** Public: tells the sign-in page whether the first admin still needs to be created. */
export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
  return { needsAdmin: (count ?? 0) === 0 };
});

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }, { data: users }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    return (profiles ?? []).map((p) => ({
      ...p,
      email: users?.users.find((u) => u.id === p.id)?.email ?? "",
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

export const createStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      full_name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(255),
      password: z.string().min(8).max(72),
      phone: z.string().trim().max(20).optional(),
      roles: z.array(roleEnum).min(1),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message.includes("already") ? "این ایمیل قبلاً ثبت شده است" : "ایجاد کاربر ناموفق بود");
    const id = created.user.id;
    await supabaseAdmin.from("profiles").update({ full_name: data.full_name, phone: data.phone ?? null }).eq("id", id);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", id);
    await supabaseAdmin.from("user_roles").insert(data.roles.map((role) => ({ user_id: id, role })));
    return { id };
  });

export const updateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), roles: z.array(roleEnum), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id === context.userId && (!data.roles.includes("admin") || !data.is_active)) {
      throw new Error("نمی‌توانید دسترسی مدیر را از حساب خودتان بردارید");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ is_active: data.is_active }).eq("id", data.id);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    if (data.roles.length) await supabaseAdmin.from("user_roles").insert(data.roles.map((role) => ({ user_id: data.id, role })));
    await supabaseAdmin.auth.admin.updateUserById(data.id, { ban_duration: data.is_active ? "none" : "876000h" });
    return { ok: true };
  });
