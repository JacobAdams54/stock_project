
/**
 * About page
 *
 * Renders the company About page including Hero, Stats, Our Story, Features,
 * Team, and Mission sections. The component uses Material UI Cards for feature
 * and team items, icons from lucide-react, and Tailwind utility classes for
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

import { } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { STATS, ABOUT_PAGE, STORY, FEATURES, TEAM, MISSION } from './about.constants';
import * as Icons from 'lucide-react';

export default function About() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex-grow">
				{/* Hero */}
				<section className="bg-gradient-to-r from-sky-50 via-white to-white py-16" aria-labelledby="about-hero">
					<div className="max-w-4xl mx-auto text-center px-4">
						<img src="https://via.placeholder.com/160" alt={ABOUT_PAGE.logoAlt} className="mx-auto w-32" />
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
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
				<section className="py-12" aria-labelledby="about-features">
					<div className="max-w-6xl mx-auto px-4">
						<h2 id="about-features" className="text-2xl font-semibold mb-6 text-center">Features</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{FEATURES.map((f) => {
								const Icon = (Icons as any)[f.icon] || Icons.GitPullRequest;
								return (
									<Card key={f.id} className="hover:shadow-lg transition-shadow">
										<CardContent>
											<div className="flex items-start gap-4">
												<div className="p-2 rounded-md bg-sky-50">
													<Icon className="w-6 h-6 text-sky-600" />
												</div>
												<div>
													<h3 className="text-lg font-semibold">{f.title}</h3>
													<p className="text-sm text-gray-600 mt-1">{f.description}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</section>

				{/* Team */}
				<section className="py-12 bg-gray-50" aria-labelledby="about-team">
					<div className="max-w-6xl mx-auto px-4">
						<h2 id="about-team" className="text-2xl font-semibold mb-6 text-center">Meet the team</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
							{TEAM.map((t) => (
								<Card key={t.id} className="text-center">
									<CardContent>
										<div className="flex flex-col items-center gap-3">
											<Avatar className="bg-teal-400 text-white">{t.name.split(' ').map((n) => n[0]).slice(0,2).join('')}</Avatar>
											<div className="font-medium">{t.name}</div>
											<Badge badgeContent={t.role} color="primary" className="mt-2" />
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
