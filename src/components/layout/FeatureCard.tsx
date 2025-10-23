import { Card, CardContent } from '@mui/material';

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

type FeatureCardsProps = {
  features: Feature[];
  heading?: string;
  subheading?: string;
};

export function FeatureCards({
  features,
  heading = "Why Choose StockPredict AI?",
  subheading = "Our platform combines cutting-edge technology with intuitive design to help you make smarter investment decisions."
}: FeatureCardsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subheading}</p>
        </div>
        
        {/* Feature cards go here */}
      </div>
    </section>
  );
}
