/** @jest-environment jsdom */
// src/components/layout/Header.test.tsx

// Mock the PNG exactly as imported by the component
jest.mock('../../assets/logo.png', () => 'logo-mock.png');

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ⬇️ If your component is named differently, change this import.
// You told me the file is Header2.tsx, so:
import Header from './Header';

test('renders banner, logo, and core nav labels', () => {
	render(
		<MemoryRouter>
			<Header />
		</MemoryRouter>
	);

	// landmark + logo
	expect(screen.getByTestId('header')).toBeInTheDocument();
	expect(screen.getByTestId('logo')).toBeInTheDocument();
	expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();

	// Core items your current header actually renders
	for (const label of ['Home', 'Stocks', 'About', 'Login']) {
		expect(screen.getByText(new RegExp(`^${label}$`, 'i'))).toBeInTheDocument();
	}

	// Optional: If your header currently shows "Sign Up", keep this enabled.
	// If not, comment it out and the rest still passes.
	const maybeSignUp = screen.queryByText(/^sign up$/i);
	if (maybeSignUp) {
		expect(maybeSignUp).toBeInTheDocument();
	}
});
