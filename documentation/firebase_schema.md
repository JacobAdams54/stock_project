# Firestore Schema Documentation

## 1. High-Level Overview

Root collections:

* `config`
* `debug` *depracated*
* `market_regime`
* `prices` *depracated*
* `stock_predictions`
* `stock_prices`
* `stocks`
* `users`

Core ideas:

* **Ticker-centric data model**: All stock-related collections (`stocks`, `stock_prices`, `stock_predictions`) use the ticker symbol as the document ID (e.g. `AAPL`, `ABBV`).
* **Time-series stored as maps**: Historical series are stored as nested maps keyed by `YYYY-MM-DD`.
* **Per-user preferences**: `users` holds UI/model preferences and terms acceptance.
* **Global configuration**: `config` and `market_regime` hold app-wide configuration and macro features.

---

## 2. `config` Collection

### Purpose

Global application configuration and feature flags.

### Documents

#### `config/flags`

**Path:** `config/flags`
**Description:** Boolean flags to control global UI and maintenance behavior.

**Fields**

| Field                | Type      | Description                                      |
| -------------------- | --------- | ------------------------------------------------ |
| `experimentalCharts` | `boolean` | Enables or disables experimental chart features. |
| `maintenanceMode`    | `boolean` | Puts the app into maintenance / readonly mode.   |

**Example**

```json
// config/flags
{
  "experimentalCharts": false,
  "maintenanceMode": false
}
```

---

## 3. `market_regime` Collection

### Purpose

Store macro/market-wide features used for regime detection, risk modeling, or strategy conditioning.

### Documents

#### `market_regime/market_regime_data`

**Path:** `market_regime/market_regime_data`
**Description:** Daily macro factors keyed by date.

**Top-level fields**

| Field  | Type                           | Description                                                              |
| ------ | ------------------------------ | ------------------------------------------------------------------------ |
| `data` | `map<string, MarketRegimeDay>` | Map from ISO date string (`"YYYY-MM-DD"`) to a struct of macro features. |

**`MarketRegimeDay` structure (per date key)**

All values are numeric (`double` / `number`):

| Field                | Description                       |
| -------------------- | --------------------------------- |
| `gold_return`        | Daily return of gold.             |
| `risk_on_ratio`      | Risk-on / risk-off ratio metric.  |
| `spy_return_1d`      | 1-day return of SPY.              |
| `spy_return_5d`      | 5-day return of SPY.              |
| `spy_return_20d`     | 20-day return of SPY.             |
| `spy_volatility_20d` | 20-day rolling volatility of SPY. |
| `vix_change`         | Daily change in VIX.              |
| `vix_level`          | Current VIX level.                |
| `vix_ma_20`          | 20-day moving average of VIX.     |
| `yield_10y`          | 10-year Treasury yield.           |
| `yield_change`       | Daily change in 10-year yield.    |

**Example**

```json
// market_regime/market_regime_data
{
  "data": {
    "2025-02-03": {
      "gold_return": 0.005337271410283728,
      "risk_on_ratio": 2.908045824694644,
      "spy_return_1d": -0.0067295666554251942,
      "spy_return_5d": -0.0026694288986299775,
      "spy_return_20d": 0.0224582770428613,
      "spy_volatility_20d": 0.008932293216146645,
      "vix_change": 0.1332927871807601,
      "vix_level": 18.6200008392334,
      "vix_ma_20": 16.780500221252442,
      "yield_10y": 4.543000221252441,
      "yield_change": -0.005690424026081664
    },
    "2025-02-04": {
      "...": "..."
    }
  }
}
```

---

## 4. `stock_predictions` Collection

### Purpose

Store model-based predictions per stock. Each document corresponds to a prediction model.

### Documents

Known model documents: `arimax`, `dl`, `xgboost`.

#### Example: `stock_predictions/arimax`

**Path:** `stock_predictions/arimax`
**Description:** Latest predictions from the **arimax** model.

**Fields**

