import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import PredictionCard from "./PredictionCard";

afterEach(cleanup);

const GREEN = "#107435ff";
const RED = "#df2121ff";

// Bullish palette
const BULL_BG = "#ecfdf5";
const BULL_BORDER = "#bbf7d0";
const BULL_TEXT = "#065f46";

// Bearish palette
const BEAR_BG = "#fef2f2";
const BEAR_BORDER = "#fecaca";
const BEAR_TEXT = "#7f1d1d";

describe("PredictionCard – color and message matrix", () => {
  test("Bullish + STRONG confidence (>=57): green icon/text, bullish strong message, green summary box", () => {
    render(<PredictionCard trend="Bullish" confidence={80} />);

    const icon = screen.getByTestId("trend-icon");
    const trendText = screen.getByTestId("trend-text");
    const summaryBox = screen.getByTestId("summary-box");

    expect(trendText).toHaveTextContent("Bullish");
    expect(icon).toHaveStyle(`color: ${GREEN}`);
    expect(trendText).toHaveStyle(`color: ${GREEN}`);

    // summary content
    expect(
      screen.getByText(/strong upward momentum/i)
    ).toBeInTheDocument();

    // summary box colors
    expect(summaryBox).toHaveStyle(`background-color: ${BULL_BG}`);
    expect(summaryBox).toHaveStyle(`border-color: ${BULL_BORDER}`);
    expect(summaryBox).toHaveStyle(`color: ${BULL_TEXT}`);
  });

  test("Bullish + WEAK confidence (<57): green icon/text, bullish weak message, green summary box", () => {
    render(<PredictionCard trend="Bullish" confidence={40} />);

    const icon = screen.getByTestId("trend-icon");
    const trendText = screen.getByTestId("trend-text");
    const summaryBox = screen.getByTestId("summary-box");

    expect(trendText).toHaveTextContent("Bullish");
    expect(icon).toHaveStyle(`color: ${GREEN}`);
    expect(trendText).toHaveStyle(`color: ${GREEN}`);

    expect(
      screen.getByText(/weak upward momentum/i)
    ).toBeInTheDocument();

    expect(summaryBox).toHaveStyle(`background-color: ${BULL_BG}`);
    expect(summaryBox).toHaveStyle(`border-color: ${BULL_BORDER}`);
    expect(summaryBox).toHaveStyle(`color: ${BULL_TEXT}`);
  });

  test("Bearish + STRONG confidence (>=57): red icon/text, bearish strong message, red summary box", () => {
    render(<PredictionCard trend="Bearish" confidence={75} />);

    const icon = screen.getByTestId("trend-icon");
    const trendText = screen.getByTestId("trend-text");
    const summaryBox = screen.getByTestId("summary-box");

    expect(trendText).toHaveTextContent("Bearish");
    expect(icon).toHaveStyle(`color: ${RED}`);
    expect(trendText).toHaveStyle(`color: ${RED}`);

    expect(
      screen.getByText(/strong downward momentum/i)
    ).toBeInTheDocument();

    expect(summaryBox).toHaveStyle(`background-color: ${BEAR_BG}`);
    expect(summaryBox).toHaveStyle(`border-color: ${BEAR_BORDER}`);
    expect(summaryBox).toHaveStyle(`color: ${BEAR_TEXT}`);
  });

  test("Bearish + WEAK confidence (<57): red icon/text, bearish weak message, red summary box", () => {
    render(<PredictionCard trend="Bearish" confidence={10} />);

    const icon = screen.getByTestId("trend-icon");
    const trendText = screen.getByTestId("trend-text");
    const summaryBox = screen.getByTestId("summary-box");

    expect(trendText).toHaveTextContent("Bearish");
    expect(icon).toHaveStyle(`color: ${RED}`);
    expect(trendText).toHaveStyle(`color: ${RED}`);

    expect(
      screen.getByText(/weak downward momentum/i)
    ).toBeInTheDocument();

    expect(summaryBox).toHaveStyle(`background-color: ${BEAR_BG}`);
    expect(summaryBox).toHaveStyle(`border-color: ${BEAR_BORDER}`);
    expect(summaryBox).toHaveStyle(`color: ${BEAR_TEXT}`);
  });

  test("Confidence row prints the percentage", () => {
    render(<PredictionCard trend="Bullish" confidence={62} />);
    expect(screen.getByText(/62%/)).toBeInTheDocument();
  });
});
