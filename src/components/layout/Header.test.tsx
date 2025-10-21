/**
 * @file Header.test.tsx
 * @description High-level smoke test for the global Header component.
 *
 * - No Router provider needed (mocked Link + useLocation)
 * - Desktop branch forced (mocked useMediaQuery => true)
 * - Verifies banner, logo, and primary links (href + aria-current on active)
 */


import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Make sure this matches your component's import path for the logo:
jest.mock('../../assets/logo.png', () => 'logo-mock.png');

// Force DESKTOP layout so the hamburger/mobile menu isn't involved
jest.mock('@mui/material/useMediaQuery', () => ({
	__esModule: true,
	default: () => true, // desktop
}));

// Mock react-router Link + useLocation so we don't need MemoryRouter
jest.mock('react-router-dom', () => {
	return {
		// Render a simple anchor with href from "to"
		Link: (props: { to: string; children?: React.ReactNode; className?: string }) => (
			<a data-testid={`link-${props.to}`} href={props.to} className={props.className}>
				{props.children}
			</a>
		),
		// Pretend current path is "/" so Home is active
		useLocation: () => ({ pathname: '/' }),
	};
});

// ⬇️ Update this import if your file name or path differs
import Header from './Header';

afterEach(() => cleanup()); //Removes custome navigation listeners between tests

describe('Header (smoke test, Jest)', () => {
	test('renders banner and logo', () => {
		render(<Header />);

		// landmark
		expect(screen.getByRole('banner')).toBeInTheDocument();

		// your component exposes data-testid="logo" on the clickable logo wrapper
		expect(screen.getByTestId('logo')).toBeInTheDocument();

		// The image itself (alt text)
		expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
	});

	test('renders primary navigation links with correct hrefs', () => {
		render(<Header />);

		// The test assumes Router Links: adjust if your labels/paths differ
		const cases: Array<[label: string, href: string]> = [
			['Home', '/'],
			['Dashboard', '/dashboard'],
			['Stocks', '/stocks'],
			['About', '/about'],
			['Login', '/login'],
			['Admin', '/admin'],
			['Sign Up', '/signup'],
		];

		for (const [label, href] of cases) {
			const el = screen.getByText(new RegExp(`^${label}$`, 'i'));
			expect(el).toBeInTheDocument();
			expect((el as HTMLAnchorElement).getAttribute('href')).toBe(href);
		}
	});

	test('marks the current route as active via aria-current', () => {
		render(<Header />);

		// useLocation() mocked to '/', so Home should be active
		const home = screen.getByText(/^home$/i);
		expect(home).toHaveAttribute('aria-current', 'page');
	});
});
