import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import BuildBox, { TRAIL_MIX_INGREDIENTS, PACK_SIZES } from "@/components/BuildBox";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

describe("BuildBox Component — Dual Customization Studio", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderComponent = (defaultTab?: "gift-box" | "trail-mix") => {
    return render(
      <AuthProvider>
        <CartProvider>
          <BuildBox defaultTab={defaultTab} />
        </CartProvider>
      </AuthProvider>
    );
  };

  it("renders Custom Gift Box mode by default", () => {
    renderComponent("gift-box");
    expect(screen.getByText(/Design Your Own Gourmet Selection/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Gift Box \(4-Pack\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Custom Box to Basket/i)).toBeInTheDocument();
  });

  it("switches to Custom Trail Mix Crafter mode", () => {
    renderComponent("gift-box");
    const trailMixBtn = screen.getByText(/Custom Trail Mix Crafter/i);
    fireEvent.click(trailMixBtn);

    expect(screen.getByText(/Add Custom Mix to Basket/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Pack Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Formula Ratio/i)).toBeInTheDocument();
  });

  it("calculates Custom Trail Mix price correctly with 15% discount", () => {
    renderComponent("trail-mix");
    
    // Default selected: 4 ingredients (Almonds 340, Cashews 360, Cranberries 280, Pumpkin Seeds 220)
    // Avg base price = (340 + 360 + 280 + 220) / 4 = 1200 / 4 = 300
    // Weight multiplier for 250g = 1.0
    // Raw price = 300
    // 15% OFF discounted price = 300 * 0.85 = 255
    expect(screen.getByText("₹255")).toBeInTheDocument();
  });

  it("updates Custom Trail Mix price when changing pack size", () => {
    renderComponent("trail-mix");
    
    // Select 500g Jar (multiplier 1.9)
    const jar500gBtn = screen.getByText(/500g Jar/i);
    fireEvent.click(jar500gBtn);

    // Avg base price = 300
    // Raw price = 300 * 1.9 = 570
    // 15% OFF discounted price = 570 * 0.85 = 485 (rounded)
    expect(screen.getByText("₹485")).toBeInTheDocument();
  });
});
