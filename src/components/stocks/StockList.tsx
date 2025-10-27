//StockList.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Button,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";

export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number; // 0..1
  trend: "up" | "down";
  change: number; // 24h % change (+/-)
  volume: number;
  lastAnalyzed: string; // ISO string
  prediction: "BUY" | "SELL" | "HOLD";
  targetPrice: number;
  riskLevel: "Low" | "Medium" | "High";
};

// --- Mock data (replace with Firestore later) ---
const MOCK_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    currentPrice: 227.31,
    predictedPrice: 238.9,
    confidence: 0.86,
    trend: "up",
    change: 1.42,
    volume: 71234589,
    lastAnalyzed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    prediction: "BUY",
    targetPrice: 245.0,
    riskLevel: "Low",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    currentPrice: 419.55,
    predictedPrice: 415.1,
    confidence: 0.73,
    trend: "down",
    change: -0.58,
    volume: 38210943,
    lastAnalyzed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    prediction: "HOLD",
    targetPrice: 420.0,
    riskLevel: "Low",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    sector: "Consumer Discretionary",
    currentPrice: 249.78,
    predictedPrice: 230.2,
    confidence: 0.62,
    trend: "down",
    change: -2.11,
    volume: 119333201,
    lastAnalyzed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    prediction: "SELL",
    targetPrice: 225.0,
    riskLevel: "High",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    currentPrice: 179.22,
    predictedPrice: 186.4,
    confidence: 0.78,
    trend: "up",
    change: 0.91,
    volume: 58200211,
    lastAnalyzed: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    prediction: "BUY",
    targetPrice: 190.0,
    riskLevel: "Medium",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Financials",
    currentPrice: 202.84,
    predictedPrice: 207.2,
    confidence: 0.69,
    trend: "up",
    change: 0.37,
    volume: 12198900,
    lastAnalyzed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    prediction: "HOLD",
    targetPrice: 205.0,
    riskLevel: "Medium",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    currentPrice: 114.62,
    predictedPrice: 120.9,
    confidence: 0.9,
    trend: "up",
    change: 3.17,
    volume: 155662002,
    lastAnalyzed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    prediction: "BUY",
    targetPrice: 122.0,
    riskLevel: "Medium",
  },
];

type SortKey = "accuracy" | "price" | "change" | "symbol";

const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const TrendIcon = ({ trend }: { trend: "up" | "down" }) =>
  trend === "up" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;

const PredictionChip = ({ prediction }: { prediction: Stock["prediction"] }) => {
  const map: Record<Stock["prediction"], { color: "success" | "error" | "default"; label: string }> =
    { BUY: { color: "success", label: "BUY" }, SELL: { color: "error", label: "SELL" }, HOLD: { color: "default", label: "HOLD" } };
  const { color, label } = map[prediction];
  return <Chip size="small" color={color} label={label} />;
};

const RiskChip = ({ risk }: { risk: Stock["riskLevel"] }) => {
  const map: Record<Stock["riskLevel"], { color: "success" | "warning" | "error" }> =
    { Low: { color: "success" }, Medium: { color: "warning" }, High: { color: "error" } };
  return <Chip size="small" color={map[risk].color} label={`${risk} Risk`} />;
};

export default function StockList() {
  const [stocks] = useState<Stock[]>(MOCK_STOCKS);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("accuracy");

  // sector list
  const sectors = useMemo(() => ["All", ...Array.from(new Set(stocks.map(s => s.sector))).sort()], [stocks]);

  const handleSortChange = (e: SelectChangeEvent) => setSort(e.target.value as SortKey);
  const handleSectorChange = (e: SelectChangeEvent) => setSector(e.target.value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stocks.filter((s) => {
      const matchesQuery = !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const matchesSector = sector === "All" || s.sector === sector;
      return matchesQuery && matchesSector;
    });
  }, [stocks, search, sector]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "accuracy":
        arr.sort((a, b) => b.confidence - a.confidence);
        break;
      case "price":
        arr.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "change":
        arr.sort((a, b) => b.change - a.change);
        break;
      case "symbol":
        arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
    }
    return arr;
  }, [filtered, sort]);

  const onCardClick = (symbol: string) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: { page: "stock-detail", stockSymbol: symbol } }));
  };

  return (
    <Box className="w-full">
      {/* Filters */}
      <Card className="rounded-2xl shadow-sm mb-4">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <TextField
              label="Search"
              placeholder="Search by symbol or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              className="w-full md:w-[360px]"
            />

            <Stack direction="row" spacing={2} className="w-full md:w-auto">
              <Select value={sector} onChange={handleSectorChange} size="small" className="min-w-[160px]">
                {sectors.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>

              <Select value={sort} onChange={handleSortChange} size="small" className="min-w-[160px]">
                <MenuItem value="accuracy">Sort: Accuracy</MenuItem>
                <MenuItem value="price">Sort: Price</MenuItem>
                <MenuItem value="change">Sort: Change</MenuItem>
                <MenuItem value="symbol">Sort: Symbol</MenuItem>
              </Select>

              <Button variant="outlined" startIcon={<FilterListIcon />} disabled>
                More Filters
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Grid */}
      {sorted.length === 0 ? (
        <Card className="rounded-2xl p-6 shadow-sm">
          <Typography>No stocks found matching your criteria.</Typography>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((s) => {
            const isUp = s.trend === "up";
            return (
              <Card key={s.symbol} className="rounded-2xl shadow-sm">
                <CardActionArea onClick={() => onCardClick(s.symbol)} aria-label={`Open ${s.symbol} details`}>
                  <CardContent>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" className="mb-1">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" className="font-bold">
                          {s.symbol}
                        </Typography>
                        <Typography color="text.secondary">{s.name}</Typography>
                      </Stack>
                      <Chip size="small" label={s.sector} />
                    </Stack>

                    {/* Pricing */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" className="mb-2">
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Current
                        </Typography>
                        <Typography variant="h6">{formatMoney(s.currentPrice)}</Typography>
                      </Stack>

                      <Divider flexItem orientation="vertical" />

                      <Stack spacing={0.5} alignItems="flex-end">
                        <Typography variant="body2" color="text.secondary">
                          Predicted
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="h6">{formatMoney(s.predictedPrice)}</Typography>
                          <TrendIcon trend={s.trend} />
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Chips */}
                    <Stack direction="row" spacing={1} alignItems="center" className="mb-2">
                      <Chip size="small" label={formatPct(s.change)} color={isUp ? "success" : "error"} variant="outlined" />
                      <PredictionChip prediction={s.prediction} />
                      <RiskChip risk={s.riskLevel} />
                      <Chip size="small" label={`Target ${formatMoney(s.targetPrice)}`} variant="outlined" />
                    </Stack>

                    {/* Confidence */}
                    <Stack spacing={0.5} className="mb-2">
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Confidence
                        </Typography>
                        <Typography variant="body2">{(s.confidence * 100).toFixed(0)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={s.confidence * 100} className="rounded-full" />
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Last analyzed: {new Date(s.lastAnalyzed).toLocaleString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </div>
      )}
    </Box>
  );
}
