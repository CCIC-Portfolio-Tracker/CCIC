let tableData = [
    ["Ticker1", 1, 2, 3, 4, 5, 6, 7, "Tech"],
    ["Ticker2", 2, 4, 6, 8, 10, 12, 14, "Healthcare"],
  ];
  
  // create a grid.js grid and add columns
  const grid = new gridjs.Grid({
    columns: [
      "Ticker",
      "Shares",
      "Purchase Price",
      "Current Price",
      "Total Value",
      "Gain/Loss($)",
      "Gain/Loss(%)",
      "% of Portfolio",
      "Sector",
    ],
    data: tableData,
    sort: true,
    search: true,
    resizable: true,
    width: "75%",
    style: {
      table: {
        'font-family': 'Arial, sans-serif',
        'font-size': '14px',
      },
      th: {
        'background-color': '#f2f2f2',
        'color': '#333',
        'padding': '10px',
        'text-align': 'left',
      },
      td: {
        'padding': '10px',
        'border-bottom': '1px solid #ddd',
      },
    }
  });
  
  grid.render(document.getElementById("wrapper"));
  
  // connect button to add data
  document.getElementById("add-row-btn").addEventListener("click", () => {
    // maybe filter to ensure a valid ticker?
    const ticker = prompt("Enter Ticker (e.g., AAPL):");
    if (!ticker) return;
  
    const sharesStr = prompt("Enter Shares:");
    if (!sharesStr) return;
  
    // if shares is not a number reject input
    const shares = Number(sharesStr);
    if (Number.isNaN(shares)) {
      alert("Shares must be a number.");
      return;
    }
  
    // for now, default the calculated fields to 0
    const purchasePrice = 0;
    const currentPrice = 0;
    const totalValue = 0;
    const gainLossDollar = 0;
    const gainLossPercent = 0;
    const percentOfPortfolio = 0;
    const sector = prompt("Enter Sector:") || "";
  
    tableData.push([
      ticker,
      shares,
      purchasePrice,
      currentPrice,
      totalValue,
      gainLossDollar,
      gainLossPercent,
      percentOfPortfolio,
      sector,
    ]);
  
    grid.updateConfig({ data: tableData }).forceRender();
  });
  