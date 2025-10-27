//StockList.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StockList from "./StockList";

describe("StockList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filters and grid", () => {
    render(<StockList />);
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more filters/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /open .* details/i }).length).toBeGreaterThan(0);
  });

  it("filters by search query (symbol or name)", () => {
    render(<StockList />);
    const input = screen.getByLabelText(/search/i);
    fireEvent.change(input, { target: { value: "aapl" } });
    expect(screen.getByText(/apple inc\./i)).toBeInTheDocument();
  });

  it("filters by sector", async () => {
    render(<StockList />);

    // ✅ first combobox = Sector
    const [sectorSelect] = screen.getAllByRole("combobox");
    await userEvent.click(sectorSelect);

    // Menu items are rendered in a portal
    const tech = await screen.findByRole("option", { name: /technology/i });
    await userEvent.click(tech);

    expect(screen.getAllByRole("button", { name: /open .* details/i }).length).toBeGreaterThan(0);
  });

  it("sorts by symbol", async () => {
    render(<StockList />);

    // ✅ second combobox = Sort
    const sortSelect = screen.getAllByRole("combobox")[1];
    await userEvent.click(sortSelect);

    const bySymbol = await screen.findByRole("option", { name: /symbol/i });
    await userEvent.click(bySymbol);

    const cardButtons = screen.getAllByRole("button", { name: /open .* details/i });
    const symbols = cardButtons
      .map((btn) => btn.getAttribute("aria-label") || "")
      .map((s) => s.match(/open (.*) details/i)?.[1])
      .filter(Boolean) as string[];
    const sortedCopy = [...symbols].sort((a, b) => a.localeCompare(b));
    expect(symbols).toEqual(sortedCopy);
  });

  it("navigates to detail on card click via custom event", () => {
    const spy = jest.spyOn(window, "dispatchEvent");
    render(<StockList />);
    const firstCard = screen.getAllByRole("button", { name: /open .* details/i })[0];
    fireEvent.click(firstCard);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "navigate",
        detail: expect.objectContaining({ page: "stock-detail" }),
      })
    );
  });

  it("shows empty state when no results", () => {
    render(<StockList />);
    const input = screen.getByLabelText(/search/i);
    fireEvent.change(input, { target: { value: "NO_MATCH_1234" } });
    expect(screen.getByText(/no stocks found matching your criteria/i)).toBeInTheDocument();
  });
});
