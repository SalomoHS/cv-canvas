# CV Manager — Product Requirements Document

**Version:** 2.0
**Author:** Salomo Hendrian Sudjono
**Status:** Draft
**Last Updated:** Juni 2026
**Platform:** Web App (Next.js + TypeScript)

> **Changelog v2.0:** Schema diperbarui berdasarkan struktur CV aktual Salomo. Section fix: Profile, About Me, Education, Professional Experience, Organizational Experience, Projects, Skills. Entry type Experience dan Organizational Experience digabung jadi satu type dengan discriminator field `subType`. Skills berubah menjadi category-based. Projects menggunakan `year` (bukan period range).

---

## 1. Overview

CV Manager adalah personal web app untuk mengelola dan mengekspor CV dengan efisien. Problem utamanya adalah friction tinggi saat update CV — setiap perubahan di Word berarti harus membuka file, mengedit konten, dan menyesuaikan ulang styling secara manual.

Solusinya: pisahkan konten dari presentasi. Semua data CV disimpan sebagai entries terstruktur. Update dilakukan sekali, hasilnya langsung bisa diekspor ke PDF maupun DOCX dengan styling konsisten — tanpa sentuh Word lagi.

---

## 2. Problem Statement

### 2.1 Pain Points

- Setiap update CV harus buka Word, edit, dan rapikan formatting ulang
- Tidak ada tempat terpusat untuk semua pengalaman / project yang pernah ada
- Bikin CV untuk role berbeda = copy-paste manual dari versi lama
- Konsistensi styling tidak terjamin

### 2.2 Root Cause

CV disimpan sebagai dokumen (Word), bukan sebagai data. Konten dan presentasi tercampur — mengubah satu berarti harus urus yang lain.

---

## 3. Goals & Success Metrics

### 3.1 Goals

- Pisahkan data CV dari styling/layout
- Satu tempat untuk semua entries (experience, project, skill, dll)
- Support 2–3 versi CV paralel dari data yang sama
- Export ke PDF dan DOCX dengan 1 klik, styling tidak perlu diatur ulang

### 3.2 Success Metrics

| Metric | Before | Target |
|---|---|---|
| Waktu update CV | > 15 menit | < 2 menit |
| Lokasi data CV | Tersebar di beberapa file Word | Terpusat di 1 app |
| PDF/DOCX siap pakai | Perlu post-processing | Langsung pakai |

---

## 4. CV Structure (Fixed)

Berdasarkan CV aktual Salomo, berikut adalah 7 section yang menjadi struktur tetap aplikasi. Urutan section fix dan tidak dapat diubah oleh user.

| # | Section | Fields |
|---|---|---|
| 1 | **Profile** | name · phone · email · location · links (label + URL) |
| 2 | **About Me** | summary (paragraph) |
| 3 | **Education** | institution · degree · field · period · gpa · relatedModules[] |
| 4 | **Professional Experience** | role · organization · location · period · bullets[] |
| 5 | **Organizational Experience** | role · organization · location · period · bullets[] ← same type as Professional |
| 6 | **Projects** | name · link · year · bullets[] ← year, bukan period range |
| 7 | **Skills** | category · items[] ← category-based |

---

## 5. Scope

### 5.1 In Scope

- CRUD untuk semua 7 section
- Library view — semua entries tersimpan, bisa aktif atau nonaktif per CV version
- Multi-version CV (2–3 versi) dengan set entries berbeda dari data yang sama
- Drag & drop untuk reorder entries dalam section
- Real-time preview CV
- Export ke PDF dan DOCX dengan template fix
- JSON backup / restore
- Data disimpan di localStorage (no backend required)

### 5.2 Out of Scope

- Multi-user / authentication
- Custom template builder
- Reorder section (urutan section fix)
- Mobile app
- AI-assisted content generation
- Cloud sync antar device

---

## 6. User Stories

### 6.1 Profile & About Me

- Sebagai user, saya bisa edit Profile (nama, kontak, links) dan About Me (summary paragraph)
- Sebagai user, links di Profile bisa diberi label dan URL terpisah (misal: label "LinkedIn", url "linkedin.com/in/salomo")

### 6.2 Education

- Sebagai user, saya bisa tambah/edit/hapus entry Education
- Sebagai user, related modules disimpan sebagai list yang bisa diedit item per item

### 6.3 Experience (Professional & Organizational)

- Sebagai user, saya bisa tambah entry Experience dengan tipe `professional` atau `organizational`
- Sebagai user, saya bisa tambah/edit/hapus bullet points per experience entry
- Sebagai user, entry Professional dan Organizational tampil di section masing-masing di preview

### 6.4 Projects

