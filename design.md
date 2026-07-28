# UGM Cup — Design System

Tokens, typography, components, dan guidelines yang diekstrak langsung dari Figma landing page **UGM CUP 2026**, turnamen bulutangkis nasional antar Universitas dan SMA/Sederajat se-Indonesia.

---

## 1. Brand Colors

### Brand

| Swatch | Nama | Hex | Token |
|---|---|---|---|
| 🟣 | Deep Purple | `#14183B` | `color-deep-purple` |
| 🟪 | Violet | `#8352D9` | `color-violet` |
| 🟢 | Mint | `#66FFB4` | `color-mint` |
| ⚪ | Lavender | `#D9D3FF` | `color-lavender` |
| ⚫ | Midnight | `#000033` | `color-midnight` |

### Surface

| Swatch | Nama | Hex | Token |
|---|---|---|---|
| 🟣 | Surface Dark | `#14182B` | `color-surface-dark` |
| ⚪ | Surface Light | `#F5F5F5` | `color-surface-light` |
| ⚪ | Surface White | `#FFFFFF` | `color-surface-white` |

### Text

| Swatch | Nama | Hex | Token |
|---|---|---|---|
| ⚫ | Text Primary | `#000000` | `color-text-primary` |
| ⚪ | Text Inverse | `#FFFFFF` | `color-text-inverse` |
| ⚪ | Text Muted | `#9D9DB6` | `color-text-muted` |
| 🟣 | Text Accent | `#8352D9` | `color-text-accent` |

### Gradient Stops

| Swatch | Nama | Hex | Token |
|---|---|---|---|
| 🟢 | Ellipse Start | `#A3DDB8` | `color-ellipse-start` |
| 🔵 | Ellipse Mid | `#B0C2FD` | `color-ellipse-mid` |
| 🟡 | Ellipse End | `#4FEFB2` | `color-ellipse-end` |

### Brand Gradients

| Nama | Deskripsi | Arah |
|---|---|---|
| Hero Canvas | Gradasi dari Deep Purple → Midnight, dipakai sebagai background section Hero | radial / bottom |
| Ellipse Aura | Gradasi lembut Mint → Lavender, dipakai sebagai glow dekoratif di belakang elemen hero | radial |
| Brand Accent | Gradasi Violet → Mint, dipakai pada aksen highlight & badge | linear |
| Teal Depth | Gradasi Midnight → Teal, dipakai sebagai overlay foto/hero image | linear |

---

## 2. Typography Scale

Font utama: **Montserrat** (dengan Inter untuk elemen UI kecil seperti panah/arrow).

| Role | Contoh | Size / Weight | Font | Penggunaan |
|---|---|---|---|---|
| Display / Hero | "We reach the…" | 96px / 800 (ExtraBold) | Montserrat | Hero heading |
| Section Heading | "Hey, we're UGM CUP!" | 72px / 700 (Bold) | Montserrat | Judul section utama |
| Sub-heading | "News & Insights" | 64px / 700 (Bold) | Montserrat | Judul sub-section |
| Card Headline | "Ginting: A New Path to Victory" | 28px / 700 (Bold) | Montserrat | Judul kartu berita/artikel |
| Nav / Button | "Home · Matches · News · About" | 14px / 600 (SemiBold) | Montserrat | Label navigasi & tombol |
| CTA Label | "View live score →" | 15px / 700 (Bold) | Montserrat | Teks di dalam CTA |
| Badge / Eyebrow | "UGM CUP 2026" | 12px / 600 (SemiBold) | Montserrat | Label eyebrow di atas heading |
| Body | "The Badminton Court says…" | 14–17px / 400 (Regular) | Montserrat | Paragraf/body copy deskriptif |
| Date / Caption | "12. August 2025" | 13px / 400 (Regular) | Montserrat | Metadata, caption, tanggal |
| UI / Arrow | "→" | 14px / 600 (SemiBold) | Inter | Ikon panah & tautan UI kecil |

---

## 3. UI Components

### Buttons

| Varian | Contoh label | Deskripsi |
|---|---|---|
| Primary CTA | "Learn more now" | Background mint solid, teks gelap, radius pill, dipakai untuk aksi utama di atas background gelap |
| Ghost CTA | "Live score" | Outline transparan di atas background gelap, teks putih |
| Nav Badge CTA | "Dokumentasi! →" | Background violet, teks putih, dipakai di navbar |
| Primary on Light | "View all news" | Sama dengan Primary CTA namun dipakai di atas background terang |

