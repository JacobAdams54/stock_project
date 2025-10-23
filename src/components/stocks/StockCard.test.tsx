// src/components/stocks/StockCard.test.tsx
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import StockCard from "./StockCard";

afterEach(() => cleanup());

describe("StockCard", () => {
  test("renders ticker, company name, and key fields", () => {
    render(
      <StockCard
        ticker="AAPL"
        companyName="Apple Inc."
        moneyz={173.25}
        prediction="UP"
        confidence={85}
        riskLevel="Low"
      />
    );

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText(/Today's price/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Prediction/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk/i)).toBeInTheDocument();
  });

  test("applies correct colors for prediction and risk", () => {
    const { rerender } = render(
      <StockCard
        ticker="TSLA"
        companyName="Tesla"
        moneyz={210}
        prediction="UP"
        confidence={90}
        riskLevel="Low"
      />
    );

    const predictionEl = screen.getByText("UP");
    expect(predictionEl).toHaveStyle("color: #107435ff");

    rerender(
      <StockCard
        ticker="TSLA"
        companyName="Tesla"
        moneyz={210}
        prediction="DOWN"
        confidence={90}
        riskLevel="High"
      />
    );

    const predictionDown = screen.getByText("DOWN");
    expect(predictionDown).toHaveStyle("color: #df2121ff");
  });
});