- Sebagai user, saya bisa tambah entry Project dengan field: nama, link (URL), year, dan bullet points
- Sebagai user, link project bisa dikosongkan jika project tidak punya URL publik

### 6.5 Skills

- Sebagai user, saya bisa tambah skill category baru
- Sebagai user, saya bisa tambah/edit/hapus skill items dalam satu category
- Sebagai user, saya bisa reorder skill categories dan items di dalamnya

### 6.6 Library & Versioning

- Sebagai user, saya bisa lihat semua entries di Library view, dikelompokkan per section
- Sebagai user, saya bisa toggle entry antara `active` (masuk CV) dan `library` (tersimpan, tidak tampil)
- Sebagai user, saya bisa buat CV version baru (misal: "CV Data Engineer", "CV AI Engineer")
- Sebagai user, update satu entry otomatis berlaku di semua version yang menggunakannya

### 6.7 Export

- Sebagai user, saya bisa export CV aktif ke PDF dengan 1 klik
- Sebagai user, saya bisa export CV aktif ke DOCX dengan 1 klik
- Sebagai user, saya bisa export seluruh data sebagai JSON untuk backup
- Sebagai user, saya bisa import JSON backup untuk restore data

---

## 7. Feature Requirements

| Feature | Description | Priority | Phase |
|---|---|---|---|
| Profile Editor | Edit nama, kontak, links (label + URL) | Must Have | Phase 1 |
| About Me Editor | Edit summary paragraph | Must Have | Phase 1 |
| Education CRUD | Tambah/edit/hapus education + modules list | Must Have | Phase 1 |
| Experience CRUD | CRUD Professional & Organizational experience | Must Have | Phase 1 |
| Projects CRUD | CRUD project: nama, link, year, bullets | Must Have | Phase 1 |
| Skills CRUD | Category-based skill management + reorder | Must Have | Phase 1 |
| LocalStorage Persist | Semua data otomatis tersimpan di browser | Must Have | Phase 1 |
| Library View | Lihat semua entries per section, filter aktif/library | Must Have | Phase 2 |
| Active/Library Toggle | Toggle entry masuk atau tidak di CV version aktif | Must Have | Phase 2 |
| CV Canvas Preview | Preview real-time layout CV per section | Must Have | Phase 2 |
| Drag & Drop Reorder | Reorder entries dalam section (dnd-kit) | Must Have | Phase 2 |
| Multi-version CV | Buat dan kelola 2–3 versi CV paralel | Must Have | Phase 3 |
| Version Switcher | Switch antar CV version dengan mudah | Must Have | Phase 3 |
| PDF Export | Generate PDF A4 siap pakai, template fix | Must Have | Phase 4 |
| DOCX Export | Generate DOCX siap pakai, template fix | Must Have | Phase 4 |
| JSON Backup | Export seluruh data sebagai file JSON | Should Have | Phase 4 |
| JSON Restore | Import JSON backup untuk restore data | Should Have | Phase 4 |

---

## 8. Data Schema

Semua data disimpan dalam format JSON di localStorage. Schema v2.0 disesuaikan dengan struktur CV aktual.

### 8.1 Root Structure

```ts
type Store = {
  profile:    Profile
  entries:    Entry[]
  cvVersions: CVVersion[]
}
```

### 8.2 Profile

```ts
type Profile = {
  name:     string
  phone:    string
  email:    string
  location: string
  links:    { label: string; url: string }[]
  summary:  string   // About Me paragraph
}
```

### 8.3 Entry (Base)

```ts
type SectionType  = 'education' | 'experience' | 'project' | 'skill'
type EntryStatus  = 'active' | 'library'
type ExperienceSubType = 'professional' | 'organizational'

type Entry = {
  id:        string           // uuid
  section:   SectionType
  subType?:  ExperienceSubType  // hanya untuk section 'experience'
  status:    EntryStatus
  createdAt: number           // epoch ms
  updatedAt: number           // epoch ms
  data:      SectionData      // lihat 8.4
}
```

### 8.4 Section Data

```ts
// Education
type EducationData = {
  institution:    string
  degree:         string
  field:          string
  period:         string      // "Month YYYY - Month YYYY"
  gpa?:           string      // "3.76/4.00"
  relatedModules: string[]
}

// Experience (Professional & Organizational — same type)
type ExperienceData = {
  role:         string
  organization: string
  location:     string
  period:       string        // "Month YYYY - Month YYYY"
  bullets:      string[]
}

// Project
type ProjectData = {
  name:    string
  link?:   string             // URL opsional
  year:    string             // "2025" — bukan period range
  bullets: string[]
}

// Skill
type SkillData = {
  category: string            // "Soft Skills" | "Technical Skills" | "Tools" | "Framework"
  items:    string[]
}

type SectionData = EducationData | ExperienceData | ProjectData | SkillData
```

