import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() - className merge utility", () => {
  it("merges multiple class names", () => {
    const result = cn("px-4", "py-2", "bg-white");
    expect(result).toBe("px-4 py-2 bg-white");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("removes false/undefined/null values", () => {
    const result = cn("base", false, undefined, null, "end");
    expect(result).toBe("base end");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("resolves complex Tailwind conflicts", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
