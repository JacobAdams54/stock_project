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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
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
                <CardContent className="p-6 text-center" data-testid="mui-cardcontent">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} mb-4`}>
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
