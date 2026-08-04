# Product Requirements Document (PRD)
## Sales Canvassing App — "CanvasGo" (working name)

**Version:** 1.0
**Date:** 4 August 2026
**Author:** Product Team
**Status:** Draft for review

---

## 1. Background & Problem Statement

Sales teams currently log canvassing/prospecting visits manually (chat, spreadsheet, or paper notes). This is slow, inconsistent, easy to lose, and hard for managers to track follow-ups or measure rep activity. Sample raw data currently looks like this:

```
Lokasi     : Apollo Wu Artisan
Product    : Kontakami
PIC        : Ibu Stephany (Mgr Marketing)
Email      : management@apolloartisan.com
No. HP     : 081355555312
Sistem eksisting : Chope
Website    : https://apollowuartisan.com
Note       : Diminta kirim Company Profile dahulu ke email.
```

We need a **simple, mobile-first app** that lets a sales rep log a canvassing visit in under a minute, right from the field, including a photo of the visit/location, with data centralized for management visibility.

---

## 2. Goals & Objectives

| Goal | Why it matters |
|---|---|
| Make logging a visit take < 60 seconds | Reps won't use a tool that slows them down |
| Fast load (< 2s on 4G, works on low-end Android) | Field reps often have weak connectivity |
| Capture standardized, structured data | Enables reporting & follow-up tracking |
| Allow photo upload per activity | Proof of visit, visual reference (storefront, signage, business card) |
| Give managers a simple dashboard | Track team activity & pipeline without asking reps individually |

### Non-goals (out of scope for v1)
- Full CRM features (deal stages, invoicing, contracts)
- Route optimization / map-based territory planning
- Multi-language support (Bahasa Indonesia only for v1)
- Integrations with external CRM/ERP (future phase)

---

## 3. Target Users

| Persona | Description | Key need |
|---|---|---|
| **Sales Rep (Canvasser)** | Visits prospects daily, mostly on mobile, sometimes low signal | Fast entry, offline-friendly, minimal typing |
| **Sales Manager / Supervisor** | Reviews team activity, follow-ups, and leads | Simple list/dashboard, filter by rep/status/date |
| **Admin (optional, v1.1)** | Manages product list, users | Basic user & master-data management |

---

## 4. Core Features (MVP)

### 4.1 Quick Visit Log (Canvassing Entry)
Single-screen form, optimized for thumb use, minimal required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Perusahaan (Company) | Text | ✅ | e.g. "Apollo Wu Artisan" |
| Alamat (Address) | Text / Text area | Optional | Manual entry; can optionally auto-fill from GPS with a "use current location" shortcut |
| PIC | Text | ✅ | e.g. "Ibu Stephany" |
| Jabatan (Position) | Text | Optional | e.g. "Mgr Marketing" |
| Email | Text (email keyboard) | Optional | Validated format |
| Contact Number | Text (numeric keyboard) | Optional | Validated format, tap-to-call |
| Sistem Existing (existing system) | Text/Dropdown | Optional | e.g. "Chope" — competitor/incumbent system in use |
| Website | Text (URL) | Optional | Tap-to-open |
| Produk Kontakami yang Ditawarkan | Multi-select (checklist) | ✅ | Pick one or more Kontakami products offered during the visit, from a product master list |
| Next Time (next follow-up) | Date picker | Optional | Sets the follow-up reminder date |
| Catatan (Notes) | Free text | Optional | e.g. "Diminta kirim Company Profile dahulu ke email" |
| Visit Photo | Camera/Gallery upload | Optional but encouraged | 1–3 photos, auto-compressed |
| Rep Name / Timestamp | Auto-filled | Auto | From logged-in user + device time |

**Note on this version:** Fields now follow your list exactly (Perusahaan, Alamat, PIC, Jabatan, Email, Contact Number, Sistem Existing, Website, Produk Kontakami yang Ditawarkan, Next Time, Catatan), plus **Visit Photo** and **Rep/Timestamp** kept as auto/optional since they were part of the original brief (photo upload, fast mobile logging). The earlier "Visit Outcome/Status" and separate GPS auto-tag fields have been removed/folded in — "Next Time" now carries the follow-up role, and location can optionally be pulled into "Alamat" instead of being a hidden field.

### 4.2 Photo Capture
- Direct camera access or choose from gallery
- Auto-compress before upload (keep it fast on weak networks)
- Multiple photos per visit (max 3 for v1, to keep upload light)
- Thumbnail preview before submit, tap to remove

