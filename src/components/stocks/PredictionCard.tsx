/**
 * @file PredictionCard.tsx
 * @description A reusable MUI card component that displays an AI stock prediction summary.
 *
 * Visual Features:
 * - Dynamically shows a green upward arrow for bullish trends or a red downward arrow for bearish trends.
 * - Displays confidence percentage.
 * - Generates a dynamic summary message based on trend and confidence level.
 * - Includes a color-coded summary box at the bottom.
 */

import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

/**
 * Props accepted by the PredictionCard component.
 * @typedef {Object} PredictionCardProps
 * @property {"Bullish" | "Bearish"} trend - Indicates the AI's predicted market direction.
 * @property {number} confidence - The AI model's confidence percentage (0–100).
 */
export type PredictionCardProps = {
  trend: "Bullish" | "Bearish";
  confidence: number;
};

/**
 * A presentational component that displays AI trend predictions and confidence levels.
 *
 * @param {PredictionCardProps} props - The data used to render the prediction summary.
 * @param {"Bullish" | "Bearish"} props.trend - The predicted market trend.
 * @param {number} props.confidence - The confidence percentage for the prediction.
 * @returns {JSX.Element} A Material UI Card showing the AI’s market prediction summary.
 */
export default function PredictionCard({ trend, confidence }: PredictionCardProps) {
  const isBullish = trend === "Bullish";
  const color = isBullish ? "#107435ff" : "#df2121ff";
  const boxBg = isBullish ? "#ecfdf5" : "#fef2f2";
  const borderColor = isBullish ? "#bbf7d0" : "#fecaca";
  const textColor = isBullish ? "#065f46" : "#7f1d1d";
  const Icon = isBullish ? TrendingUpIcon : TrendingDownIcon;
  let summaryMessage = "";

  if (confidence >= 57) 
    {
    summaryMessage = isBullish
      ? "Our AI suggests strong upward momentum based on market analysis and technical indicators."
      : "Our AI suggests strong downward momentum based on market analysis and technical indicators.";
    } 
  else 
    {
    summaryMessage = isBullish
      ? "Our AI suggests weak upward momentum based on market analysis and technical indicators."
      : "Our AI suggests weak downward momentum based on market analysis and technical indicators.";
    }

  return (
    <Card
      sx={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        boxShadow: 1,
        borderRadius: 3,
        p: 1,
      }}
      className="w-full max-w-md"
    >

      <CardHeader
        title={
          <Typography component="h2" variant="subtitle1" className="font-semibold">
            <span className="inline-flex items-center gap-2 font-bold">
              <PsychologyIcon sx={{ color: "#107435ff", fontSize: 36 }} />
              AI Prediction Summary
            </span>
          </Typography>
        }
      />


      <CardContent className="flex flex-col gap-3">

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Icon data-testid="trend-icon" sx={{ color, fontSize: 16 }} />
            Next 1 Day Trend
          </span>
          
          <span data-testid="trend-text" style={{ color, fontWeight: "bold" }}>{trend}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>


        <div
        data-testid="summary-box"
        className="mt-2 rounded-lg border p-3"
        style={{ backgroundColor: boxBg, borderColor, color: textColor }}
        >
        <p className="text-sm">{summaryMessage}</p>
        </div>

      </CardContent>

    </Card>

  );
}
