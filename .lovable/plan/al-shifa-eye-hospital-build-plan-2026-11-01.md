# Al-Shifa Eye Hospital — Build Plan

The brief is a full hospital system (13+ modules). It will be built in the five phases the brief defines, each one working and tested before moving on. This plan covers **Phase 1 (Foundation)** in detail; later phases follow the same pattern.

## Phase 1 — Foundation (this round)

**Look & feel (XRay style, Dari, RTL)**
- Teal sidebar on the right, white top bar with search, notifications and profile menu, light-grey page background, white rounded cards with soft shadows — matching the uploaded screenshots.
- Vazirmatn font, full right-to-left layout, Solar Hijri dates (Kabul time), AFN currency.
- Shared building blocks: statistic card, chart card, data table with search/pagination, status badge, forms, tabs, dialogs, empty/loading states.

**Sign-in and staff roles**
- Email + password sign-in (Dari screens), no public sign-up — the admin creates staff accounts.
- Roles: مدیر سیستم، پذیرش، معاینه ابتدایی، داکتر، دواخانه، عینک‌سازی، لابراتوار/تشخیص، عملیات، صندوق/حسابداری، گدام.
- Each role sees only its own menu items and data; enforced on the server, not just hidden in the menu.
- First signed-up account becomes the admin; a Staff page lets the admin add users and assign roles.

**Main dashboard**
- XRay-style hospital dashboard: patients today, appointments, revenue, surgeries cards; patient-flow and revenue charts; today's queue widget. Shows real (initially empty) numbers from the database.
- All sidebar sections from the brief appear (پذیرش، مریضان، نوبت‌ها، ... تنظیمات), with placeholder "coming in next phase" pages for modules not yet built.

**Settings**
- Hospital info (name, address, phone, logo), default currency and USD exchange rate.

## Later phases
- **Phase 2:** patient registry, registration, appointments, queues, preliminary eye exam, doctor consultation, prescriptions.
- **Phase 3:** pharmacy, optical shop, diagnostics, surgery.
- **Phase 4:** billing, payments, accounting, inventory, procurement, staff management.
- **Phase 5:** full dashboards, reports, printing (Persian PDF), acceptance tests A–J.

## Technical details
- Lovable Cloud (PostgreSQL + auth + storage); roles in a separate `user_roles` table with a `has_role` security-definer function and RLS on every table.
- Tables in Phase 1: `profiles`, `user_roles`, `hospital_settings`, `branches` (multi-branch ready).
- Authenticated routes under `_authenticated/`; design tokens in `src/styles.css` (oklch teal palette sampled from screenshots); Recharts for charts; Solar Hijri via `Intl` `persian` calendar.
