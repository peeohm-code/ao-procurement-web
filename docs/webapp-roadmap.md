# AO Procurement Web — Roadmap

## Phase 1 ✅ Done

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 14 App Router setup | ✅ | TypeScript, Tailwind, Supabase Auth |
| AO brand system | ✅ | ao-navy #00366D, ao-green #00CE81 |
| Sidebar + layout | ✅ | Collapsible, role-aware nav |
| Google SSO (Supabase Auth) | ✅ | No separate password |
| 4-role permission system | ✅ | owner / procurement / manager / viewer |
| Dashboard + KPI cards | ✅ | Recharts BarChart, PieChart |
| EmptyState + OnboardingChecklist | ✅ | First-run guidance |
| Projects list page | ✅ | Status badges, budget display |
| PO list page (basic) | ✅ | Table with filters |
| Settings page | ✅ | User profile management |
| Vercel deploy | ✅ | peeohm-code/ao-procurement-web |

---

## Phase 2 ✅ Done

| Feature | Status | Notes |
|---------|--------|-------|
| Radix UI primitives | ✅ | Dialog, Tooltip, Collapsible |
| Progressive Disclosure — PO items | ✅ | Expand row to see item breakdown |
| Vendors page (ทะเบียนร้านค้า) | ✅ | Add/edit vendors + bank accounts |
| vendor-account EF v13 sync | ✅ | LINE bot writes to Supabase vendors table too |
| Project Detail page `/projects/[id]` | ✅ | Budget bar, KPIs, monthly chart, CC chart |
| Help Center / FAQ page | ✅ | 4 sections, accordion, anchor links |
| Phase 2 deploy | ✅ | Vercel auto-deploy on push |

**New feature added (Phase 2):**
- Vendor bank account management — no more typing bank info in LINE for repeat vendors

---

## Phase 3 🔮 Planned

| Feature | Status | Notes |
|---------|--------|-------|
| LINE LIFF integration | 🔮 | Open web app from LINE |
| PostHog Analytics | 🔮 | Usage tracking |
| Export PDF report | 🔮 | Per-project spending summary |
| Mobile responsive improvements | 🔮 | Better UX on phones |
| Push notifications | 🔮 | PO status changes via web push |
| BOQ vs actual comparison chart | 🔮 | Pull BOQ budgets from Sheets API |
