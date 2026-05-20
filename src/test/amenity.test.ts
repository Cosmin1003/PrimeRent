import { describe, it, expect } from "vitest";
import { getAmenityDetails } from "@/types/amenity";

describe("getAmenityDetails() - amenity icon & description mapping", () => {
  it("returns correct details for Wifi", () => {
    const details = getAmenityDetails("Wifi");
    expect(details.desc).toBe("High-speed internet throughout the property.");
    expect(details.icon).toBeDefined();
  });

  it("returns correct details for Pool", () => {
    const details = getAmenityDetails("Pool");
    expect(details.desc).toBe("Access to a private or shared swimming pool.");
    expect(details.icon).toBeDefined();
  });

  it("returns correct details for Kitchen", () => {
    const details = getAmenityDetails("Kitchen");
    expect(details.desc).toBe("Fully equipped space for meal preparation.");
  });

  it("returns correct details for Air conditioning", () => {
    const details = getAmenityDetails("Air conditioning");
    expect(details.desc).toBe("Central or unit cooling for your comfort.");
  });

  it("returns fallback for unknown amenity", () => {
    const details = getAmenityDetails("Unknown Amenity XYZ");
    expect(details.desc).toBe("Quality amenity verified and provided by the host.");
    expect(details.icon).toBeDefined();
  });

  it("returns fallback for empty string", () => {
    const details = getAmenityDetails("");
    expect(details.desc).toBe("Quality amenity verified and provided by the host.");
  });

  it("handles all 20 defined amenities without error", () => {
    const amenityNames = [
      "Wifi", "TV", "Air conditioning", "Heating", "Kitchen",
      "Free parking", "Self check-in", "Washer", "Dryer", "Iron",
      "Coffee maker", "Refrigerator", "Microwave", "Dedicated workspace",
      "Pool", "Gym", "Backyard", "Pet friendly", "Family friendly",
      "Fire extinguisher",
    ];

    amenityNames.forEach((name) => {
      const details = getAmenityDetails(name);
      expect(details.icon).toBeDefined();
      expect(details.desc.length).toBeGreaterThan(10);
    });
  });
});
