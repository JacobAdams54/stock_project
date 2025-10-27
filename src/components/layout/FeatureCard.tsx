/**
 * @file FeatureCard.tsx
 * @description
 *    A reusable and responsive FeatureCards component for the marketing sections of the site.
 *    Displays a section with a heading, subheading, and a grid of feature cards — each with an icon, title, and description.
 *    Designed for flexibility and reuse, with dynamic props and Tailwind + Material UI styling.
 *
 * Features:
 *  - Accepts dynamic content via props.
 *  - Uses Material UI `Card` and `CardContent` for structure and accessibility.
 *  - Uses Tailwind CSS for layout, spacing, colors, and responsive behavior.
 *  - Supports custom icons and color themes per feature card.
 *  - Fully responsive (1-column mobile, 3-column desktop).
 *  - Hover interaction: card shadow increases for visual feedback.
 *
 * Props:
 * @typedef {Object} Feature
 * @property {React.ElementType} icon - A React component (MUI icon) to render inside the card.
 * @property {string} title - Title text for the feature.
 * @property {string} description - Short description of the feature.
 * @property {string} color - Tailwind text color class (e.g., "text-blue-600") applied to the icon.
 * @property {string} bgColor - Tailwind background color class (e.g., "bg-blue-100") applied to the icon badge.
 *
 * @typedef {Object} FeatureCardsProps
 * @property {Feature[]} features - An array of feature objects to render as cards.
 * @property {string} [heading] - Optional heading for the section (defaults provided).
 * @property {string} [subheading] - Optional subheading for the section (defaults provided).
 *
 * Usage Example:
 * ```tsx
 * <FeatureCards
 *   features={[
 *     {
 *       icon: TrendingUp,
 *       title: "Real-time Data",
 *       description: "Stay up-to-date with live stock prices and insights.",
 *       color: "text-blue-600",
 *       bgColor: "bg-blue-100",
 *     },
 *   ]}
 * />
 * ```
 */
import { Card, CardContent } from '@mui/material';

// Define the structure for a single feature card
type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

// Define props that the FeatureCards component can receive
type FeatureCardsProps = {
  features: Feature[];
  heading?: string;
  subheading?: string;
};

// Functional component that renders the feature cards section
export function FeatureCards({
  features,
  heading = "Why Choose StockPredict AI?",
  subheading = "Our platform combines cutting-edge technology with intuitive design to help you make smarter investment decisions."
}: FeatureCardsProps) {
  return (
    // Semantic <section> tag for the feature cards area
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading and subheading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subheading}</p>
        </div>

        {/* Grid layout for feature cards — 1 column on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon; // Icon is a React component passed into props
            return (
              <Card
                key={feature.title}
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  boxShadow: 1,
                  borderRadius: "12px",
                  transition: "box-shadow 0.2s ease-in-out",
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                data-testid="mui-card"
              >

                {/* Card content wrapper */}
                <CardContent className="p-6 text-center" data-testid="mui-cardcontent">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} mb-4`}>
                    {/* Icon inside a styled circle */}
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
