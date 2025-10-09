/*
	 * Header.test.tsx
	 * Test suite for the Header component
	 * Very Basic test as the page simply needs to hold other elements
*/
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
	it("renders the header with logo and navigation links", () => {
		render(<Header />);
		expect(screen.getByRole("banner")).toBeInTheDocument();
		expect(screen.getByTestId("logo")).toBeInTheDocument();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByText("Stocks")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Sign Up")).toBeInTheDocument();
	});

	it("dispatches navigation event when logo is clicked", () => {
		// TODO: Simulate logo click and check CustomEvent dispatch
	});

	it("dispatches navigation event for each nav link", () => {
		// TODO: Simulate nav link clicks and check CustomEvent dispatch
	});

	it("shows hamburger menu on mobile view", () => {
		// TODO: Test responsive collapse to hamburger menu
	});

	it("has accessible navigation and ARIA attributes", () => {
		// TODO: Test keyboard navigation and ARIA attributes
	});
});
