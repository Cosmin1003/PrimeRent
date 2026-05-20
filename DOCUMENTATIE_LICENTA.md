# Documentație Licență — PrimeRent
## Platformă Web de Închirieri Imobiliare pe Termen Scurt

---

## REZUMAT PROIECT

**Titlu sugerat:** „PrimeRent – Platformă web pentru închirieri imobiliare pe termen scurt cu funcționalități de inteligență artificială"

**Tehnologii principale:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS 4, Radix UI / Shadcn/ui
- Backend-as-a-Service: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Vector Embeddings)
- Hărți: Leaflet + react-leaflet
- Internaționalizare: i18next (RO/EN)
- AI/ML: OpenAI via Supabase Edge Functions (generare descrieri, sumarizare review-uri, căutare semantică cu embeddings)
- Hosting: Vercel
- Autentificare: Supabase Auth cu Google OAuth
- Plăți: Stripe (via Edge Function `create-checkout`)

**Tipuri de utilizatori:** Guest (oaspete), Host (gazdă), Admin

---

## CUPRINS PROPUS (≈50 pagini)

---

### 1. INTRODUCERE (3-4 pagini)

**Ce să scrii:**
- Contextul general al domeniului (piața de închirieri pe termen scurt, creșterea platformelor tip Airbnb/Booking)
- Motivația alegerii temei (digitalizare, turism, nevoia de platforme moderne)
- Obiectivele lucrării (dezvoltarea unei platforme full-stack, integrarea AI, UX modern)
- Structura lucrării (prezentare pe scurt a capitolelor)

**Sfaturi:**
- Menționează statistici despre piața de închirieri (Statista, AirDNA)
- Subliniază elementul diferențiator: integrarea AI (generare descrieri, căutare semantică, sumarizare review-uri)

---

### 2. ANALIZA DOMENIULUI ȘI A SOLUȚIILOR EXISTENTE (4-5 pagini)

**Ce să scrii:**
- Prezentarea pieței de vacation rentals (Airbnb, Booking.com, Vrbo)
- Analiza comparativă a platformelor existente (tabel cu funcționalități)
- Identificarea lacunelor/oportunităților (lipsă AI, UI complexe, limitări pentru gazde mici)
- Cerințele utilizatorilor (ce așteaptă un guest, ce așteaptă un host)
- Justificarea dezvoltării PrimeRent (nișă, tehnologii moderne, AI integrat)

**Tabel comparativ sugerat:**

| Funcționalitate | Airbnb | Booking | PrimeRent |
|---|---|---|---|
| Căutare semantică AI | ❌ | ❌ | ✅ |
| Generare descrieri AI | ❌ | ❌ | ✅ |
| Sumarizare review-uri AI | ❌ | ❌ | ✅ |
| Open source | ❌ | ❌ | ✅ |
| Hărți interactive | ✅ | ✅ | ✅ |
| Multi-language | ✅ | ✅ | ✅ (RO/EN) |

---

### 3. TEHNOLOGII ȘI INSTRUMENTE UTILIZATE (6-7 pagini)

**Ce să scrii:**

#### 3.1 Frontend (2-3 pagini)
- **React 18** – componentizare, hooks, JSX, virtual DOM
- **TypeScript** – tipizare statică, avantaje în proiecte mari
- **Vite** – bundler modern, HMR, build rapid vs Webpack
- **Tailwind CSS 4** – utility-first, responsive design, dark mode ready
- **Radix UI / Shadcn/ui** – componente accesibile, headless UI
- **React Router v7** – routing client-side, rute dinamice, nested routes
- **Leaflet / react-leaflet** – hărți interactive, markere, tile layers

#### 3.2 Backend (2 pagini)
- **Supabase** – alternativă open-source la Firebase
  - PostgreSQL (baza de date relațională)
  - Row Level Security (RLS) – securitate la nivel de rând
  - Supabase Auth (OAuth, email/password)
  - Supabase Storage (imagini proprietăți)
  - Edge Functions (Deno, serverless)
  - Vector Embeddings (pgvector, căutare semantică)
- **Stripe** – procesare plăți securizate