### 4.3 Visit History / My Activities
- List view of all visits logged by the current rep (most recent first)
- Each entry shows: business name, product, status badge, date, thumbnail
- Tap to view full detail / edit within same day
- Search/filter by date range, status, product

### 4.4 Manager Dashboard (simplified, view-only for v1)
- Table/list of all reps' visits, filterable by rep, date, status, product
- Summary counters: total visits today/week, by status (e.g. 5 "Need Follow-up")
- Export to Excel/CSV (for reporting outside the app)

### 4.5 Offline Support (important for field use)
- Form can be filled and saved locally if no connection
- Auto-syncs when back online
- Visual indicator (e.g. "queued, will sync") so reps trust their data isn't lost

### 4.6 Authentication
- Simple email/phone + password or OTP login
- Session stays logged in (avoid re-login friction in field)

---

## 5. User Flow (MVP)

```
Login → Home (Visit List) → [+ New Visit]
   → Fill quick form → Add photo (optional) → Submit
   → Saved locally if offline → Auto-sync when online
   → Appears in "My Activities" + Manager Dashboard
```

---

## 6. UX / Design Principles

1. **One-thumb operation** — big tap targets, minimal scrolling, form fits mostly in one screen.
2. **Progressive disclosure** — only show Follow-up Date field if status requires it; don't overwhelm with all fields at once.
3. **Speed over polish** — skeleton loaders, optimistic UI (show entry as "saved" instantly, sync in background).
4. **Native-feeling inputs** — numeric keypad for phone, email keypad for email, camera shortcut front-and-center.
5. **Low data usage** — compress images client-side before upload; lazy-load history list.

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Initial load time | < 2 seconds on 4G, < 4s on 3G |
| App size (if PWA) | < 1MB initial bundle |
| Works offline | Yes, for form entry (queue & sync) |
| Photo upload size | Auto-compressed to < 500KB per photo |
| Device support | Android 8+, iOS 13+, modern mobile browsers |
| Data security | HTTPS, authenticated API, photos stored in access-controlled bucket |

---

## 8. Suggested Tech Stack (lightweight, fast-loading)

| Layer | Suggestion | Why |
|---|---|---|
| Frontend | Mobile-first PWA (React or plain HTML/JS) or React Native (if app-store presence needed) | PWA = instant install-free access, fastest to ship |
| Backend | Supabase or Firebase | Built-in auth, storage (for photos), realtime DB, minimal backend code |
| Storage | Firebase Storage / Supabase Storage | Handles photo uploads directly from mobile |
| Offline sync | IndexedDB (local queue) + background sync | Keeps entries safe without signal |
| Hosting | Vercel / Firebase Hosting | Fast global CDN for quick load times |

*(This can be adjusted based on your team's existing stack or in-house preferences.)*

---

## 9. Sample Data Entry (mapped to the model above)

| Field | Value |
|---|---|
| Perusahaan | Apollo Wu Artisan |
| Alamat | *(rep to fill / auto from GPS)* |
| PIC | Ibu Stephany |
| Jabatan | Mgr Marketing |
| Email | management@apolloartisan.com |
| Contact Number | 081355555312 |
| Sistem Existing | Chope |
| Website | https://apollowuartisan.com |
| Produk Kontakami yang Ditawarkan | *(select from product list, e.g. "Kontakami — Core")* |
| Next Time | *(rep to set, e.g. +3 days)* |
| Catatan | Diminta kirim Company Profile dahulu ke email |

---

## 10. Success Metrics

- % of visits logged same-day (target: >90%)
- Average time to log one visit (target: <60 sec)
- Manager weekly active usage of dashboard
- % of "Need Follow-up" visits actually followed up before due date

---

## 11. Roadmap / Phasing

| Phase | Scope |
|---|---|
| **MVP (v1)** | Quick visit log, photo upload, my activities list, basic manager dashboard, offline queue |
| **v1.1** | Admin panel (manage products/users), CSV export, push reminders for follow-ups |
| **v2** | Map view of visits, route planning, basic CRM pipeline stages, integrations |

---

## 12. Open Questions (for you to confirm)

1. Do you want a visit "Status" field back in (e.g. Interested / Not Interested / Closed) for reporting, or is "Next Time" + "Catatan" enough to track progress?
2. Should this be a PWA (fastest, no app store) or a native app (Play Store/App Store)?
3. Is there an existing Kontakami product master list (for the multi-select), or should reps be able to type product names freely?
4. Do reps need to work fully offline (no signal at all), or just on slow connections?
5. Any existing branding/colors to follow for the UI?

