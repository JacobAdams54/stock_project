# Firebase Schema

The schema for the Firebase is in the order of:


---

## Structure Overview

Inside of the `daily` document, it has daily information from the **past 5 years**.

- Inside `daily`, it has all of the dates of the past 5 years formatted as **year-month-day**.
- Inside each date, it has information such as:
  - `close`
  - `high`
  - `low`
  - `open`
  - `volume`  
  *(in that order)*

Inside `prices`, it will have **all 100 stock tickers**, making it easier for the frontend to access and create graphs based on the data.

---

## Example Structure
```text
prices/
├── /
│   └── daily/
│       ├── 2020-01-01/
│       │   ├── close: float
│       │   ├── high: float
│       │   ├── low: float
│       │   ├── open: float
│       │   └── volume: integer
│       ├── 2020-01-02/
│       └── …
├── AAPL/
├── MSFT/
├── GOOGL/
└── …
```

---

## Details

- **Root Collection:** `prices`  
  Contains 100 stock tickers (e.g., `AAPL`, `MSFT`, `GOOGL`, etc.).

- **Subcollection:** `<ticker>/daily`  
  Holds documents for each trading day from the past 5 years.

- **Document ID Format:** `YYYY-MM-DD`  
  Each document represents a single trading day.

---

## Fields

| Field  | Type     | Description                     |
|--------|----------|---------------------------------|
| open   | float    | Opening price for the day        |
| high   | float    | Highest price during the day     |
| low    | float    | Lowest price during the day      |
| close  | float    | Closing price for the day        |
| volume | integer  | Number of shares traded          |

### Notes
- Data covers the last 5 years of trading days.
- Prices are stored in **USD**.
- Data updates occur daily.
- Designed for easy frontend access and graph rendering.