#### 3.3 Inteligență Artificială (1-2 pagini)
- **OpenAI API** (GPT-4 / text-embedding-ada-002)
- Edge Function `generate-listing` – generare titlu + descriere din date + imagine
- Edge Function `smart-search` – căutare semantică cu embeddings vectoriali
- Edge Function `summarize-reviews` – sumarizare review-uri cu pro/contra
- Edge Function `generate-embeddings` – generare batch embeddings pentru proprietăți

#### 3.4 Deployment & DevOps (1 pagină)
- **Vercel** – hosting frontend, CI/CD automat din Git
- **Supabase Cloud** – hosting backend, edge functions globally distributed
- **Git/GitHub** – version control

---

### 4. ANALIZA CERINȚELOR ȘI PROIECTARE (5-6 pagini)

**Ce să scrii:**

#### 4.1 Cerințe funcționale (2 pagini)
Lista detaliată pe categorii de utilizator:

**Guest:**
- Înregistrare/autentificare (email + Google OAuth)
- Căutare proprietăți (locație, date, nr. oaspeți, facilități)
- Căutare semantică AI ("cabin cozy with mountain view")
- Vizualizare proprietate (galerie foto, facilități, reviews, hartă)
- Rezervare cu calendar de disponibilitate
- Plată online (Stripe)
- Gestionare rezervări (vizualizare, anulare)
- Adăugare review-uri (rating + comentariu)
- Sistem de favorite
- Profil utilizator editabil
- Upgrade la rol de gazdă

**Host:**
- Creare listing (formular + hartă + upload imagini + AI generare descriere)
- Editare/ștergere listing-uri
- Gestionare rezervări (acceptare/refuzare)
- Dashboard dedicat

**Admin:**
- Generare embeddings batch pentru căutare semantică

#### 4.2 Cerințe non-funcționale (1 pagină)
- Performanță (Vite build, lazy loading)
- Securitate (RLS Supabase, OAuth, env variables)
- Scalabilitate (Serverless edge functions)
- Accesibilitate (Radix UI, semantică HTML)
- Responsivitate (mobile-first, Tailwind breakpoints)
- Internaționalizare (EN/RO)

#### 4.3 Diagrama bazei de date (1-2 pagini)
- Schema ER cu tabelele: profiles, properties, bookings, reviews, amenities, property_amenities, property_images, favorites
- Relații (1:N, N:M)
- Descrierea fiecărui tabel + câmpuri

**Tabele principale:**
```
profiles: id, role(guest/host/admin), full_name, phone_number, birth_date, avatar_url
properties: id, title, description, city, address, lat, lng, price_per_night, max_guests, 
            main_image, host_id, avg_rating, bedrooms, beds, bathrooms, is_active
bookings: id, check_in, check_out, total_price, status(pending/confirmed/cancelled/completed), 
          property_id, guest_id
reviews: id, property_id, guest_id, rating, comment, created_at
amenities: id, name
property_amenities: property_id, amenity_id (join table)
property_images: id, property_id, image_url
favorites: property_id, profile_id
```

#### 4.4 Diagrama de arhitectură (1 pagină)
- Client (React/Vite) → Supabase API → PostgreSQL
- Client → Supabase Edge Functions → OpenAI API
- Client → Supabase Storage (imagini)
- Client → Stripe (checkout)
- Vercel CDN → Client

---

### 5. IMPLEMENTARE (14-16 pagini) ⭐ Capitolul principal

**Ce să scrii:**

#### 5.1 Structura proiectului (1-2 pagini)
- Organizarea fișierelor (pages/, components/, hooks/, types/, i18n/, lib/)
- Convenții de denumire
- Componente reutilizabile (ui/)
- Custom hooks (useFavorite)

#### 5.2 Autentificare și gestiune utilizatori (2 pagini)
- Flux de autentificare (Supabase Auth + Google OAuth)
- Managementul sesiunii (useEffect, onAuthStateChange)
- Role-based access (guest/host/admin)
- Navbar condiționat pe rol
- Protecția rutelor

#### 5.3 Pagina de explorare și căutare (2-3 pagini)
- Filtre multiple (locație, date, guests, amenities)
- RPC `search_properties` – query complex cu verificare disponibilitate
- Sortare (preț, rating)
- Vizualizare listă vs. hartă (PropertiesMap cu Leaflet)
- **Căutare semantică AI** – Edge Function `smart-search`, vector embeddings, pgvector
- UI: pill-shaped search bar, popovers, dialogs