### Pills & Tags

| Varian | Contoh | Deskripsi |
|---|---|---|
| Eyebrow Pill | "UGM CUP 2026" | Pill kecil dengan background violet transparan, dipakai di atas background gelap sebagai label section |
| Article Tag | "Highlights" | Pill mint solid dengan teks gelap, dipakai sebagai tag di pojok kiri atas thumbnail berita |

### News Card

Struktur kartu berita:
1. Thumbnail foto (rasio landscape/portrait campuran)
2. Tag "Highlights" (pill mint) di pojok kiri atas thumbnail
3. Tanggal publikasi (caption kecil, abu-abu)
4. Judul artikel (Card Headline, bold, 2 baris)

Dipakai secara grid 3 kolom pada section "Berita & Informasi / News & Insights".

### Navigation

Navbar horizontal gelap dengan:
- Logo/wordmark UGM Cup di kiri
- Menu link: Home · Matches · News · About (Beranda · Pertandingan · Berita · Tentang kami pada versi Indonesia)
- Tombol CTA "Dokumentasi! →" di kanan (violet, pill)

### Separator

Divider full-width dengan background gradasi gelap dan opacity rendah, digunakan sebagai jeda visual antar-section besar.

---

## 4. Layout Tokens — Spacing & Radius

### Spacing Scale

| Token | Nilai | Kegunaan |
|---|---|---|
| `space-1` | 4px | Gap ikon kecil / padding minimal |
| `space-2` | 8px | Gap teks berdekatan |
| `space-3` | 12px | Padding tombol vertikal |
| `space-4` | 16px | Padding card horizontal, gap elemen form |
| `space-5` | 20px | Padding card vertikal |
| `space-6` | 24px | Gap antar kartu grid |
| `space-8` | 32px | Padding container kecil |
| `space-10` | 40px | Gap antar blok konten |
| `space-12` | 48px | Padding section (mobile) |
| `space-16` | 64px | Gap antar section |
| `space-20` | 80px | Padding section (desktop) |
| `space-24` | 96px | Padding container besar |
| `space-32` | 128px | Padding vertikal section hero |

### Border Radius

| Token | Nilai | Kegunaan |
|---|---|---|
| `radius-sm` | 6px | Elemen kecil, badge |
| `radius-md` | 10px | Kartu, input |
| `radius-lg` | 16px | Kartu besar, gambar |
| `radius-xl` | 24px | Container/section besar |
| `radius-full` | 999px | Tombol pill, tag |

---

## 5. Elevation — Shadows & Glows

| Nama | Deskripsi |
|---|---|
| Glow Bottom (Ghost Button) | Glow lembut berwarna ungu di bagian bawah tombol ghost/outline |
| Glow Bottom (Mint CTA) | Glow lembut berwarna mint di bagian bawah tombol CTA utama |
| Pill Border Glow | Border tipis berwarna mint dengan efek glow ringan pada pill/badge |
| Drop Shadow (Subtitle) | Shadow halus di bawah teks subtitle untuk kontras di atas foto/background gelap |

---

## 6. Contoh Penerapan — Landing Page (Bahasa Indonesia)

Landing page "UGM CUP 2026 — Rallyverse" mengaplikasikan seluruh token di atas:

- **Hero section**: background gradasi Deep Purple → Midnight dengan foto shuttlecock sebagai elemen dekoratif, heading Display "Rallyverse" (warna Mint) + "Power in every motion" (warna putih), diikuti baris logo sponsor, dan CTA mint pill "Lihat Live Score →".
- **About section**: background putih, heading besar dengan kata kunci ("UGM CUP", "bulutangkis terbaik", "Indonesia!") disorot warna Violet & Mint, CTA mint "Baca Selengkapnya".
- **Berita & Informasi**: grid 3 news card dengan tag "Highlights" dan CTA mint "Baca Berita Lainnya".
- **CTA section**: heading bold di atas background putih dengan CTA mint pill.
- **Marquee band**: teks besar "UGM CUP 2026" berulang di atas background Violet solid, membentang penuh (full-bleed, terpotong di tepi layar).
- **Footer**: background Violet dengan logo UGM & UGM Cup, deskripsi singkat, ikon sosial media, dan 3 kolom info (Navigasi, Kontak, Jadwal Acara).
- **Navbar**: mengikuti token Navigation, dengan menu Beranda · Pertandingan · Berita · Tentang kami dan CTA "Dokumentasi! →".

---

*UGM Cup Design System — v1.0.0*
