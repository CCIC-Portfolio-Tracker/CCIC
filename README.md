# CCIC
# CCIC Portfolio Tracker

A full-stack web application designed to track, manage, and visualize the investment portfolio for the CCIC (College Investment Club). This system replaces manual spreadsheets with real-time data fetching, historical performance tracking, and secure role-based access.

## Features

* **Real-Time Data:** Automatically fetches live stock prices via the Yahoo Finance API.
* **Performance Tracking:** Calculates Total Value, Time-Weighted Returns (TWR), and Sector Breakdowns dynamically.
* **Historical Backfilling:** Automatically detects data gaps (e.g., after server downtime) and backfills historical prices to ensure continuous graphing.
* **Interactive Visualizations:** Dynamic line charts (Chart.js) and sortable data grids (Grid.js) for portfolio analysis.
* **Secure Authentication:** Integrates with School CAS via OpenID Connect (OIDC) for secure login.
* **Role-Based Access Control (RBAC):** Differentiates between Admins (Buy/Sell access) and Viewers (Read-only access).

## Tech Stack

**Frontend:**
* **React.js:** Single Page Application (SPA) architecture.
* **Chart.js:** For rendering time-series performance graphs.
* **Grid.js:** For responsive, sortable holdings tables.
* **CSS Modules:** For scoped, component-level styling.

**Backend:**
* **Node.js & Express:** RESTful API handling business logic and data aggregation.
* **SQLite:** Relational database for persistent storage of users, tickers, and price history.
* **Yahoo-Finance2:** External data provider for market quotes.
* **Decimal.js:** Handles high-precision financial arithmetic to prevent floating-point errors.

## Authors

* **[James Treadwell]** - *Backend & Database*
* **[Noe Shoor]** - *Frontend & Visualization*

## License

This project is for academic use by the CCIC.