#### 5.4 Pagina de proprietate și rezervare (2-3 pagini)
- Galerie foto cu lightbox (navigare tastatura)
- Calendar de disponibilitate (date blocate din bookings existente)
- Calculare preț dinamic (nopți × tarif + cleaning fee)
- Integrare Stripe checkout (Edge Function `create-checkout`)
- **Sumarizare AI a review-urilor** – Edge Function `summarize-reviews`
- Secțiunea de review-uri cu rating vizual

#### 5.5 Crearea și gestionarea listing-urilor (2-3 pagini)
- Formular multi-secțiune (info generală, poze, locație, preț, facilități)
- Upload imagini în Supabase Storage
- Picker locație pe hartă (click → lat/lng)
- **Generare descriere cu AI** – Edge Function `generate-listing` (text + imagine base64)
- Mod editare vs. creare (preîncărcare date existente)
- Gestionare listing-uri (CRUD complet)

#### 5.6 Sistemul de rezervări (2 pagini)
- Flux guest: selectare date → verificare disponibilitate → checkout Stripe
- Flux host: vizualizare pending → accept/decline
- Anulare rezervare (guest)
- Statusuri: pending → confirmed → completed / cancelled
- Adăugare review post-completare

#### 5.7 Funcționalități AI (2-3 pagini) ⭐ Element diferențiator
- **Arhitectura Edge Functions** (Deno runtime, cold starts, invocation)
- **Generare descrieri** – prompt engineering, multimodal (text + imagine)
- **Căutare semantică** – text-embedding-ada-002, cosine similarity, pgvector
- **Sumarizare review-uri** – extragere pro/contra din text liber
- **Generare batch embeddings** – admin panel, procesare 50 proprietăți/batch
- Diagrama flux AI: User Query → Edge Function → OpenAI → Vector DB → Results

#### 5.8 Internaționalizare (0.5 pagini)
- i18next setup, detecție limbă browser
- Fișiere de traducere (en.json, ro.json)
- Hook `useTranslation()` în componente

#### 5.9 Componente UI reutilizabile (1 pagină)
- Sistem Shadcn/ui (Button, Card, Dialog, Calendar, etc.)
- Radix UI primitives (accesibilitate, composability)
- Tailwind utility classes + tw-merge

---

### 6. TESTARE ȘI VALIDARE (3-4 pagini)

**Ce să scrii:**
- Testare manuală – scenarii principale per rol
- Testare responsivitate (Chrome DevTools, dispozitive reale)
- Testare cross-browser (Chrome, Firefox, Safari, Edge)
- Validare formulare (câmpuri obligatorii, limite)
- Testare flux de autentificare (email, Google)
- Testare căutare AI (diverse query-uri naturale)
- Captură ecran cu rezultate (screenshots din aplicație)
- Performanță (Lighthouse scores, Core Web Vitals)

**Scenarii de test sugerate:**
1. Înregistrare utilizator nou → verificare profil creat
2. Căutare "Bucharest, 2 guests, next week" → verificare rezultate
3. Căutare AI "cozy apartment near the beach for a couple" → verificare relevanță
4. Creare listing cu AI description → verificare calitate text generat
5. Rezervare completă → verificare status booking
6. Accept/decline booking ca host
7. Adăugare review + verificare AI summary

---

### 7. DEPLOYMENT ȘI CONFIGURARE (2-3 pagini)

**Ce să scrii:**
- Setup Vercel (import din GitHub, env variables, auto-deploy)
- Configurare Supabase project (tabele, RLS policies, storage buckets)
- Edge Functions deployment
- Variabile de mediu necesare:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - Stripe keys (în Edge Functions)
  - OpenAI API key (în Edge Functions)
- Domeniu custom (dacă este cazul)
- CI/CD pipeline (push → build → deploy automat)

---

### 8. MANUAL DE UTILIZARE (4-5 pagini)

**Ce să scrii:**
- Captură ecran + explicație pentru fiecare flux principal:

