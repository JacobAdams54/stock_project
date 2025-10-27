/**
 * @file StockCard.tsx
 * @description A reusable card component that displays a stock's ticker,
 * company name, AI prediction (UP/DOWN), confidence bar, and risk level.
 *
 * Visual parts:
 *  - Colors change based on prediction, confidence, and risk values.
 *  - Confidence renders a progress bar (0–100%) also changes color
 */
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
/**
 * Props accepted by the StockCard component.
 * @typedef {Object} StockCardProps
 * @property {string} ticker - Stock ticker symbol (e.g., "AAPL").
 * @property {string} companyName - Full company name.
 * @property {number} moneyz - Current stock price in USD.
 * @property {"UP" | "DOWN"} prediction - AI trend prediction.
 * @property {number} confidence - Prediction confidence (0–100%).
 * @property {"Low" | "Moderate" | "High"} riskLevel - Calculated risk category.
 */
export type StockCardProps = {
  ticker: string;
  companyName: string;
  moneyz: number;
  prediction: 'UP' | 'DOWN';
  confidence: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
};
/**
 * A presentational card component showing key stock metrics.
 * @param {StockCardProps} props - The data used to render the card.
 * @returns {JSX.Element} MUI Card element displaying the stock details.
 */
export default function StockCard({
  ticker,
  companyName,
  moneyz,
  prediction,
  confidence,
  riskLevel,
}: StockCardProps) {
  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: 1,
        borderRadius: 3,
        p: 1,
      }}
      className="w-full max-w-md"
    >
      {/* Top of the card which takes the passed in ticker and displays it on the top left 
        Passed in company full name directly below ticker simple in smaller text
    */}
      <CardHeader
        title={
          <Typography
            component="h2"
            variant="subtitle1"
            className="font-semibold"
          >
            <span className="font-bold">{ticker}</span>
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {companyName}
          </Typography>
        }
      />
      {/* Displays passed in values including current price, AI prediction,confidence level , and risk level
          Formatted to have categories on left and values on right with empty space in middle
          Todays Price: Bolded $xx.xx
          Prediction: UP/Down; dymanic color based on prediction red/green 
          Confidence level: Progress bar 0%->100%; dymanic color based on baseline values from regression models red/green/yellow
          Risk Level: Low/Moderate/High; dymanic color based on risk red/green/yellow 
      */}
      <CardContent className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span>Today's price:</span>
          <span>
            <strong>${moneyz}</strong>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>AI Prediction:</span>
          <span
            style={{ color: prediction === 'UP' ? '#107435ff' : '#df2121ff' }}
          >
            <strong>{prediction}</strong>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Confidence:</span>

          <div className="flex items-center gap-2">
            <div
              className="h-2 w-16 rounded"
              style={{ backgroundColor: '#e5e7eb' }}
            >
              <div
                className="h-2 rounded"
                style={{
                  width: `${Math.min(100, Math.max(0, confidence))}%`,
                  backgroundColor:
                    confidence >= 57
                      ? '#107435ff'
                      : confidence >= 51
                        ? '#e0ca08ff'
                        : '#df2121ff',
                }}
              />
            </div>

            <span>
              <strong>{confidence}%</strong>
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span>Risk:</span>
          <span
            style={{
              color:
                riskLevel === 'Low'
                  ? '#107435ff'
                  : riskLevel === 'Moderate'
                    ? '#e0ca08ff'
                    : '#df2121ff',
            }}
          >
            <strong>{riskLevel}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
