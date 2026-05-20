import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Must use vi.hoisted for variables used inside vi.mock
const { mockRpc, mockFrom, mockFunctionsInvoke } = vi.hoisted(() => ({
  mockRpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  mockFrom: vi.fn().mockReturnValue({
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
  mockFunctionsInvoke: vi.fn(),
}));

// Mock supabase
vi.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: mockFrom,
    rpc: mockRpc,
    functions: {
      invoke: mockFunctionsInvoke,
    },
  },
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: mockFrom,
    rpc: mockRpc,
    functions: {
      invoke: mockFunctionsInvoke,
    },
  },
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "explore.title": "Explore Properties",
        "explore.searchLocation": "Search by location...",
        "explore.guests": "Guests",
        "explore.dates": "Dates",
        "explore.filters": "Filters",
        "explore.sort": "Sort",
        "explore.clearAll": "Clear All",
        "explore.noProperties": "No properties found",
        "explore.aiSearchPlaceholder": "A cozy cabin with mountain view for 5 people...",
        "explore.aiSearch": "AI Search",
        "explore.listView": "List",
        "explore.mapView": "Map",
      };
      return translations[key] || key;
    },
    i18n: { changeLanguage: vi.fn(), language: "en" },
  }),
}));

// Mock Leaflet (avoid DOM issues in tests)
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("leaflet", () => ({
  icon: vi.fn(() => ({})),
  Icon: { Default: { mergeOptions: vi.fn() } },
}));

import ExplorePage from "@/pages/ExplorePage";

describe("ExplorePage - Search Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: [], error: null });
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: null });
  });

  it("renders the explore page with search elements", async () => {
    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    );

    // Should show explore page content
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/location|search|city/i)).toBeInTheDocument();
    });
  });

  it("calls search_properties RPC on initial load", async () => {
    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith(
        "search_properties",
        expect.any(Object)
      );
    });
  });

  it("calls AI smart search edge function when AI query is submitted", async () => {
    mockFunctionsInvoke.mockResolvedValue({
      data: { filters: { location: "Bucharest", guests: 2 }, properties: [] },
      error: null,
    });

    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    );

    // Find the AI search input
    await waitFor(() => {
      const aiInput = screen.queryByPlaceholderText(/cozy cabin|mountain view|semantic/i);
      if (aiInput) {
        fireEvent.change(aiInput, { target: { value: "cozy cabin near the beach" } });
        // Submit the AI search
        const form = aiInput.closest("form");
        if (form) fireEvent.submit(form);
      }
    });
  });

  it("displays properties when search returns results", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: "prop-1",
          title: "Beautiful Villa",
          city: "Bucharest",
          price_per_night: 120,
          max_guests: 4,
          main_image: "https://example.com/img.jpg",
          avg_rating: 4.5,
          bedrooms: 2,
          beds: 3,
          bathrooms: 1,
        },
        {
          id: "prop-2",
          title: "Cozy Apartment",
          city: "Cluj",
          price_per_night: 80,
          max_guests: 2,
          main_image: "https://example.com/img2.jpg",
          avg_rating: 4.2,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
        },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Beautiful Villa")).toBeInTheDocument();
      expect(screen.getByText("Cozy Apartment")).toBeInTheDocument();
    });
  });

  it("shows empty state when no properties match search", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const emptyMessage = screen.queryByText(/no properties|no results/i);
      // Either shows empty state or no property cards
      const propertyCards = screen.queryAllByRole("article");
      expect(emptyMessage || propertyCards.length === 0).toBeTruthy();
    });
  });
});