#### 8.1 Flux Guest (2-3 pagini)
1. Pagina principală – căutare destinație
2. Explorare – filtre, sortare, vizualizare hartă
3. Proprietate – galerie, detalii, review-uri
4. Rezervare – selectare date, plată
5. Gestionare rezervări – vizualizare, anulare
6. Favorite – adăugare/eliminare
7. Profil – editare informații

#### 8.2 Flux Host (1-2 pagini)
1. Upgrade la host
2. Creare listing (cu AI)
3. Gestionare listing-uri
4. Acceptare/refuzare rezervări

#### 8.3 Flux Admin (0.5 pagini)
1. Generare embeddings batch

---

### 9. CONCLUZII ȘI DEZVOLTĂRI VIITOARE (2-3 pagini)

**Ce să scrii:**

#### 9.1 Concluzii
- Obiective atinse (platformă funcțională, AI integrat, UX modern)
- Tehnologii validate (React + Supabase = development rapid)
- Provocări întâmpinate (integrare AI, calendar disponibilitate, Leaflet în Vite)
- Lecții învățate

#### 9.2 Dezvoltări viitoare
- Sistem de mesagerie în timp real (Supabase Realtime)
- Notificări push (email + in-app)
- Aplicație mobilă (React Native)
- Sistem de dispute și refund
- Analytics dashboard avansat pentru gazde
- Verificare identitate (KYC)
- Calendar sync (Google Calendar, iCal)
- Politici de anulare configurabile
- Sistem de recomandări bazat pe ML
- PWA (Progressive Web App)

---

### 10. BIBLIOGRAFIE (1-2 pagini)

**Surse sugerate:**
- React Documentation (react.dev)
- Supabase Documentation (supabase.com/docs)
- TypeScript Handbook (typescriptlang.org)
- Tailwind CSS Documentation (tailwindcss.com)
- OpenAI API Reference (platform.openai.com)
- Vite Documentation (vite.dev)
- Leaflet Documentation (leafletjs.com)
- Stripe Documentation (stripe.com/docs)
- Radix UI (radix-ui.com)
- i18next Documentation (i18next.com)
- Vercel Documentation (vercel.com/docs)
- PostgreSQL + pgvector (github.com/pgvector/pgvector)
- Articole științifice despre:
  - Semantic search / vector embeddings
  - Modern web application architecture
  - Serverless computing
  - Natural Language Processing

---

### 11. ANEXE (2-3 pagini)

- Diagrama ER completă (generată din schema DB)
- Diagrama de arhitectură (draw.io / Mermaid)
- Capturi ecran suplimentare
- Fragment de cod relevant (Edge Function AI)
- Structura fișierelor proiect

---

## TOTAL ESTIMAT: ~50 pagini

| Capitol | Pagini |
|---------|--------|
| 1. Introducere | 3-4 |
| 2. Analiză domeniu | 4-5 |
| 3. Tehnologii | 6-7 |
| 4. Cerințe și proiectare | 5-6 |
| 5. Implementare | 14-16 |
| 6. Testare | 3-4 |
| 7. Deployment | 2-3 |
| 8. Manual utilizare | 4-5 |
| 9. Concluzii | 2-3 |
| 10. Bibliografie | 1-2 |
| 11. Anexe | 2-3 |
| **TOTAL** | **46-58** |

---

## SFATURI GENERALE

1. **Screenshots** – Pune cât mai multe capturi ecran, mai ales în cap. 5 și 8. Ocupă spațiu și arată concret.
2. **Diagrame** – Folosește draw.io sau Mermaid pentru: ER diagram, arhitectură, flux utilizator, secvență AI.
3. **Cod** – Include fragmente relevante (nu tot codul!) cu syntax highlighting. Ex: Edge Function AI, componenta de căutare, hook useFavorite.
4. **Figuri numerotate** – "Figura 5.3 – Interfața de explorare cu filtre active"
5. **AI = Punct forte** – Subliniază constant elementul AI ca diferențiator. Profesorii apreciază inovația.
6. **Responsive** – Menționează explicit că aplicația e responsive (mobile/tablet/desktop).
7. **Securitate** – Menționează RLS, OAuth, env variables, validări – arată că te-ai gândit la security.
8. **Font/Formatting** – Times New Roman 12pt, 1.5 line spacing, margini 2.5cm (verifică cu cerințele facultății).
