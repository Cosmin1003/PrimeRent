import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock supabase before importing components
vi.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: "guest", full_name: "Test User" }, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          neq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "home.heroTitle1": "Find your next",
        "home.heroTitle2": "extraordinary",
        "home.heroTitle3": "stay",
        "home.searchPlaceholder": "Where do you want to go?",
        "home.search": "Search",
        "home.popularDestinations": "Popular Destinations",
        "home.topRatedStays": "Top-Rated Stays",
        "home.howItWorks": "How it works",
        "home.propertiesAvailable": `${options?.count || 0} properties available now`,
        "navbar.explore": "Explore",
        "navbar.favorites": "Favorites",
        "navbar.myBookings": "My Bookings",
        "navbar.logIn": "Log in",
        "navbar.signOut": "Sign Out",
      };
      return translations[key] || key;
    },
    i18n: { changeLanguage: vi.fn(), language: "en" },
  }),
  Trans: ({ children }: any) => children,
}));

import HomePage from "@/pages/HomePage";

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the hero section with search input", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByPlaceholderText("Where do you want to go?")).toBeInTheDocument();
  });

  it("renders the search button", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Search")).toBeInTheDocument();
  });

  it("renders the how it works section", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("How it works")).toBeInTheDocument();
  });

  it("renders top-rated stays section heading", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Top-Rated Stays")).toBeInTheDocument();
  });

  it("renders the hero title text", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Title is split across elements, use a function matcher
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("Find your next");
    expect(heading.textContent).toContain("extraordinary");
    expect(heading.textContent).toContain("stay");
  });
});
