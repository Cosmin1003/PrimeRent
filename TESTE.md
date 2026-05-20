# Teste Automate — PrimeRent

## Prezentare generală

Proiectul folosește **Vitest** (framework de testare nativ pentru Vite) împreună cu **React Testing Library** pentru testarea componentelor React. Testele sunt organizate în directorul `src/test/`.

## Cum rulez testele

```bash
# Rulare toate testele (single run)
npm run test:run

# Rulare teste în mod watch (re-rulează la fiecare modificare)
npm run test

# Rulare teste cu raport de acoperire (coverage)
npm run test:coverage
```

## Structura testelor

```
src/test/
├── setup.ts              ← Configurare globală (jest-dom matchers)
├── mocks/
│   └── supabase.ts       ← Mock pentru clientul Supabase
├── utils.test.ts         ← Teste unitare: funcția cn()
├── amenity.test.ts       ← Teste unitare: getAmenityDetails()
├── booking.test.ts       ← Teste unitare: calcul preț & disponibilitate
├── HomePage.test.tsx     ← Teste componente: pagina principală
├── Navbar.test.tsx       ← Teste componente: bara de navigare
└── ExplorePage.test.tsx  ← Teste integrare: pagina de explorare
```

## Tipuri de teste

### 1. Teste unitare (Unit Tests)

Testează funcții izolate, fără dependențe externe.

#### `utils.test.ts` — Funcția `cn()` (6 teste)
- Verifică merge-uirea claselor CSS cu Tailwind
- Testează rezolvarea conflictelor Tailwind (ex: `px-4` + `px-6` → `px-6`)
- Testează valori condiționale (false/null/undefined sunt ignorate)
- Testează input gol

#### `amenity.test.ts` — Funcția `getAmenityDetails()` (7 teste)
- Verifică returnarea iconului și descrierii pentru fiecare amenity
- Testează fallback-ul pentru amenități necunoscute
- Validează toate cele 20 de amenități definite

#### `booking.test.ts` — Logica de rezervare (13 teste)
- **Calcul preț:** verifică formula `(preț/noapte × nr_nopți) + taxa curățenie`
- Testează cazuri limită: 0 nopți, date invalide, prețuri zecimale
- **Disponibilitate date:** verifică dacă intervalul selectat se suprapune cu rezervări existente
- Testează overlap parțial, overlap total, și cazul check-out = check-in (permis)

### 2. Teste de componente (Component Tests)

Testează render-ul componentelor React în izolare, cu mock-uri pentru Supabase și i18next.

#### `HomePage.test.tsx` — Pagina principală (5 teste)
- Verifică render-ul input-ului de căutare
- Verifică butonul "Search"
- Verifică secțiunea "How it works"
- Verifică secțiunea "Top-Rated Stays"
- Verifică textul titlului din hero (h1 cu "Find your next extraordinary stay")

#### `Navbar.test.tsx` — Bara de navigare (4 teste)
- Verifică logo-ul (imagine cu alt text corect)
- Verifică butonul "Log in" pentru utilizatori neautentificați
- Verifică link-urile de navigare pentru utilizatori autentificați
- Verifică link-ul "Explore" cu href corect

### 3. Teste de integrare (Integration Tests)

Testează fluxuri complete cu interacțiuni între componente și apeluri API mockuite.

#### `ExplorePage.test.tsx` — Pagina de explorare (5 teste)
- Verifică render-ul elementelor de căutare
- Verifică apelul RPC `search_properties` la încărcare
- Testează căutarea AI (smart-search edge function)
- Verifică afișarea proprietăților returnate de API
- Verifică starea goală când nu sunt rezultate

## Cum funcționează mock-urile

### Supabase Mock
Clientul Supabase este complet mocuit cu `vi.mock()`. Toate apelurile către baza de date returnează date predefinite, fără a necesita o conexiune reală. Exemplu:

```typescript
vi.mock("@/supabaseClient", () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn().mockReturnValue({ select: vi.fn()... }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));
```

### i18next Mock
Traducerile sunt mockuite cu un obiect simplu care returnează textul în engleză:

```typescript
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => translations[key] || key }),
}));
```

### Leaflet Mock
Componentele de hartă sunt mockuite pentru a evita probleme cu DOM-ul în mediul de test (jsdom nu suportă Canvas/WebGL).

## Configurare tehnică

- **Framework:** Vitest 4.x (integrat nativ cu Vite)
- **Environment:** jsdom (simulare browser în Node.js)
- **Matchers:** @testing-library/jest-dom (toBeInTheDocument, toHaveAttribute etc.)
- **Rendering:** @testing-library/react (render, screen, fireEvent, waitFor)
- **Mocking:** vi.mock, vi.fn, vi.hoisted (pentru variabile în factory functions)

## Rezultate

```
 Test Files  6 passed (6)
      Tests  40 passed (40)
   Duration  ~10s
```

## Adăugare teste noi

Pentru a adăuga un test nou, creează un fișier `*.test.ts` sau `*.test.tsx` în `src/test/` și va fi detectat automat de Vitest. Exemplu minimal:

```typescript
import { describe, it, expect } from "vitest";

describe("Funcția mea", () => {
  it("returnează valoarea corectă", () => {
    expect(1 + 1).toBe(2);
  });
});
```
