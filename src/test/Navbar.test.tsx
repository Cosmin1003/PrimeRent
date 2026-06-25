import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock supabase
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
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "navbar.explore": "Explore",
        "navbar.exploreDestinations": "Explore Destinations",
        "navbar.favorites": "Favorites",
        "navbar.myBookings": "My Bookings",
        "navbar.dashboard": "Dashboard",
        "navbar.logIn": "Log in",
        "navbar.signOut": "Sign Out",
      };
      return translations[key] || key;
    },
    i18n: { changeLanguage: vi.fn(), language: "en" },
  }),
}));

import { Navbar1 } from "@/components/navbar1";

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo image with correct alt text", () => {
    render(
      <MemoryRouter>
        <Navbar1 user={undefined} />
      </MemoryRouter>
    );

    const logos = screen.getAllByAltText("PrimeRent Logo");
    expect(logos.length).toBeGreaterThanOrEqual(1);
    expect(logos[0]).toHaveAttribute("src", "/logo.webp");
  });

  it("shows login button when user is not authenticated", () => {
    render(
      <MemoryRouter>
        <Navbar1 user={undefined} />
      </MemoryRouter>
    );

    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("shows navigation links (Explore Destinations, Favorites, My Bookings)", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    render(
      <MemoryRouter>
        <Navbar1 user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText("Explore Destinations")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
  });

  it("renders Explore link pointing to /explore", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    render(
      <MemoryRouter>
        <Navbar1 user={mockUser} />
      </MemoryRouter>
    );

    const exploreLink = screen.getByText("Explore Destinations").closest("a");
    expect(exploreLink).toHaveAttribute("href", "/explore");
  });
});
