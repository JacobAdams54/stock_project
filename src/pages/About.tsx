/**
 * About page
 *
 * Renders the company About page including Hero, Stats, Our Story, Features,
 * Team, and Mission sections. The component uses Material UI Cards for feature
 * and team items, icons from MUI, and Tailwind utility classes for
 * layout and typography. All text/content is sourced from
 * `src/pages/about.constants.ts` so it can be easily updated.
 *
 * Acceptance:
 * - Renders Hero, Stats, Story, Features, Team, Mission sections
 * - Responsive layout across mobile/tablet/desktop
 * - Semantic sections and accessible headings
 *
 * @returns {JSX.Element}
 */

import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Logo from '../components/layout/Logo';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
/**
 * Page-level copy and small UI values used by the About page.
 * Keeping these as constants makes future edits easier.
 * @type {{logoAlt: string, tagline: string, missionShort: string}}
 */
const ABOUT_PAGE = {
	logoAlt: 'Stalk.ai logo',
	tagline: 'AI-driven stock insights for smarter investing',
	missionShort:
		'We bring transparent, accessible, and innovative AI tools to investors of all levels.',
};

/**
 * Statistics displayed on the About page. Each stat is a label/value pair and
 * should include a stable `id` for rendering.
 * @type {{id: string, label: string, value: string}[]}
 */
const STATS = [
	{ id: 'uptime', label: 'Uptime', value: '99.99%' },
	{ id: 'accuracy', label: 'Model Accuracy', value: 'Majority of cases' },
	{ id: 'assets', label: 'Assets Tracked', value: '100+' },
];

/**
 * Content for the Our Story section.
 * @type {{title: string, paragraphs: string[]}}
 */
const STORY = {
	title: 'Our Story',
	paragraphs: [
		'Founded by college software engineers, STALK.AI started with a simple idea: make advanced market signals available to everyday investors. We combine real-time market data with explainable ML models to provide actionable insights.',
		'Our goal is to grow into a community-driven platform where transparency and research-led features guide product decisions. Our team values practical tools, clear communication, and responsible model design.',
	],
};

/**
 * Features displayed as cards on the page. `icon` corresponds to the original
 * icon name (string) and is optional.
 * @type {{id: string, title: string, description: string, icon?: string}[]}
 */
const FEATURES = [
	{
		id: 'ai-models',
		title: 'Advanced AI Models',
		description: 'Proprietary linear regression and ensemble models tuned for market signals.',
		icon: 'Cpu',
	},
	{
		id: 'targeting',
		title: 'Smart Targeting',
		description: 'Personalized alerts and target-setting based on your portfolio and risk profile.',
		icon: 'Target',
	},
	{
		id: 'risk',
		title: 'Risk Management',
		description: 'Tools to help you size positions and manage downside risk.',
		icon: 'Shield',
	},
	{
		id: 'speed',
		title: 'High Performance',
		description: 'Fast computations and efficient UI for quick decision making.',
		icon: 'Zap',
	},
	{
		id: 'community',
		title: 'Community & Research',
		description: 'Collaborative tools for sharing ideas and curated research.',
		icon: 'Users',
	},
];

/**
 * Team members rendered on the Team section.
 * @type {{id: string, name: string, role: string}[]}
 */
const TEAM = [
	{ id: 'CW', name: 'Canaan Wihelmsson-Haack', role: 'Project Manager' },
	{ id: 'JS', name: 'Jack Sadler', role: 'Asssistant Manager' },
	{ id: 'JA', name: 'Jacob Adams', role: 'Software Engineer' },
	{ id: 'JO', name: 'Jacob Otero', role: 'Software Engineer' },
	{ id: 'JF', name: 'Jason Floyd', role: 'Software Engineer' },
	{ id: 'JV', name: 'Julian Vara', role: 'Software Engineer' },
	{ id: 'RC', name: 'Ryan Carroll', role: 'Software Engineer' },
];

/**
 * Mission block with high-level pillars.
 * Each pillar may optionally include a short description or icon name.
 * @type {{title: string, statement: string, pillars: {id: string, title: string, description?: string, icon?: string}[]}}
 */
