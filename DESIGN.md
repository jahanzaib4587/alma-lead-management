# 📐 Project Design Document – alma-lead-management

## 🧭 Overview
This document outlines the architectural and design decisions for the `alma-lead-management` system, a lead intake and management platform built with Next.js and Supabase.

---

## ⚙️ Tech Stack Rationale

| Layer | Tech Used | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 13 (App Router) | Server-rendering, routing flexibility, edge-ready deployment |
| Styling | Tailwind CSS | Utility-first, responsive design with scalable custom components |
| State Management | Redux Toolkit | Predictable, global state with dev tooling and immutability guarantees |
| Forms | React Hook Form + Zod | Lightweight, performant form control with schema-based validation |
| Backend | Supabase | Scalable PostgreSQL backend with RESTful and Realtime APIs |
| Auth | NextAuth.js (if used) | Provider-based secure authentication |

---

## 🏛️ Folder Structure

```bash
├── components/          # UI components (forms, buttons, layout)
├── store/               # Redux slices and selectors
├── pages/               # Next.js route handlers
├── utils/               # Helper functions
├── styles/              # Tailwind configuration and global styles
├── public/              # Static assets
```

---

## 🧩 Architecture

### Client-Side
- **Component-driven UI** using reusable, accessible React components
- **Form flows** driven by `react-hook-form` with real-time validation via Zod
- **Role-based views** (admin vs user)
- **Global state** managed in Redux store for leads, session, and UI state

### Backend (Supabase)
- **Leads Table** for storing submissions
- **Row-level security (RLS)** enabled (planned)
- **Realtime features** can later be leveraged to push updates to admin

---

## 🖼️ UI/UX Design
- Designed with accessibility (WCAG AA) and responsiveness in mind
- Layouts built using Tailwind's grid and flex utilities
- Custom components created for:
  - File upload box
  - Visa category checkboxes
  - Message textarea with prompt

---

## 🛡️ Security Considerations
- Supabase anon key is stored in `.env.local` and excluded from Git
- Keys are rotated if leaked (initial `.env` push incident handled)
- Future: Admin authentication layer with session tokens (NextAuth)

---

## 🔌 Future Enhancements
- Migrate to Supabase RLS & custom Postgres functions
- Admin analytics dashboard with charts (Recharts / Chart.js)
- Form autosave with local/sessionStorage fallback
- Unit + E2E tests using Jest + Playwright

---

## 🧑‍💻 Contributors
This design document is maintained by the engineering team to support maintainability, scalability, and onboarding. 