### 8.5 CV Version

```ts
type CVVersion = {
  id:           string
  name:         string        // "CV Data Engineer"
  entryIds:     string[]      // ID entry yang aktif di versi ini
  sectionOrder: Record<SectionType, string[]>  // urutan entry per section
  skillOrder:   string[]      // urutan skill category entry IDs
  createdAt:    number
}
```

---

## 9. CV Styling Specification

Styling ini adalah template fix yang digunakan untuk PDF dan DOCX export. Tidak bisa dikustomisasi oleh user.

### 9.1 Page Setup

| Property | Value |
|---|---|
| Paper size | A4 (210 × 297 mm) |
| Margin | 1 inch semua sisi (top, right, bottom, left) |
| Font family | Times New Roman (serif) |
| Base font size | 11pt |
| Text color | Black (`#000000`) |
| Line spacing | Single |

---

### 9.2 Profile Block (Header)

Terletak di paling atas, center-aligned.

| Element | Style |
|---|---|
| **Nama** | Bold, 14pt, center, Times New Roman |
| **Kontak** (phone · email · location) | 11pt, center, plain — dipisahkan dengan ` \| ` |
| **Links** (LinkedIn, Personal Website, Github) | 11pt, center, hyperlink (underline + biru default) — dipisahkan dengan ` \| ` |
| Spasi bawah header | ~6pt sebelum section pertama |

**Contoh render:**
```
        Salomo Hendrian Sudjono           ← bold, 14pt, center
( +62 ) 85155447960 | email | Kota        ← 11pt, center
     LinkedIn | Personal Website | Github  ← 11pt, center, hyperlink
```

---

### 9.3 Section Heading

Dipakai untuk: ABOUT ME, EDUCATION, PROFESSIONAL EXPERIENCE, ORGANIZATIONAL EXPERIENCE, PROJECTS, SKILLS.

| Property | Value |
|---|---|
| Font | Bold, 11pt, ALL CAPS |
| Underline | Full-width horizontal rule di bawah teks (border bottom) |
| Spasi atas | 10pt before |
| Spasi bawah | 4pt after (sebelum konten section) |

**Contoh:**
```
PROFESSIONAL EXPERIENCE
────────────────────────────────────────
```

---

### 9.4 Education Entry

```
Bina Nusantara University, Indonesia          September 2021 - August 2025
Bachelor of Computer Science, Data Science Major
  • Cumulative GPA: 3.76/4.00.
  • Related Modules: Introduction to Data Science, ...
```

| Element | Style |
|---|---|
| **Institution name** | Bold, 11pt, left |
| **Period** | Italic, 11pt, right (right-aligned, same line as institution) |
| Degree + Field | Italic, 11pt, left (baris kedua) |
| GPA | Italic, 11pt, bullet point |
| Related Modules | Italic, 11pt, bullet point (satu bullet, semua module dipisah koma) |
| Layout baris pertama | Two-column: institution (left) + period (right) |

---

### 9.5 Experience Entry (Professional & Organizational)

```
Data Scientist Intern, PT Bank Central Asia | Jakarta, Indonesia    February 2024 - February 2025
  • Bullet point satu...
  • Bullet point dua...
```

| Element | Style |
|---|---|
| **Role, Organization** | Bold, 11pt, left |
| **\| Location** | Plain, 11pt — disambung ke baris yang sama setelah `\|` |
| **Period** | Italic, bold, 11pt, right-aligned (same line) |
| Bullet points | Plain, 11pt, bullet (`•`), indented |
| Layout baris pertama | Two-column: `Role, Org \| Location` (left) + `Period` (right) |

---

### 9.6 Project Entry

```
Task Management App – View Project                                              2025
  • Developed a full-stack...
```

| Element | Style |
|---|---|
| **Project name** | Italic, bold, 11pt, left |
| **– View Project** | Italic, bold, 11pt — hyperlink, disambung setelah em dash `–` |
| **Year** | Plain, 11pt, right-aligned (same line) |
| Bullet points | Plain, 11pt, bullet (`•`), indented |
| Layout baris pertama | Two-column: `Name – Link` (left) + `Year` (right) |
| Spasi antar project | 6pt after setiap project block |

---

### 9.7 Skills Section

```
• Soft Skills: Collaboration, Communication, Problem solving, Critical thinking, Adaptive.
• Technical Skills: REST API, Data analysis, Machine learning, Prompt Engineering.
• Tools: Python
• Framework: FastAPI, Pandas, Numpy, Matplotlib, Langchain, PyTorch, Keras.
```

| Element | Style |
|---|---|
| **Category label** | Bold, 11pt — inline di awal bullet |
| Items | Plain, 11pt — comma-separated, disambung setelah label |
| Bullet style | `•` (filled circle) |
| Layout | Full-width, tidak ada two-column |

