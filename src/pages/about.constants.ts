/**
 * Configurable constants for the About page. Keeping all copy and simple
 * data structures here makes future editing and i18n simpler.
 */

export const ABOUT_PAGE = {
  logoAlt: 'Stalk.ai logo',
  tagline: 'AI-driven stock insights for smarter investing',
  missionShort:
    'We bring transparent, accessible, and innovative AI tools to investors of all levels.',
};

export const STATS = [
  { id: 'users', label: 'Active Users', value: '120K+' },
  { id: 'uptime', label: 'Uptime', value: '99.99%' },
  { id: 'accuracy', label: 'Model Accuracy', value: '87%' },
  { id: 'assets', label: 'Assets Tracked', value: '8,400+' },
];

export const STORY = {
  title: 'Our Story',
  paragraphs: [
    'Founded by traders and engineers, STALK.AI started with a simple idea: make advanced market signals available to everyday investors. We combine real-time market data with explainable ML models to provide actionable insights.',
    'Over the years we\'ve grown into a community-driven platform where transparency and research-led features guide product decisions. Our team values practical tools, clear communication, and responsible model design.',
  ],
};

export const FEATURES = [
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
    id: 'real-time',
    title: 'Real-time Analysis',
    description: 'Low-latency market data with live prediction updates.',
    icon: 'Clock',
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

export const TEAM = [
  { id: 'jd', name: 'Jacob Adams', role: 'Founder & CEO' },
  { id: 'am', name: 'Ava Martinez', role: 'Head of Research' },
  { id: 'sk', name: 'Samir K.', role: 'Lead Engineer' },
  { id: 'ml', name: 'Maya L.', role: 'Product Designer' },
];

export const MISSION = {
  title: 'Our Mission',
  statement:
    'Deliver accessible, transparent, and innovative AI tools that empower investors to make better decisions.',
  pillars: [
    { id: 'transparency', title: 'Transparency' },
    { id: 'accessibility', title: 'Accessibility' },
    { id: 'innovation', title: 'Innovation' },
  ],
};
