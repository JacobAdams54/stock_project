import React from 'react';
import { Box, Container, Typography, TextField, Select, Button } from '@mui/material';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StockCard from '../components/stocks/StockCard';

type Stock = {
    symbol: string;
    name: string;
    sector?: string;
    currentPrice?: number;
    predictedPrice?: number;
    confidence?: number; // 0..1
    trend?: 'up' | 'down' | string;
    change?: number; // percent or absolute
    volume?: number;
    lastAnalyzed?: string; // ISO
    prediction?: string; // BUY/SELL/HOLD
    targetPrice?: number;
    riskLevel?: 'Low' | 'Moderate' | 'High' | string;
};


/**
 * StockListingPage
 * - Renders a list/grid of stocks using the presentational StockCard component.
 * - Does NOT simulate or inject mock stocks; accepts `initialStocks` from props.
 * - The grid is wrapped in a scrollable container so users can navigate the list.
 */
export default function StockListingPage({ initialStocks }: { initialStocks?: Stock[] }) {
    const stocks = React.useMemo(() => initialStocks ?? [], [initialStocks]);

    const [query, setQuery] = React.useState('');
    const [sector, setSector] = React.useState('All');
    const [sort, setSort] = React.useState('');

    const sectors = React.useMemo(() => {
        const s = Array.from(new Set(stocks.map((x) => x.sector).filter(Boolean)));
        return ['All', ...s];
    }, [stocks]);

    const filtered = React.useMemo(() => {
        const out = stocks.filter((s) => {
            const matchesQuery =
                query.trim() === '' ||
                (s.symbol ?? '').toLowerCase().includes(query.toLowerCase()) ||
                (s.name ?? '').toLowerCase().includes(query.toLowerCase());
            const matchesSector = sector === 'All' || s.sector === sector;
            return matchesQuery && matchesSector;
        });
        const sorted = [...out];
        if (sort === 'confidence-desc') {
            sorted.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
        } else if (sort === 'price-asc') {
            sorted.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0));
        } else if (sort === 'symbol-asc') {
            sorted.sort((a, b) => String(a.symbol ?? '').localeCompare(String(b.symbol ?? '')));
        }

        return sorted;
    }, [stocks, query, sector, sort]);

    const handleCardClick = (symbol: string) => {
        const event = new CustomEvent('navigate', { detail: { page: 'stock-detail', stockSymbol: symbol } });
        window.dispatchEvent(event);
    };

    return (
        <div>
            <Header />
            <Container maxWidth="lg" className="py-6">
                <Typography variant="h4" component="h1" gutterBottom>
                    Stock Predictions
                </Typography>
                <Typography variant="body1" className="mb-4">
                    AI-powered predictions for tracked stocks. Filter, sort, and search to find stocks of interest.
                </Typography>

                {/* Filters */}
                <Box className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-6">
                    <TextField
                        placeholder="Search by symbol or company"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        size="small"
                        inputProps={{ 'aria-label': 'search' }}
                        sx={{ minWidth: 240 }}
                    />

                    <Select
                        native
                        value={sector}
                        onChange={(e) => setSector(String(e.target.value))}
                        size="small"
                        displayEmpty
                        inputProps={{ 'aria-label': 'sector' }}
                        sx={{ minWidth: 160 }}
                    >
                        {sectors.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>

                    <Select
                        native
                        value={sort}
                        onChange={(e) => {
                            const v = String(e.target.value);
                            setSort(v);
                        }}
                        size="small"
                        displayEmpty
                        inputProps={{ 'aria-label': 'sort' }}
                        sx={{ minWidth: 200 }}
                    >
                        <option value="">None</option>
                        <option value="confidence-desc">Confidence (high → low)</option>
                        <option value="price-asc">Price (low → high)</option>
                        <option value="symbol-asc">Symbol (A → Z)</option>
                    </Select>

                    <Button variant="outlined" size="small">
                        More Filters
                    </Button>
                </Box>

                {/* Scrollable Stock Grid container */}
                {filtered.length === 0 ? (
                    <Typography>No stocks found matching your criteria.</Typography>
                ) : (
                    <div data-testid="stock-grid" className="overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filtered.map((s) => (
                                <div
                                    key={s.symbol}
                                    data-testid={`stock-card-${s.symbol}`}
                                    className="cursor-pointer"
                                    onClick={() => handleCardClick(String(s.symbol))}
                                >
                                    <StockCard
                                        ticker={String(s.symbol)}
                                        companyName={String(s.name)}
                                        moneyz={s.currentPrice ?? 0}
                                        prediction={s.trend === 'up' ? 'UP' : 'DOWN'}
                                        confidence={Math.round((s.confidence ?? 0) * 100)}
                                        riskLevel={(s.riskLevel as any) ?? 'Moderate'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Container>
            <Footer />
        </div>
    );
}
