<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — UGM CUP 2026 Client (Frontend)

Panduan ini berlaku untuk seluruh percakapan yang menyentuh folder `client/`. Baca tuntas sebelum menulis satu baris kode pun.

---

## 1. Stack & Versi

| Teknologi | Versi | Catatan |
|---|---|---|
| Next.js | **16.2.11** | App Router (`app/` dir), **bukan** Pages Router |
| React | **19.2.4** | Server Components by default; tambahkan `"use client"` hanya bila perlu |
| TypeScript | ^5 | Wajib — tidak ada `any` kecuali sangat terpaksa |
| Tailwind CSS | **v4** | Konfigurasi via `@theme` di `globals.css`, bukan `tailwind.config.js` |
| Package manager | **pnpm** | Gunakan `pnpm` untuk install/add, bukan `npm` atau `yarn` |

---

## 2. Struktur Folder

```
client/
├── app/                        # Next.js App Router — hanya routing & layout
│   ├── globals.css             # Token desain global + utilitas CSS
│   ├── layout.tsx              # Root layout (font, metadata)
│   └── page.tsx                # Entry point halaman utama
│
├── src/
│   ├── components/
│   │   ├── layout/             # Komponen layout global (Navbar, Footer)
│   │   └── ui/                 # Komponen UI atomik & reusable (Button, Badge, icons)
│   │
│   ├── modules/
│   │   └── landing/
│   │       ├── index.tsx       # Root modul halaman landing
│   │       └── components/    # Section-level components (Hero, About, News, dll)
│   │
│   └── lib/
│       └── constants/          # Data statis (navigation, news, sponsors)
│
├── public/
│   └── images/                 # Aset gambar publik
├── design.md                   # Design System UGM CUP 2026 — WAJIB DIBACA
└── AGENTS.md                   # File ini
```

**Aturan penempatan file:**
- Komponen yang dipakai di **lebih dari satu modul** → `src/components/`
- Komponen yang **khusus satu halaman/modul** → `src/modules/<nama-modul>/components/`
- Data statis / konstanta → `src/lib/constants/`
- Jangan taruh logika bisnis di dalam `app/` — itu hanya untuk routing

---

## 3. Design System — WAJIB DIIKUTI

**Baca `design.md` di root folder `client/` sebelum mengerjakan UI apapun.**

Ringkasan token wajib:

### Warna Brand
| Token | Hex | Penggunaan |
|---|---|---|
| Deep Purple | `#14183B` | Background section gelap |
| Violet | `#8352D9` | Aksen utama, footer background |
| Mint | `#66FFB4` / `#02F5D4` | CTA primary, highlight |
| Lavender | `#D9D3FF` | Glow dekoratif |
| Midnight | `#000033` | Background hero terdalam |
| Surface Dark | `#14182B` | Background body gelap |
| Surface Light | `#F5F5F5` | Background section terang (News) |

### Typography
- **Font utama: Montserrat** — sudah di-load via `next/font/google` di `layout.tsx`
- **Font UI kecil: Inter** — untuk ikon panah/elemen kecil
- Display Hero: 96px / 800 (ExtraBold Italic)
- Section Heading: 72px / 700 (Bold Italic)
- Button/Nav label: 14px / 600 (SemiBold)

### Komponen Standar (gunakan yang sudah ada)
- **`<Button>`** (`src/components/ui/Button.tsx`) — variant: `"solid"` (mint) atau `"outline"` (ghost)
- **`<Badge>`** (`src/components/ui/Badge.tsx`) — eyebrow pill
- **`<ArrowIcon />`**, `<YoutubeIcon />`, `<TiktokIcon />`, `<InstagramIcon />` — dari `src/components/ui/icons.tsx`

**Jangan buat komponen button/badge baru** — extend yang sudah ada jika perlu variant tambahan.

---

## 4. Konvensi Kode

### TypeScript
```typescript
// ✅ Benar — interface eksplisit
interface NewsCardProps {
  item: NewsItem;
}

// ❌ Salah — any / implicit
const render = (data: any) => { ... }
```

