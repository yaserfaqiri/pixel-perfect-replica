import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدیر سیستم",
  reception: "پذیرش",
  triage: "معاینه ابتدایی",
  doctor: "داکتر",
  pharmacy: "دواخانه",
  optical: "عینک‌سازی",
  diagnostics: "لابراتوار و تشخیص",
  surgery: "عملیات",
  cashier: "صندوق و حسابداری",
  inventory: "گدام",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as AppRole[];

export function canAccess(userRoles: AppRole[], allowed: AppRole[] | "all") {
  if (userRoles.includes("admin")) return true;
  if (allowed === "all") return userRoles.length > 0;
  return allowed.some((r) => userRoles.includes(r));
}
