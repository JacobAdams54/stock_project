// StockChart.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StockChart, { Range, Point } from "./StockChart";

/** ---------- JSDOM sizing + RO mocks (must run before rendering) ---------- */
beforeAll(() => {
  // Mock ResizeObserver so ResponsiveContainer gets a size
  class MockResizeObserver {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe = (target: Element) => {
      const entry: ResizeObserverEntry = {
        target,
        contentRect: {
          width: 820,
          height: 360,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 820,
          bottom: 360,
          toJSON: () => {},
        } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };
      // Immediately report a stable size
      this.cb([entry], this as unknown as ResizeObserver);
    };
    unobserve() {}
    disconnect() {}
  }
  (global as any).ResizeObserver = MockResizeObserver;

  // Return non-zero layout metrics globally (many libs read these)
  const rect = {
    width: 820,
    height: 360,
    top: 0,
    left: 0,
    right: 820,
    bottom: 360,
    x: 0,
    y: 0,
    toJSON: () => {},
  };

  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 820,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => 360,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: () => 820,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: () => 360,
  });

  // Quiet the Recharts "width(-1)/height(-1)" warnings in test output
  jest.spyOn(console, "warn").mockImplementation((...args) => {
    if (typeof args[0] === "string" && args[0].includes("The width(")) return;
    // @ts-ignore
    return jest.requireActual("console").warn(...args);
  });
});

/** ---------- Helpers ---------- */
const renderWithHost = (ui: React.ReactElement) => {
  return render(<div style={{ width: 820, height: 400 }}>{ui}</div>);
};

const getXAxisTickTexts = (): string[] => {
  const tspans = document.querySelectorAll(
    ".recharts-xAxis .recharts-cartesian-axis-tick-value tspan"
  );
  return Array.from(tspans).map((t) => (t.textContent || "").trim());
};

const genDaily = (startISO: string, days: number, startPrice = 100): Point[] => {
  const start = new Date(startISO + "T00:00:00Z");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return { date: `${yyyy}-${mm}-${dd}`, price: startPrice + i };
  });
};

const genMonthly = (startYYYYMM = "2024-01", months = 12, startPrice = 100): Point[] => {
  const [y, m] = startYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return { date: `${yyyy}-${mm}-01`, price: startPrice + i * 2 };
  });
};

const genYearly = (startYear = 2021, years = 5, startPrice = 100): Point[] =>
  Array.from({ length: years }, (_, i) => ({ date: `${startYear + i}-01-01`, price: startPrice + i * 10 }));

/** ---------- Tests ---------- */
describe("StockChart", () => {
  test("renders header with ticker and range", () => {
    const data = genDaily("2025-09-01", 7);
    renderWithHost(
      <StockChart ticker="tsla" data={data} range="1W" onRangeChange={() => {}} />
    );
    expect(
      screen.getByText(/TSLA Stock Performance \(1W\)/i)
    ).toBeInTheDocument();
  });

  test("invokes onRangeChange when a different range is selected", () => {
    const data = genDaily("2025-09-01", 30);
    const onRangeChange = jest.fn();
    renderWithHost(
      <StockChart ticker="AAPL" data={data} range="1M" onRangeChange={onRangeChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: "3M" }));
    expect(onRangeChange).toHaveBeenCalledTimes(1);
    expect(onRangeChange).toHaveBeenCalledWith("3M");
  });

  test("renders an SVG chart", () => {
    const data = genDaily("2025-09-01", 20);
    const { container } = renderWithHost(
      <StockChart ticker="MSFT" data={data} range="1M" onRangeChange={() => {}} />
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  test("renders some X-axis tick labels for short ranges (e.g., 1M)", () => {
    const data = genDaily("2025-09-01", 30);
    renderWithHost(
      <StockChart ticker="AAPL" data={data} range="1M" onRangeChange={() => {}} />
    );
    const ticks = getXAxisTickTexts();
    // Recharts may collapse ticks; just ensure we at least render something non-empty
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.some((t) => t.length > 0)).toBe(true);
  });

  test("renders some X-axis tick labels for 1Y", () => {
    const data = genMonthly("2024-01", 12);
    renderWithHost(
      <StockChart ticker="AAPL" data={data} range="1Y" onRangeChange={() => {}} />
    );
    const ticks = getXAxisTickTexts();
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.some((t) => t.length > 0)).toBe(true);
  });

  test("renders at least one 4-digit year tick for 5Y (labels can be collapsed)", () => {
    const data = genYearly(2021, 5);
    renderWithHost(
      <StockChart ticker="AAPL" data={data} range="5Y" onRangeChange={() => {}} />
    );
    const ticks = getXAxisTickTexts();
    expect(ticks.length).toBeGreaterThan(0);
    // Recharts may pick a subset (often the last year). Accept any 4-digit year.
    expect(ticks.some((t) => /\b\d{4}\b/.test(t))).toBe(true);
  });
});