---

### 9.8 Typography Summary

| Element | Font | Size | Weight | Style |
|---|---|---|---|---|
| Nama (profile) | Times New Roman | 14pt | Bold | Normal |
| Kontak & links | Times New Roman | 11pt | Normal | Normal / Hyperlink |
| Section heading | Times New Roman | 11pt | Bold | ALL CAPS |
| Institution / Role / Project name | Times New Roman | 11pt | Bold | Normal |
| Degree / GPA / Modules | Times New Roman | 11pt | Normal | Italic |
| Period (education) | Times New Roman | 11pt | Normal | Italic |
| Period (experience) | Times New Roman | 11pt | Bold | Italic |
| Project name | Times New Roman | 11pt | Bold | Italic |
| Bullet content | Times New Roman | 11pt | Normal | Normal |
| Skill category label | Times New Roman | 11pt | Bold | Normal |
| Skill items | Times New Roman | 11pt | Normal | Normal |

---

### 9.9 Layout Pattern: Two-Column Lines

Beberapa baris menggunakan layout dua kolom (left + right). Implementasinya menggunakan **tab stop** atau **flex justify-between** tergantung target output:

| Target | Implementasi |
|---|---|
| DOCX | Tab stop di right margin (9026 DXA untuk A4 dengan 1" margin) |
| PDF (`@react-pdf/renderer`) | `flexDirection: 'row'`, `justifyContent: 'space-between'` |

Baris yang menggunakan two-column layout:
- Education: `Institution` ↔ `Period`
- Experience: `Role, Org \| Location` ↔ `Period`
- Project: `Name – Link` ↔ `Year`

---

### 9.10 Spacing Reference

| Gap | Value |
|---|---|
| Antar section | 10pt before heading |
| Heading → konten pertama | 4pt |
| Antar entry (dalam section) | 6pt |
| Antar bullet point | 2pt |
| Profile header → section pertama | 6pt |

---

## 10. Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand + persist middleware (→ localStorage) |
| Drag & Drop | dnd-kit |
| PDF Export | @react-pdf/renderer |
| DOCX Export | docx (npm) |
| Storage | localStorage (no backend) |
| Deployment | Vercel |

---

## 11. Development Roadmap

### Phase 1 — Data Foundation & CRUD

- Setup Next.js + TypeScript + Tailwind + Zustand
- Definisi TypeScript interface untuk semua schema
- Zustand store dengan persist ke localStorage
- Form CRUD: Profile, About Me, Education, Experience (Pro & Org), Projects, Skills
- Validasi form sederhana (required fields)

### Phase 2 — Library & Canvas Preview

- Library view — semua entries per section, filter aktif/library
- Active/library toggle per entry
- CV Canvas — layout preview dengan 7 section fix
- Drag & drop reorder entries dalam section (dnd-kit)
- Real-time preview update saat data berubah

### Phase 3 — Multi-version CV

- UI buat CV version baru + rename + delete
- Version switcher di header/sidebar
- Include/exclude entries per version
- Simpan `sectionOrder` dan `skillOrder` per version
- Preview otomatis switch sesuai version aktif

### Phase 4 — Export & Backup

- PDF export via `@react-pdf/renderer` — A4, template fix sesuai struktur CV Salomo
- DOCX export via `docx` library — formatting konsisten
- JSON export (backup seluruh data store)
- JSON import + restore dengan konfirmasi overwrite

---

## 12. Assumptions & Constraints

### 11.1 Assumptions

- 7 section fix dan tidak akan berubah urutan/namanya
- Hanya digunakan di satu browser / device (localStorage cukup)
- Template PDF/DOCX visual tidak perlu dikustomisasi
- Tidak ada requirement sync real-time antar device
- Foto profil tidak diperlukan di CV

### 11.2 Constraints

- localStorage limit ~5MB — cukup untuk ratusan entries teks
- PDF/DOCX styling dikunci — tidak ada custom font/layout per user
- Data tidak bisa diakses dari device lain tanpa JSON backup manual

---

## 13. Open Questions

| # | Question | Notes |
|---|---|---|
| 1 | Apakah DOCX output perlu bisa diedit lagi setelah export? | Atau hanya format backup? Berpengaruh ke approach styling DOCX |
| 2 | Apakah Skill category bisa ditambah/rename bebas? | Atau fix 4 category: Soft Skills, Technical Skills, Tools, Framework? |
| 3 | Format `period`: string bebas atau structured (start/end month+year)? | Structured lebih mudah untuk sorting tapi form lebih kompleks |
| 4 | Apakah About Me bisa berbeda per CV version? | Saat ini diasumsikan sama di semua version (bagian dari Profile singleton) |