const MISSION = {
	title: 'Our Mission',
	statement:
		'Deliver accessible, transparent, and innovative AI tools that empower investors to make better decisions.',
	pillars: [
		{ id: 'transparency', title: 'Transparency' },
		{ id: 'accessibility', title: 'Accessibility' },
		{ id: 'innovation', title: 'Innovation' },
	],
};
import {
	Memory,
	CenterFocusStrong,
	Security,
	FlashOn,
	Group,
	AccessTime,
} from '@mui/icons-material';
import { FeatureCards } from '../components/layout/FeatureCard';

// Map feature icon names (from the FEATURES constant) to MUI icon components
const FEATURE_ICON_MAP: Record<string, React.ElementType> = {
  Cpu: Memory,
  Target: CenterFocusStrong,
  Shield: Security,
  Zap: FlashOn,
  Users: Group,
};

// Helper to create avatar initials from a full name.
// Robust behavior:
// - safely handles undefined/empty input
// - trims and collapses whitespace
// - uses up to two initials
// - returns uppercase initials
const getInitials = (name = ''): string =>
	name
		.trim()
		.split(/\s+/)
		.map((n) => n[0] ?? '')
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();

export default function About() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex-grow">
				{/* Hero */}
				<section className="bg-gradient-to-r from-sky-50 via-white to-white py-16" aria-labelledby="about-hero">
					<div className="max-w-4xl mx-auto text-center px-4">
						<div className="mx-auto">
							<Logo size="lg" variant="dark" />
						</div>
						<h1 id="about-hero" className="text-3xl md:text-4xl font-extrabold mt-6">
							{ABOUT_PAGE.tagline}
						</h1>
						<p className="mt-4 text-lg text-gray-700">{ABOUT_PAGE.missionShort}</p>
					</div>
				</section>

				{/* Stats */}
				<section className="py-12" aria-labelledby="about-stats">
					<div className="max-w-6xl mx-auto px-4">
						<h2 id="about-stats" className="text-2xl font-semibold mb-6 text-center">Platform stats</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{STATS.map((s) => (
								<div key={s.id} className="bg-white p-6 rounded-lg shadow text-center">
									<div className="text-2xl font-bold">{s.value}</div>
									<div className="text-sm text-gray-500 mt-1">{s.label}</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Our Story */}
				<section className="py-12 bg-gray-50" aria-labelledby="about-story">
					<div className="max-w-3xl mx-auto px-4 text-center">
						<h2 id="about-story" className="text-2xl font-semibold mb-4">{STORY.title}</h2>
						{STORY.paragraphs.map((p, i) => (
							<p key={i} className="text-gray-700 leading-relaxed mb-4">
								{p}
							</p>
						))}
					</div>
				</section>

				{/* Features */}
				<FeatureCards
					features={FEATURES.map((f) => ({
						icon: FEATURE_ICON_MAP[f.icon as string] ?? AccessTime,
						title: f.title,
						description: f.description,
						color: 'text-gray-400',
						bgColor: 'bg-gray-100',
					}))}
					heading="Features"
					subheading="Core capabilities and tools coming soon."
				/>

				{/* Team */}
				<section className="py-12 bg-gray-50" aria-labelledby="about-team">
					<div className="max-w-8xl mx-auto px-12">
						<h2 id="about-team" className="text-2xl font-semibold mb-6 text-center">Meet the team</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
							{TEAM.map((t) => (
								<Card key={t.id} className="text-center">
									<CardContent>
										<div className="flex flex-col items-center gap-3">
											<Avatar className="bg-teal-400 text-white">{getInitials(t.name)}</Avatar>
											<div className="font-medium">{t.name}</div>
											{/* Larger badge: increase font size, padding, and border radius via MUI sx prop */}
											<Badge
												badgeContent={t.role}
												color="primary"
												className="mt-2"
												sx={{
													'& .MuiBadge-badge': {
														fontSize: '0.85rem',
														padding: '6px 10px',
														borderRadius: '999px',
														minWidth: 36,
														height: 'auto',
													},
												}}
											/>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Mission */}
				<section className="py-12 bg-teal-600 text-white" aria-labelledby="about-mission">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<h2 id="about-mission" className="text-2xl font-semibold mb-4">{MISSION.title}</h2>
						<p className="mb-6">{MISSION.statement}</p>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{MISSION.pillars.map((p) => (
								<div key={p.id} className="bg-white/10 p-4 rounded">
									<h4 className="font-semibold">{p.title}</h4>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
