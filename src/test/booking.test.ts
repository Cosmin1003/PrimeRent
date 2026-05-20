import { describe, it, expect } from "vitest";
import { differenceInDays } from "date-fns";

/**
 * Tests for the booking price calculation logic used in PropertyPage.
 * This mirrors the actual calculation done in the booking sidebar.
 */

const CLEANING_FEE = 85;

function calculateBookingPrice(pricePerNight: number, checkIn: Date, checkOut: Date) {
  const nights = differenceInDays(checkOut, checkIn);
  if (nights <= 0) return null;

  const basePrice = pricePerNight * nights;
  const totalPrice = basePrice + CLEANING_FEE;

  return {
    nights,
    basePrice,
    cleaningFee: CLEANING_FEE,
    totalPrice,
  };
}

describe("Booking Price Calculation", () => {
  it("calculates correctly for 1 night", () => {
    const result = calculateBookingPrice(120, new Date("2025-06-01"), new Date("2025-06-02"));
    expect(result).toEqual({
      nights: 1,
      basePrice: 120,
      cleaningFee: 85,
      totalPrice: 205,
    });
  });

  it("calculates correctly for 7 nights", () => {
    const result = calculateBookingPrice(150, new Date("2025-07-01"), new Date("2025-07-08"));
    expect(result).toEqual({
      nights: 7,
      basePrice: 1050,
      cleaningFee: 85,
      totalPrice: 1135,
    });
  });

  it("calculates correctly for 30 nights (monthly stay)", () => {
    const result = calculateBookingPrice(80, new Date("2025-08-01"), new Date("2025-08-31"));
    expect(result).toEqual({
      nights: 30,
      basePrice: 2400,
      cleaningFee: 85,
      totalPrice: 2485,
    });
  });

  it("returns null when check-out equals check-in (0 nights)", () => {
    const result = calculateBookingPrice(100, new Date("2025-06-01"), new Date("2025-06-01"));
    expect(result).toBeNull();
  });

  it("returns null when check-out is before check-in (negative nights)", () => {
    const result = calculateBookingPrice(100, new Date("2025-06-05"), new Date("2025-06-01"));
    expect(result).toBeNull();
  });

  it("handles decimal price per night", () => {
    const result = calculateBookingPrice(99.99, new Date("2025-06-01"), new Date("2025-06-03"));
    expect(result!.nights).toBe(2);
    expect(result!.basePrice).toBeCloseTo(199.98);
    expect(result!.totalPrice).toBeCloseTo(284.98);
  });
});

describe("Date Availability Logic", () => {
  function isDateRangeAvailable(
    checkIn: Date,
    checkOut: Date,
    bookedRanges: { from: Date; to: Date }[]
  ): boolean {
    return !bookedRanges.some((range) => {
      return checkIn < range.to && checkOut > range.from;
    });
  }

  it("returns true when no bookings exist", () => {
    const available = isDateRangeAvailable(
      new Date("2025-06-01"),
      new Date("2025-06-05"),
      []
    );
    expect(available).toBe(true);
  });

  it("returns true when dates don't overlap with existing bookings", () => {
    const bookedRanges = [
      { from: new Date("2025-06-10"), to: new Date("2025-06-15") },
    ];
    const available = isDateRangeAvailable(
      new Date("2025-06-01"),
      new Date("2025-06-05"),
      bookedRanges
    );
    expect(available).toBe(true);
  });

  it("returns false when dates fully overlap with a booking", () => {
    const bookedRanges = [
      { from: new Date("2025-06-01"), to: new Date("2025-06-10") },
    ];
    const available = isDateRangeAvailable(
      new Date("2025-06-03"),
      new Date("2025-06-07"),
      bookedRanges
    );
    expect(available).toBe(false);
  });

  it("returns false when dates partially overlap (start overlaps)", () => {
    const bookedRanges = [
      { from: new Date("2025-06-05"), to: new Date("2025-06-10") },
    ];
    const available = isDateRangeAvailable(
      new Date("2025-06-03"),
      new Date("2025-06-07"),
      bookedRanges
    );
    expect(available).toBe(false);
  });

  it("returns false when dates partially overlap (end overlaps)", () => {
    const bookedRanges = [
      { from: new Date("2025-06-01"), to: new Date("2025-06-05") },
    ];
    const available = isDateRangeAvailable(
      new Date("2025-06-04"),
      new Date("2025-06-08"),
      bookedRanges
    );
    expect(available).toBe(false);
  });

  it("allows booking immediately after an existing one (check-out day = check-in day)", () => {
    const bookedRanges = [
      { from: new Date("2025-06-01"), to: new Date("2025-06-05") },
    ];
    const available = isDateRangeAvailable(
      new Date("2025-06-05"),
      new Date("2025-06-08"),
      bookedRanges
    );
    expect(available).toBe(true);
  });

  it("handles multiple booked ranges", () => {
    const bookedRanges = [
      { from: new Date("2025-06-01"), to: new Date("2025-06-05") },
      { from: new Date("2025-06-10"), to: new Date("2025-06-15") },
      { from: new Date("2025-06-20"), to: new Date("2025-06-25") },
    ];

    // Available gap
    expect(isDateRangeAvailable(new Date("2025-06-06"), new Date("2025-06-09"), bookedRanges)).toBe(true);
    // Overlaps second range
    expect(isDateRangeAvailable(new Date("2025-06-09"), new Date("2025-06-12"), bookedRanges)).toBe(false);
  });
});
