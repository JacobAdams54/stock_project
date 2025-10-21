jest.mock('../../assets/logo.png', () => 'logo-mock.png');

// src/components/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Header from './Header';

// Helper: render Header within a router & simple routes to observe navigation
function renderWithRouter(initialPath = '/') {
	return render(
		<MemoryRouter initialEntries={[initialPath]}>
			<Header />
			<Routes>
				<Route path="/" element={<div data-testid="page">Home Page</div>} />
				<Route path="/dashboard" element={<div data-testid="page">Dashboard Page</div>} />
				<Route path="/stocks" element={<div data-testid="page">Stocks Page</div>} />
				<Route path="/about" element={<div data-testid="page">About Page</div>} />
				<Route path="/login" element={<div data-testid="page">Login Page</div>} />
				<Route path="/admin" element={<div data-testid="page">Admin Page</div>} />
				<Route path="/signup" element={<div data-testid="page">Sign Up Page</div>} />
			</Routes>
		</MemoryRouter>
	);
}

describe('Header (Jest + React Router)', () => {
	it('renders the header with logo and navigation links', () => {
		renderWithRouter('/');
		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(screen.getByTestId('logo')).toBeInTheDocument();

		// MUI Button + RouterLink renders <a> → role="link"
		expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /stocks/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
	});

	it('navigates when logo is clicked', async () => {
		const user = userEvent.setup();
		renderWithRouter('/dashboard');
		await user.click(screen.getByTestId('logo')); // RouterLink to "/"
		expect(await screen.findByTestId('page')).toHaveTextContent('Home Page');
	});

	it('navigates for each nav link', async () => {
		const user = userEvent.setup();
		renderWithRouter('/');

		await user.click(screen.getByRole('link', { name: /dashboard/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('Dashboard Page');

		await user.click(screen.getByRole('link', { name: /stocks/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('Stocks Page');

		await user.click(screen.getByRole('link', { name: /about/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('About Page');

		await user.click(screen.getByRole('link', { name: /login/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('Login Page');

		await user.click(screen.getByRole('link', { name: /admin/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('Admin Page');

		await user.click(screen.getByRole('link', { name: /sign up/i }));
		expect(await screen.findByTestId('page')).toHaveTextContent('Sign Up Page');
	});

	it('shows hamburger menu on mobile and reveals items when opened', async () => {
		// Force the MOBILE branch by mocking MUI useMediaQuery to return false for up('md')
		jest.mock('@mui/material/useMediaQuery', () => ({
			__esModule: true,
			default: () => false, // not desktop → show hamburger
		}));
		// Re-require after mock so it takes effect
		const { default: MobileHeader } = (await import('./Header')) as any;

		const user = userEvent.setup();
		render(
			<MemoryRouter>
				<MobileHeader />
			</MemoryRouter>
		);

		// Hamburger button present
		const menuBtn = screen.getByRole('button', { name: /open navigation menu/i });
		expect(menuBtn).toBeInTheDocument();

		// Open menu and assert items
		await user.click(menuBtn);
		expect(await screen.findByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /stocks/i })).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /about/i })).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /login/i })).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /admin/i })).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /sign up/i })).toBeInTheDocument();
	});

	it('marks the current route as active via aria-current', () => {
		renderWithRouter('/dashboard');
		const dashboard = screen.getByRole('link', { name: /dashboard/i });
		expect(dashboard).toHaveAttribute('aria-current', 'page');
	});
});
