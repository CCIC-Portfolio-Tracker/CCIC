import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./graphics.css";

/**
 * Generates a graphics to display charts of portfolio performance and sector allocation
 * @returns Graphics page
 */
function Graphics() {
  const RANGE_ENDPOINTS = {
    "1y": "/api/total-value",
    "6m": "/api/six-months",
    "3m": "/api/three-months",
    "ytd": "/api/ytd",
  };

  // Chart 2 uses the same base endpoints as Chart 1, but with "-twr"
  const getTwrEndpoint = (rangeKey) => {
    const base = RANGE_ENDPOINTS[rangeKey];
    return base ? `${base}-twr` : null;
  };

  // Chart 3/4 (sector allocation)
  const SECTOR_ENDPOINT = "/api/sector";

  // dropdown state for charts
  const [sel1, setSel1] = useState("1y");
  const [sel2, setSel2] = useState("1y");

  // chart series state
  const [chart1Series, setChart1Series] = useState({ labels: [], data: [] });
  const [chart2Series, setChart2Series] = useState({ labels: [], data: [] });

  // Chart 3/4 series state (single stacked bar that sums to 100%)
  const [chart3Series, setChart3Series] = useState({
    labels: ["Current"],
    datasets: [],
  });
  const [chart4Series, setChart4Series] = useState({
    labels: ["Historical"],
    datasets: [],
  });

  // canvas refs
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);
  const canvasRef4 = useRef(null);

  // chart instance refs
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);
  const chartRef4 = useRef(null);

  // get chart 1 data
  useEffect(() => {
    let cancelled = false;

    async function fetchChart1() {
      try {
        const endpoint = RANGE_ENDPOINTS[sel1];
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Chart 1 fetch failed: ${res.status}`);

        const rows = await res.json(); // [{ value, date }]

        if (cancelled) return;

        setChart1Series({
          labels: rows.map((r) => r.date),
          data: rows.map((r) => Number(r.value)),
        });
      } catch (err) {
        console.error("Failed to fetch chart 1:", err);
      }
    }

    fetchChart1();
    return () => {
      cancelled = true;
    };
  }, [sel1]);

  // get chart 2 data
  useEffect(() => {
    let cancelled = false;

    async function fetchChart2() {
      try {
        const endpoint = getTwrEndpoint(sel2);
        if (!endpoint) throw new Error(`Unknown range key for Chart 2: ${sel2}`);

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Chart 2 fetch failed: ${res.status}`);

        const rows = await res.json(); // [{ value, date }]

        if (cancelled) return;

        setChart2Series({
          labels: rows.map((r) => r.date),
          data: rows.map((r) => Number(r.value)),
        });
      } catch (err) {
        console.error("Failed to fetch chart 2:", err);
      }
    }

    fetchChart2();
    return () => {
      cancelled = true;
    };
  }, [sel2]);

  // convert backend data to correctly formatted datasets for Chart.js stacked bar
  const buildSectorDatasets = (alloc) => {
    const sectors = [
      { label: "Technology", key: "techPercent" },
      { label: "Healthcare", key: "healthPercent" },
      { label: "Energy/Infrastructure", key: "energyPercent" },
      { label: "Consumer", key: "consumerPercent" },
      { label: "Financials", key: "financialPercent" },
      { label: "Aerospace & Defense", key: "aeroPercent" },
      { label: "Real Estate", key: "realPercent" },
      { label: "Emerging Markets", key: "emergPercent" },
      { label: "ETF", key: "etfPercent" },
      { label: "Bankruptcy", key: "bankPercent" },
      { label: "Other", key: "otherPercent" },
    ];

    return sectors.map((s) => ({
      label: s.label,
      data: [Number(alloc?.[s.key] ?? 0)], 
      borderWidth: 1,
    }));
  };

  // get chart 3 and 4 data (sector allocation current + historical)
  useEffect(() => {
    let cancelled = false;

    async function fetchSectors() {
      try {
        const res = await fetch(SECTOR_ENDPOINT);
        if (!res.ok) throw new Error(`Sector fetch failed: ${res.status}`);

        // { current: {...}, historical: {...} }
        const payload = await res.json();

        if (cancelled) return;

        setChart3Series({
          labels: ["Current"],
          datasets: buildSectorDatasets(payload?.current),
        });

        setChart4Series({
          labels: ["Year Ago"],
          datasets: buildSectorDatasets(payload?.historical),
        });
      } catch (err) {
        console.error("Failed to fetch sector data:", err);
      }
    }

    fetchSectors();
    return () => {
      cancelled = true;
    };
  }, []);

  // create charts
  useEffect(() => {
    if (
      !canvasRef1.current ||
      !canvasRef2.current ||
      !canvasRef3.current ||
      !canvasRef4.current
    )
      return;

    // Chart 1 (line)
    chartRef1.current = new Chart(canvasRef1.current, {
      type: "line",
      data: {
        labels: chart1Series.labels,
        datasets: [
          {
            label: "Total Portfolio Value",
            data: chart1Series.data,
            tension: 0.3,
            borderWidth: 2,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });

    // Chart 2 (line)
    chartRef2.current = new Chart(canvasRef2.current, {
      type: "line",
      data: {
        labels: chart2Series.labels,
        datasets: [
          {
            label: "Time Weighted Returns",
            data: chart2Series.data,
            tension: 0.3,
            borderWidth: 2,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });

    //  Chart 3 and Chart 4 (100% stacked bar)
    const stackedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          min: 0,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
          },
        },
      },
    };

    // Chart 3 (Current sector allocation)
    chartRef3.current = new Chart(canvasRef3.current, {
      type: "bar",
      data: {
        labels: chart3Series.labels,
        datasets: chart3Series.datasets,
      },
      options: stackedOptions,
    });

    // Chart 4 (Historical sector allocation)
    chartRef4.current = new Chart(canvasRef4.current, {
      type: "bar",
      data: {
        labels: chart4Series.labels,
        datasets: chart4Series.datasets,
      },
      options: stackedOptions,
    });

    return () => {
      chartRef1.current?.destroy();
      chartRef2.current?.destroy();
      chartRef3.current?.destroy();
      chartRef4.current?.destroy();
      chartRef1.current = null;
      chartRef2.current = null;
      chartRef3.current = null;
      chartRef4.current = null;
    };
  }, []);

  // update chart 1
  useEffect(() => {
    const chart = chartRef1.current;
    if (!chart) return;

    chart.data.labels = chart1Series.labels;
    chart.data.datasets[0].data = chart1Series.data;
    chart.update();
  }, [chart1Series]);

  // update chart 2
  useEffect(() => {
    const chart = chartRef2.current;
    if (!chart) return;

    chart.data.labels = chart2Series.labels;
    chart.data.datasets[0].data = chart2Series.data;
    chart.update();
  }, [chart2Series]);

  // update chart 3 (current)
  useEffect(() => {
    const chart = chartRef3.current;
    if (!chart) return;

    chart.data.labels = chart3Series.labels;
    chart.data.datasets = chart3Series.datasets;
    chart.update();
  }, [chart3Series]);

  // update chart 4 (historical)
  useEffect(() => {
    const chart = chartRef4.current;
    if (!chart) return;

    chart.data.labels = chart4Series.labels;
    chart.data.datasets = chart4Series.datasets;
    chart.update();
  }, [chart4Series]);

  // Return graphics
  return (
    <div className="charts-page">
      <div className="charts-row">
        <div className="chart-box">
          <div className="chart-header">
            <h3>Total Returns</h3>
            <select value={sel1} onChange={(e) => setSel1(e.target.value)}>
              <option value="1y">1 Year</option>
              <option value="6m">6 Months</option>
              <option value="3m">3 Months</option>
              <option value="ytd">YTD</option>
            </select>
          </div>

          <div className="chart-canvas">
            <canvas ref={canvasRef1} />
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <h3>Time Weighted Returns</h3>
            <select value={sel2} onChange={(e) => setSel2(e.target.value)}>
              <option value="1y">1 Year</option>
              <option value="6m">6 Months</option>
              <option value="3m">3 Months</option>
              <option value="ytd">YTD</option>
            </select>
          </div>

          <div className="chart-canvas">
            <canvas ref={canvasRef2} />
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <div className="chart-header">
            <h3>Current Sector Allocation</h3>
          </div>

          <div className="chart-canvas">
            <canvas ref={canvasRef3} />
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <h3>Year Ago Sector Allocation</h3>
          </div>

          <div className="chart-canvas">
            <canvas ref={canvasRef4} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Graphics;