| Field       | Type                           | Description                            |
| ----------- | ------------------------------ | -------------------------------------- |
| `predicted` | `map<string, StockPrediction>` | Map from ticker to prediction details. |

**`StockPrediction` structure (per ticker)**

| Field         | Type     | Description                                   |
| ------------- | -------- | --------------------------------------------- |
| `direction`   | `string` | `"up"` or `"down"` indicating predicted move. |
| `probability` | `number` | Model confidence for the predicted direction. |

**Example**

```json
// stock_predictions/arimax
{
  "predicted": {
    "AAPL": {
      "direction": "up",
      "probability": 0.5039360628397085
    },
    "ABBV": {
      "direction": "down",
      "probability": 0.5161893250142595
    },
    "ABT": {
      "direction": "up",
      "probability": 0.5000771602307579
    },
    "ACN": {
      "direction": "up",
      "probability": 0.5036133533155223
    }
  }
}
```

**Conventions**

* Document ID = model name (`"arimax"`, `"dl"`, `"xgboost"`).
* Keys under `predicted` = ticker symbols shared with `stocks` / `stock_prices`.

---

## 5. `stock_prices` Collection

### Purpose

Historical OHLCV time-series for each ticker.

### Documents

One document per ticker, e.g. `stock_prices/AAPL`.

#### `stock_prices/{ticker}`

**Path pattern:** `stock_prices/{ticker}` (e.g. `stock_prices/AAPL`)
**Description:** Daily price and volume history.

**Fields**

| Field   | Type                      | Description                                      |
| ------- | ------------------------- | ------------------------------------------------ |
| `daily` | `map<string, OhlcvPoint>` | Map from date string to OHLCV bar for that date. |

**`OhlcvPoint` structure (per date key)**

All numeric (`double` / `number` for prices, `number` for volume):

| Field | Description   |
| ----- | ------------- |
| `o`   | Open price.   |
| `h`   | High price.   |
| `l`   | Low price.    |
| `c`   | Close price.  |
| `v`   | Trade volume. |

**Example**

```json
// stock_prices/AAPL
{
  "daily": {
    "2020-12-02": {
      "o": 118.78065073270163,
      "h": 120.0948173273605,
      "l": 117.68065226704212,
      "c": 119.81251525878906,
      "v": 89004200
    },
    "2020-12-03": {
      "o": 120.24082808918226,
      "h": 120.49392777356492,
      "l": 118.96560791819012,
      "c": 119.67623138427734,
      "v": 78967600
    }
  }
}
```

**Conventions**

* Document ID = ticker symbol.
* Date keys are strings in `YYYY-MM-DD` format, aligned with `market_regime.data` dates.

---

## 6. `stocks` Collection

### Purpose

Static and quote-level metadata for each stock ticker (company profile, current quote, visibility).

### Documents

One document per ticker, e.g. `stocks/AAPL`.

#### `stocks/{ticker}`

**Path pattern:** `stocks/{ticker}` (e.g. `stocks/AAPL`)
**Description:** Metadata and latest quote for a stock.

**Fields**
(From the `AAPL` example; additional fields may exist following similar patterns.)

| Field                  | Type        | Description                                    |
| ---------------------- | ----------- | ---------------------------------------------- |
| `address1`             | `string`    | Primary company address.                       |
| `change24hPercent`     | `number`    | 24-hour price change in percent.               |
| `city`                 | `string`    | City of corporate address.                     |
| `companyName`          | `string`    | Full company name.                             |
| `country`              | `string`    | Country of headquarters.                       |
| `currentPrice`         | `number`    | Latest price snapshot used by the app.         |
| `dividendYield`        | `number`    | Dividend yield as fraction.                    |
| `dividendYieldPercent` | `number`    | Dividend yield in percent.                     |
| `fiftyTwoWeekHigh`     | `number`    | 52-week high price.                            |
| `fiftyTwoWeekLow`      | `number`    | 52-week low price.                             |
| `industry`             | `string`    | Industry / sector classification.              |
| `isVisible`            | `boolean`   | Whether this ticker should be shown in the UI. |
| `lastUpdated`          | `timestamp` | When this metadata/quote was last refreshed.   |
| `marketCap`            | `number`    | Market capitalization.                         |
| `open`                 | `number`    | Most recent session open price.                |

