import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hero } from "./Hero";


describe("Hero", () => {
  it("renders heading, subheading, and CTA button", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /AI-Powered Stock Predictions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Make smarter investment decisions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Get Started/i })
    ).toBeInTheDocument();
  });


  it("dispatches navigate event with correct detail on CTA click", () => {
    const listener = jest.fn();
    window.addEventListener("navigate", listener);


    render(<Hero />);
    fireEvent.click(screen.getByRole("button", { name: /Get Started/i }));


    const evt = listener.mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toEqual({ page: "signup" });


    window.removeEventListener("navigate", listener);
  });


  it("renders image and section has correct aria/gradient", () => {
    render(<Hero />);
    expect(
      screen.getByAltText(/Stock market chart illustration/i)
    ).toBeInTheDocument();
    const section = screen.getByRole("region", {
      name: /Hero section: AI-Powered Stock Predictions/i,
    });
    expect(section.className).toMatch(/bg-gradient-to-br/);
  });
});
