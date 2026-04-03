# AO Procurement Web App — Deploy Guide

## สิ่งที่ทำเสร็จแล้ว

### 1. Database (Supabase)
- ✅ ตาราง `user_profiles` สำหรับ role management (owner/procurement/manager/viewer)
- ✅ RLS policies ทุกตาราง — กำหนดสิทธิ์ตาม role + project
- ✅ Auto-create profile trigger เมื่อ signup
- ✅ Helper functions: `get_user_role()`, `has_project_access()`

### 2. Web App (Next.js)
- ✅ Login ด้วย Google OAuth
- ✅ Dashboard — ภาพรวมทุกโครงการ, stats, recent POs
- ✅ PO Table — filter, search, sort, export CSV
- ✅ Projects — ภาพรวมงบประมาณแต่ละโครงการ
- ✅ User Management — เปลี่ยน role, enable/disable
- ✅ Settings — แก้ไขโปรไฟล์
- ✅ AO Brand — สี #00366D/#00CE81, โลโก้, font

---

## ขั้นตอน Deploy

### Step 1: เปิด Google Auth ใน Supabase

1. ไปที่ https://supabase.com/dashboard → Project `brkrnndnnwlybrfupube`
2. ไปที่ **Authentication → Providers → Google**
3. เปิด Enable Google provider
4. ใส่ Google Client ID และ Client Secret
   - สร้างที่ https://console.cloud.google.com/apis/credentials
   - Project: `gen-lang-client-0241630263`
   - Authorized redirect URI: `https://brkrnndnnwlybrfupube.supabase.co/auth/v1/callback`
5. Save

### Step 2: หา Supabase Anon Key

1. ไปที่ Supabase Dashboard → Settings → API
2. Copy **anon public** key

### Step 3: Deploy บน Vercel

1. Push code ไป GitHub:
   ```bash
   cd ao-procurement-web
   git init
   git add .
   git commit -m "Initial AO Procurement Web App"
   git remote add origin https://github.com/YOUR-USERNAME/ao-procurement-web.git
   git push -u origin main
   ```

2. ไปที่ https://vercel.com → Import project จาก GitHub

3. ตั้งค่า Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://brkrnndnnwlybrfupube.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (ค่าจาก Step 2)
   ```

4. Deploy!

### Step 4: ตั้ง Redirect URL

หลัง deploy จะได้ URL เช่น `https://ao-procurement.vercel.app`

1. ไปที่ Supabase Dashboard → Authentication → URL Configuration
2. เพิ่ม **Site URL**: `https://ao-procurement.vercel.app`
3. เพิ่ม **Redirect URLs**: `https://ao-procurement.vercel.app/auth/callback`

### Step 5: ตั้ง Role ให้ตัวเอง

หลัง login ครั้งแรก จะได้ role = viewer อัตโนมัติ
ต้องอัพเกรดตัวเองเป็น owner ผ่าน SQL:

```sql
UPDATE user_profiles
SET role = 'owner'
WHERE email = 'suntaku@gmail.com';
```

(รันใน Supabase SQL Editor)

---

## โครงสร้างไฟล์

```
ao-procurement-web/
├── src/
│   ├── app/
│   │   ├── (app)/           # Protected routes (มี Sidebar)
│   │   │   ├── dashboard/   # หน้า Dashboard
│   │   │   ├── po/          # หน้า PO ทั้งหมด
│   │   │   ├── projects/    # หน้าโครงการ
│   │   │   ├── users/       # จัดการผู้ใช้ (Owner only)
│   │   │   ├── settings/    # ตั้งค่า
│   │   │   └── layout.tsx   # App shell + Sidebar
│   │   ├── auth/callback/   # Google OAuth callback
│   │   ├── login/           # หน้า Login
│   │   ├── globals.css      # AO Brand styles
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── AOLogo.tsx       # SVG Logo component
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── StatusBadge.tsx  # PO status badge
│   ├── lib/
│   │   ├── supabase.ts      # Browser client
│   │   ├── supabase-server.ts # Server client
│   │   ├── types.ts         # TypeScript types
│   │   └── format.ts        # Number/date formatters
│   └── middleware.ts        # Auth guard
├── tailwind.config.ts       # AO brand colors
└── package.json
```

## n8n / LINE ผลกระทบ

**ไม่มีผลกระทบ** — n8n ใช้ Supabase service_role key ซึ่ง bypass RLS
Web App ใช้ anon key + RLS → คนละช่องทาง ทำงานคู่กันได้
