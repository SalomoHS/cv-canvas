# CV Canvas — Curriculum Vitae Visual Authoring System

CV Canvas is a web-based CV/resume builder that lets you create, manage, and export professional CVs with real-time preview. Write once, reuse across multiple versions, and export to PDF or DOCX.

## Overview

CV Canvas helps you manage your career profile through a library-based approach. You create entries for your education, experience, projects, and skills once, then assemble them into different CV versions — each tailored for a specific job or opportunity. Entries can be toggled between your library (drafts) and active versions, reordered with drag-and-drop, and organized into grouped collections called Crates.

Built with Next.js and PostgreSQL, CV Canvas runs locally via Docker.

## Features

- **Profile Management** — Store and edit your personal details, contact info, and social/portfolio links.
- **Section Editors** — Dedicated editors for Education, Experience (professional & organizational), Projects, and Skills.
- **Entry Library** — Maintain a reusable library of entries. Toggle each entry between "library" (draft) and active status per CV version.
- **CV Versioning** — Create multiple named versions of your CV, each with its own set of entries and ordering.
- **Crates** — Group related CV versions into Crates (e.g., by job type or industry) for better organization.
- **Drag-and-Drop Reordering** — Reorder entries within sections and rearrange skill items with drag-and-drop.
- **Real-Time Preview** — See your CV rendered as you edit, with live updates.
- **Multiple Summaries** — Write and manage multiple professional summary/profile texts.
- **Export** — Export any CV version as PDF or DOCX. Both formats use clean, ATS-friendly formatting (standard fonts, proper heading hierarchy, simple layouts) for maximum compatibility with applicant tracking systems.
- **Backup & Restore** — Export your entire data as JSON and restore it later.
- **Search & Sort** — Quickly find CV versions and Crates with search and sort controls.
- **Docker Support** — Full Docker Compose setup with PostgreSQL for one-command startup.

## CV Sections

Each CV version is composed of the following sections, rendered in a clean, professional order:

| Section | Description |
|---------|-------------|
| **Profile** | Personal details — name, phone, email, location, and social/portfolio links. |
| **About Me** | One or more professional summary/profile texts; you can select which one to use per CV version. |
| **Education** | Academic background — institution, degree, field of study, GPA, and relevant coursework. |
| **Professional Experience** | Work history with role, organization, location, period, and bullet-point achievements. |
| **Organizational Experience** | Non-professional experience (volunteer, clubs, committees) with the same structure as professional experience. |
| **Projects** | Personal or academic projects with name, link, year, and bullet-point descriptions. |
| **Skills** | Categorized technical skills (e.g., languages, frameworks, tools) organized into groups. |

All sections (except Profile and About Me) use the **entry library** system — create entries once, then toggle them between library (draft) and active status per CV version. Entries can be reordered with drag-and-drop within each section.

### ATS Compatibility

The PDF and DOCX export templates are designed to be **ATS-friendly**:
- **Standard fonts** — Times New Roman / Times-Roman at 11pt body, 14pt name
- **Clean hierarchy** — Section headings with subtle bottom borders, consistent spacing
- **Simple layouts** — Two-column format (content + dates) without tables or complex structures
- **Proper bullet points** — Standard bullet characters that parse correctly
- **Hyperlinks** — Standard inline links in DOCX, footnote-style in PDF

This ensures your CV can be reliably parsed by applicant tracking systems while still looking polished for human readers.

## Install
Clone the repository:

```bash
git clone https://github.com/isalo/cv-canvas.git
```

Navigate to the project directory:

```bash
cd cv-canvas
```

Run the entire stack (app + PostgreSQL database) with Docker Compose.

```bash
docker compose up -d --build
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Services

Docker Compose runs three services:

| Service | Description |
|---------|-------------|
| `db` | PostgreSQL 16 database |
| `migrate` | Runs Prisma migrations on startup |
| `app` | Next.js application |

The `migrate` service runs automatically before the app starts. If you need to run migrations manually:

```bash
# Build and run migrations only
docker compose build migrate
docker compose run migrate
```

### Environment

Environment variables are configured in [`.env.docker`](file:///c:\Users\isalo\Documents\Projects\cvvas\.env.docker):

```.env.docker
DATABASE_URL=postgresql://postgres:postgres@db:5432/cvvas
```

```bash
copy .env.docker .env.local
```

### Resource Limits

The Docker Compose configuration is optimized for systems with 1 CPU and 2GB RAM:

- **App**: 1 CPU, 1.5GB RAM max
- **Database**: 0.5 CPU, 512MB RAM max

## Local Development with AI

This project includes an [`AGENTS.md`](file:///c:\Users\isalo\Documents\Projects\cvvas\AGENTS.md) file that provides structured project context for AI-assisted development ("vibe coding"). It covers the project architecture, tech stack, coding conventions, database schema, API routes, and key rules to follow.

When using AI coding tools locally, reference `AGENTS.md` to ensure the AI understands the project's specific patterns and avoids common pitfalls (e.g., using the correct Prisma client path, handling JSON columns properly, or respecting the fixed section order).
