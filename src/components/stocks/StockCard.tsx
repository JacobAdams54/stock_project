import { Card, CardHeader, CardContent, Typography } from "@mui/material";
export type StockCardProps = {
  ticker: string;
  companyName: string;
  moneyz: number;
  prediction: "UP" | "DOWN";
  confidence: number;
  riskLevel: "Low" | "Moderate"| "High";
  
};
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

      <CardContent className="flex flex-col gap-3">

        <div className="flex justify-between items-center">
        <span>Today's price:</span>
        <span><strong>${moneyz}</strong></span>
        </div>

        <div className="flex justify-between items-center">
        <span>AI Prediction:</span>
        <span
            style={{color: prediction === 'UP' ? "#107435ff": "#df2121ff", }}
        >
            <strong>{prediction}</strong>
        </span>
        </div>

        <div className="flex justify-between items-center">
            <span>Confidence:</span>

            <div className="flex items-center gap-2">

            <div className="h-2 w-16 rounded" style={{ backgroundColor: "#e5e7eb" }}>

                <div
                className="h-2 rounded"
                style={{ 
                    width: `${Math.min(100, Math.max(0, confidence))}%`,
                    backgroundColor: confidence >= 57 ? "#107435ff" : confidence >= 51 ? "#e0ca08ff" : "#df2121ff",
                }}
                />
            </div>

            <span><strong>{confidence}%</strong></span>
            </div>

        </div>

        <div className="flex justify-between items-center">
        <span>Risk:</span>
        <span
            style={{color: riskLevel ==='Low' ? "#107435ff": riskLevel ==='Moderate' ? "#e0ca08ff" : "#df2121ff", }}
        >
            <strong>{riskLevel}</strong>
        </span>
        </div>

      </CardContent>

    </Card>

  );
}