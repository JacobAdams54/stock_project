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

  { id: 'uptime', label: 'Uptime', value: '99.99%' },
  { id: 'accuracy', label: 'Model Accuracy', value: 'Majority of cases' },
  { id: 'assets', label: 'Assets Tracked', value: '100+' },
];

export const STORY = {
  title: 'Our Story',
  paragraphs: [
    'Founded by college software engineers, STALK.AI started with a simple idea: make advanced market signals available to everyday investors. We combine real-time market data with explainable ML models to provide actionable insights.',
    'Our goal is to grow into a community-driven platform where transparency and research-led features guide product decisions. Our team values practical tools, clear communication, and responsible model design.',
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
  { id: 'CW', name: 'Canaan Wihelmsson-Haack', role: 'Project Manager' },
  { id: 'JS', name: 'Jack Sadler', role: 'Asssistant Manager' },
  { id: 'JA', name: 'Jacob Adams', role: 'Software Engineer' },
  { id: 'JO', name: 'Jacob Otero', role: 'Software Engineer' },
  { id: 'JF', name: 'Jason Floyd', role: 'Software Engineer' },
  { id: 'JV', name: 'Julian Vara', role: 'Software Engineer' },
  { id: 'RC', name: 'Ryan Carroll', role: 'Software Engineer' },
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
