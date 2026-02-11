# CCIC
# CCIC Portfolio Tracker

A full-stack web application designed to track, manage, and visualize the investment portfolio for the CCIC (Colorado College Investment Club). This system replaces manual spreadsheets with real-time data fetching, historical performance tracking, and secure role-based access.

## Warnings

* Website may take a second to populate when first opened, as render may have spiraled down due to inactivity.
* Website may take a second to get historical data after not being opened for a while, as it is getting data for all of the missing dates.

## Features

* **Real-Time Data:** Automatically fetches live stock prices via the Yahoo Finance API.
* **Performance Tracking:** Calculates Total Value, Time-Weighted Returns (TWR), and Sector Breakdowns.
* **Historical Backfilling:** Backfills historical prices to ensure continuous data.
* **Interactive Visualizations:** Dynamic line charts (Chart.js) and sortable data grids (Grid.js) for portfolio analysis.
* **Secure Authentication:** Integrates with School CAS via OpenID Connect for secure login.
* **Role-Based Access Control (RBAC):** Differentiates between Admins (Buy/Sell access) and Viewers (Read-only access).

## Tech Stack

**Frontend:**
* **React.js**
* **Chart.js**
* **Grid.js**

**Backend:**
* **Node.js & Express**
* **SQLite** 
* **Yahoo-Finance2**
* **FinnHub**
* **OpenID Connect**
* **Decimal.js** 

## Authors

* **James Treadwell** - *Backend & Database*
* **Noe Shoor** - *Frontend & Visualization*

## License

This project is for academic use by the CCIC.