### Komponen React
- **Server Component by default** — jangan tambahkan `"use client"` kecuali komponen butuh hooks, event listener, atau browser API
- Komponen yang butuh `"use client"`: `Navbar` (pakai `useState`, `useEffect` untuk scroll detection)
- Gunakan **named export**, bukan default export untuk komponen
  - Pengecualian: file `index.tsx` modul boleh default export
- Gunakan **JSDoc singkat** di atas komponen yang kompleks

### Tailwind CSS v4
```css
/* ✅ Definisi token warna di globals.css */
@theme inline {
  --color-mint: #66FFB4;
  --color-violet: #8352D9;
}

/* ✅ Penggunaan di JSX */
<div className="bg-violet text-mint" />

/* ❌ Jangan pakai inline style untuk warna yang sudah ada tokennya */
<div style={{ backgroundColor: '#8352D9' }} />
```

- Tailwind v4 tidak butuh `tailwind.config.js` — semua konfigurasi ada di `globals.css` via `@theme`
- Gunakan arbitrary values `[]` hanya bila tidak ada token yang sesuai
- Gunakan `!important` modifier (`!`) hanya untuk override state (misal: scrolled di Navbar)

### Import Paths
Gunakan alias `@/` untuk import dari `src/`:
```typescript
// ✅
import { Button } from "@/components/ui/Button";
import { news } from "@/lib/constants/news";

// ❌
import { Button } from "../../../components/ui/Button";
```

---

## 5. Pola Arsitektur

### Pemisahan Data & Presentasi
Data statis disimpan di `src/lib/constants/` sebagai array/objek TypeScript yang di-export. Komponen hanya menerima dan merender data:

```typescript
// src/lib/constants/news.ts — data layer
export const news: NewsItem[] = [ ... ];

// src/modules/landing/components/News.tsx — presentation layer
import { news } from "@/lib/constants/news";
export function News() { return news.map(...) }
```

### Gambar & Aset
- Selalu pakai `next/image` (`<Image />`) untuk gambar
- Berikan `fill` + parent `relative` untuk gambar yang mengikuti kontainer
- Berikan `width` & `height` eksplisit untuk gambar dengan ukuran tetap
- Selalu isi `alt` — kosongkan (`alt=""`) hanya untuk gambar dekoratif murni
- Path gambar dimulai dari `/public` → tulis sebagai `/images/...`

### Animasi CSS
Animasi marquee sudah didefinisikan di `globals.css` sebagai `@keyframes marquee` + class `.animate-marquee`. Gunakan itu, jangan buat ulang.

---

## 6. Cara Menjalankan

```bash
# Development (dari folder client/)
pnpm dev

# Lint
pnpm lint

# Build (hanya untuk verifikasi, jangan build production kecuali diminta)
pnpm build
```

Server dev berjalan di `http://localhost:3000`.

---

## 7. Checklist Sebelum Menulis Kode

- [ ] Sudah membaca `design.md` untuk token warna, tipografi, dan komponen yang relevan?
- [ ] Komponen baru sudah ditempatkan di folder yang tepat (`ui/`, `layout/`, atau `modules/landing/components/`)?
- [ ] Sudah menggunakan `<Button>`, `<Badge>`, dan ikon yang sudah ada daripada membuat baru?
- [ ] Tidak ada `"use client"` yang tidak perlu?
- [ ] Semua gambar menggunakan `<Image>` dari `next/image`?
- [ ] Import menggunakan alias `@/` bukan path relatif panjang?
- [ ] Warna/spacing menggunakan token Tailwind yang sudah ada daripada arbitrary values?
- [ ] Tidak ada `console.log` yang ditinggal di produksi?

---

## 8. Hal yang DILARANG

- ❌ Jangan install library UI eksternal (shadcn, MUI, Chakra, dll) tanpa persetujuan eksplisit
- ❌ Jangan gunakan Pages Router (`pages/` dir) — proyek ini pakai App Router
- ❌ Jangan hardcode warna hex yang sudah ada sebagai token desain
- ❌ Jangan ubah struktur folder tanpa alasan yang jelas
- ❌ Jangan bypass TypeScript dengan `@ts-ignore` atau `as any`
- ❌ Jangan gunakan `npm` atau `yarn` — gunakan `pnpm`

---

*UGM CUP 2026 — Client AGENTS.md v1.0.0*