**Example**

```json
// stocks/AAPL
{
  "address1": "One Apple Park Way",
  "change24hPercent": 2.2791226,
  "city": "Cupertino",
  "companyName": "Apple Inc.",
  "country": "United States",
  "currentPrice": 268.81,
  "dividendYield": 0.004,
  "dividendYieldPercent": 0.4,
  "fiftyTwoWeekHigh": 269.08,
  "fiftyTwoWeekLow": 169.21,
  "industry": "Consumer Electronics",
  "isVisible": true,
  "lastUpdated": <timestamp>,  // November 1, 2025, 3:53:57 PM UTC-7 in UI
  "marketCap": 3989245001728,
  "open": 264.88
}
```

---

## 7. `users` Collection

### Purpose

Store per-user profile data, configuration, and terms-of-service acceptance.

### Documents

One document per authenticated user; document ID is the Firebase Auth UID.

#### `users/{uid}`

**Path pattern:** `users/{uid}`
**Example ID:** `Llpc4QUIN2fVHsrIBCearJ84Udy2`

**Top-level fields**

| Field         | Type        | Description                            |
| ------------- | ----------- | -------------------------------------- |
| `createdAt`   | `timestamp` | Account creation time in the app.      |
| `displayName` | `string`    | User-facing display name.              |
| `isAdmin`     | `boolean`   | Admin/privileged-user flag.            |
| `preferences` | `map`       | User UI/model preferences (see below). |
| `terms`       | `map`       | Terms of service acceptance data.      |

**`preferences` sub-fields**

| Field             | Type            | Description                                        |
| ----------------- | --------------- | -------------------------------------------------- |
| `availableModels` | `array<string>` | Models the user can choose from (e.g. `"arimax"`). |
| `preferredModel`  | `string`        | Currently selected prediction model.               |
| `watchlist`       | `array<string>` | List of ticker symbols the user is watching.       |

**`terms` sub-fields**

| Field        | Type        | Description                                               |
| ------------ | ----------- | --------------------------------------------------------- |
| `accepted`   | `boolean`   | Whether the user has accepted the terms.                  |
| `acceptedAt` | `timestamp` | Timestamp when terms were accepted.                       |
| `version`    | `string`    | Version identifier of the accepted terms (e.g. `"v1.0"`). |

**Example**

```json
// users/Llpc4QUIN2fVHsrIBCearJ84Udy2
{
  "createdAt": <timestamp>,  // December 1, 2025, 2:45:10 PM UTC-8
  "displayName": "Julian Vara",
  "isAdmin": true,
  "preferences": {
    "availableModels": ["arimax"],
    "preferredModel": "arimax",
    "watchlist": ["AAPL"]
  },
  "terms": {
    "accepted": true,
    "acceptedAt": <timestamp>, // December 1, 2025, 2:45:10 PM UTC-8
    "version": "v1.0"
  }
}
```

---

## 8. Cross-Collection Relationships

* **Ticker Symbol Keying**

  * `stocks/{ticker}`, `stock_prices/{ticker}`, and `stock_predictions/{model}.predicted[{ticker}]` all use the same ticker code (e.g. `"AAPL"`).
  * User watchlists (`users/{uid}.preferences.watchlist[]`) refer to these same tickers.

* **Date Alignment**

  * `stock_prices/{ticker}.daily[{date}]` and `market_regime/market_regime_data.data[{date}]` both key by `YYYY-MM-DD`, allowing easy joins on date.

* **Model Names**

  * `users/{uid}.preferences.availableModels[]` and `preferredModel` reference document IDs in `stock_predictions`.
