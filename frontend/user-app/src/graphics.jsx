import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./graphics.css";

// Graphics page to display charts of portfolio performance and sector allocation
function Graphics() {
  const RANGE_ENDPOINTS = {
    "1y": "https://ccic.onrender.com/api/total-value",
    "6m": "https://ccic.onrender.com/api/six-months",
    "3m": "https://ccic.onrender.com/api/three-months",
    "ytd": "https://ccic.onrender.com/api/ytd",
  };

  // Chart 2 uses the same base endpoints as Chart 1, but with "-twr"
  const getTwrEndpoint = (rangeKey) => {
    const base = RANGE_ENDPOINTS[rangeKey];
    return base ? `${base}-twr` : null;
  };

  // dropdown state for charts
  const [sel1, setSel1] = useState("1y");
  const [sel2, setSel2] = useState("1y");

  // chart series state
  const [chart1Series, setChart1Series] = useState({ labels: [], data: [] });
  const [chart2Series, setChart2Series] = useState({ labels: [], data: [] });

  // canvas refs
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);

  // chart instance refs
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);

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

  // create charts
  useEffect(() => {
    if (!canvasRef1.current || !canvasRef2.current || !canvasRef3.current) return;

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

    // Chart 3 (100% stacked bar)
    chartRef3.current = new Chart(canvasRef3.current, {
      type: "bar",
      data: {
        labels: ["Year1", "Year2", "Year3", "Year4", "Year5"],
        datasets: [
          {
            label: "Tech",
            data: [38, 40, 42, 41, 39],
            borderWidth: 1,
          },
          {
            label: "Healthcare",
            data: [24, 23, 22, 23, 24],
            borderWidth: 1,
          },
          {
            label: "Energy/Infrastructure",
            data: [22, 21, 20, 21, 22],
            borderWidth: 1,
          },
          {
            label: "Consumer",
            data: [10, 10, 10, 9, 10],
            borderWidth: 1,
          },
          {
            label: "Emerging Markets",
            data: [6, 6, 6, 6, 5],
            borderWidth: 1,
          },
        ],
      },
      options: {
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
      },
    });

    return () => {
      chartRef1.current?.destroy();
      chartRef2.current?.destroy();
      chartRef3.current?.destroy();
      chartRef1.current = null;
      chartRef2.current = null;
      chartRef3.current = null;
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

      <div className="chart-single">
        <div className="chart-box">
          <div className="chart-header">
            <h3>Sector Allocation</h3>
          </div>

          <div className="chart-canvas">
            <canvas ref={canvasRef3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Graphics;
