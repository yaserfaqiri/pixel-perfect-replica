import {
  LayoutDashboard, ClipboardList, Users, CalendarClock, Eye, Stethoscope, FileText, Pill,
  Glasses, Microscope, Scissors, Wallet, Warehouse, BarChart3, Settings, UserCog,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "./roles";

export type NavItem = {
  key: string;
  title: string;
  icon: LucideIcon;
  roles: AppRole[] | "all";
  phase?: number; // module arrives in a later build phase
  description?: string;
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "داشبورد",
    items: [{ key: "dashboard", title: "داشبورد شفاخانه", icon: LayoutDashboard, roles: "all" }],
  },
  {
    label: "جریان مریض",
    items: [
      { key: "reception", title: "پذیرش", icon: ClipboardList, roles: ["reception"], phase: 2, description: "ثبت مریض جدید، صدور نوبت و ورود به صف." },
      { key: "patients", title: "مریضان", icon: Users, roles: ["reception", "doctor", "triage", "cashier"], phase: 2, description: "پرونده مرکزی تمام مریضان شفاخانه." },
      { key: "appointments", title: "نوبت‌ها", icon: CalendarClock, roles: ["reception", "doctor"], phase: 2, description: "تقویم نوبت‌ها و صف انتظار داکتران." },
      { key: "triage", title: "معاینه ابتدایی", icon: Eye, roles: ["triage", "doctor"], phase: 2, description: "دید، فشار چشم، رفرکشن و علایم حیاتی." },
      { key: "doctors", title: "داکتران", icon: Stethoscope, roles: ["doctor"], phase: 2, description: "میز کار داکتر و معاینه تخصصی." },
      { key: "prescriptions", title: "نسخه‌ها", icon: FileText, roles: ["doctor", "pharmacy"], phase: 2, description: "نسخه‌های دوا و عینک صادر شده." },
    ],
  },
  {
    label: "بخش‌ها",
    items: [
      { key: "pharmacy", title: "دواخانه", icon: Pill, roles: ["pharmacy"], phase: 3, description: "تحویل نسخه، فروش دوا و موجودی." },
      { key: "optical", title: "بخش عینک", icon: Glasses, roles: ["optical"], phase: 3, description: "سفارش عینک، فریم و شیشه." },
      { key: "diagnostics", title: "تشخیص و لابراتوار", icon: Microscope, roles: ["diagnostics", "doctor"], phase: 3, description: "OCT، بیومتری، فیلد بینایی و نتایج." },
      { key: "surgery", title: "عملیات", icon: Scissors, roles: ["surgery", "doctor"], phase: 3, description: "زمان‌بندی و ثبت عملیات‌ها." },
    ],
  },
  {
    label: "مدیریت",
    items: [
      { key: "accounting", title: "حسابداری", icon: Wallet, roles: ["cashier"], phase: 4, description: "بل‌ها، پرداخت‌ها و صندوق." },
      { key: "inventory", title: "گدام", icon: Warehouse, roles: ["inventory", "pharmacy", "optical"], phase: 4, description: "موجودی، خرید و تأمین‌کنندگان." },
      { key: "reports", title: "گزارش‌ها", icon: BarChart3, roles: ["admin"], phase: 5, description: "گزارش‌های مالی و طبی." },
      { key: "staff", title: "کارمندان", icon: UserCog, roles: ["admin"] },
      { key: "settings", title: "تنظیمات", icon: Settings, roles: ["admin"] },
    ],
  },
];

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
export const PLACEHOLDER_MODULES = ALL_NAV.filter((i) => i.phase);
