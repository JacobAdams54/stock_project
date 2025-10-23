import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { date: "Jan 1", price: 150.25 },
    { date: "Jan 8", price: 155.80 },
    { date: "Jan 15", price: 148.90 },
    { date: "Jan 22", price: 162.45 },
    { date: "Jan 29", price: 158.30 },
    { date: "Feb 5", price: 165.70 },
    { date: "Feb 12", price: 171.25 },
    { date: "Feb 19", price: 168.40 },
    { date: "Feb 26", price: 175.80 },
    { date: "Mar 5", price: 182.15 },
];

export default function StockChart() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">AAPL Stock Performance</h3>
                <p className="text-sm text-gray-500">Last 10 weeks</p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#0d9488"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#0d9488" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}