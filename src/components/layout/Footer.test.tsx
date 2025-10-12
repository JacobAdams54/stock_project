/**
 * @file Footer.test.tsx
 * @description Tests for the global Footer component (TDD starter).
 *
 * This suite focuses on the important behaviors and deliverables described
 * in the ticket:
 *  - Presence of the footer landmark
 *  - Left section: Logo (dark), company description, and social icons
 *  - Quick Links dispatching a CustomEvent("navigate", { detail: { page } })
 *  - Support links being static anchors (having href)
 *  - Bottom row: copyright and tagline
 *  - Presence of a desktop grid container (responsiveness hint)
 *
 * Placement:
 *  - Save alongside the component: src/components/layout/Footer.test.tsx
 *
 * Notes:
 *  - The test mocks a minimal Logo component to assert the "variant" prop is set.
 *  - These are intentionally focused, not granular, to guide implementation by failing tests (TDD).
 */

import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "./Footer";

// Mock the Logo component so tests can assert the "variant" prop without relying on implementation.
jest.mock("./Logo", () => ({
  Logo: (props: { size?: string; variant?: string }) => (
    <div data-testid="mock-logo" data-variant={props.variant} data-size={props.size}>
      LOGO
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  // Remove any custom navigate listeners between tests.
  // (Tests attach listeners directly to window; this ensures isolation.)
  // Jest's jsdom does not provide a direct way to remove anonymous listeners,
  // but by resetting modules between runs or using cleanup above we minimize interference.
});

describe("Footer (high-level TDD tests)", () => {
  test("renders footer landmark and desktop grid container", () => {
    const { container } = render(<Footer />);
    // Footer landmark
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();

    // Expect a grid container (implementation hint: uses a grid for desktop)
    // We don't assert exact classes; we just check for an element that likely carries a grid-related class.
    const gridEl = container.querySelector(".grid") || container.querySelector("[class*='grid-']");
    expect(gridEl).toBeInTheDocument();
  });

  test("left section: renders dark Logo, company description, and social icons", () => {
    render(<Footer />);

    // Mocked Logo should receive variant="dark"
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-variant", "dark");

    // Company description (a short recognizable sentence expected in the design)
    expect(
      screen.getByText(/Empowering investors with AI-driven insights/i) ||
        screen.getByText(/Empowering investors/i)
    ).toBeInTheDocument();

    // Social icons should be present and accessible (aria-label or title)
    const twitter = screen.queryByLabelText(/twitter/i) || screen.queryByRole("button", { name: /twitter/i });
    const linkedin = screen.queryByLabelText(/linkedin/i) || screen.queryByRole("button", { name: /linkedin/i });
    const github = screen.queryByLabelText(/github/i) || screen.queryByRole("button", { name: /github/i });

    expect(twitter).toBeInTheDocument();
    expect(linkedin).toBeInTheDocument();
    expect(github).toBeInTheDocument();
  });

  test("quick links dispatch navigate CustomEvent with correct page detail when clicked", () => {
    render(<Footer />);

    const events: any[] = [];
    const handler = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener("navigate", handler as EventListener);

    // Expected quick links (case-insensitive)
    const linkNames = ["Home", "Dashboard", "Stocks", "About"];

    linkNames.forEach((name) => {
      const link = screen.getByText(new RegExp(`^${name}$`, "i"));
      expect(link).toBeInTheDocument();
      fireEvent.click(link);
    });

    // Each click should have dispatched an event with the expected page detail
    expect(events.length).toBe(linkNames.length);
    const pages = events.map((d) => d?.page);
    expect(pages).toEqual(["home", "dashboard", "stocks", "about"]);

    window.removeEventListener("navigate", handler as EventListener);
  });

  test("support links are static anchors with href attributes", () => {
    render(<Footer />);

    const supportItems = ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"];
    supportItems.forEach((text) => {
      const link = screen.getByText(new RegExp(`^${text}$`, "i"));
      expect(link).toBeInTheDocument();
      // Should be an anchor (or element with href) pointing somewhere (not necessarily external yet)
      const href = (link as HTMLAnchorElement).getAttribute("href");
      expect(href).not.toBeNull();
    });
  });

  test("bottom row contains copyright and tagline", () => {
    render(<Footer />);

    // Copyright (year and company name)
    const copyright = screen.queryByText(/©\s*\d{4}\s+STALK\.AI/i) || screen.queryByText(/All rights reserved/i);
    expect(copyright).toBeInTheDocument();

    // Tagline
    const tagline = screen.getByText(/Made with .*for smart investors/i);
    expect(tagline).toBeInTheDocument();
  });
});