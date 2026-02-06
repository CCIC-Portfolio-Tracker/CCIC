import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./graphics.css";

function Graphics() {
    // datasets for charts 1 & 2
    const datasetsByKey = useMemo(
        () => ({
            setA: {
                label: "Dataset A",
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                data: [100, 120, 115, 140, 160, 155],
            },
            setB: {
                label: "Dataset B",
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                data: [80, 95, 110, 105, 130, 150],
            },
            setC: {
                label: "Dataset C",
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                data: [60, 70, 90, 120, 125, 140],
            },
            }),
        []
  );

    // dropdown state for charts 1 & 2
    const [sel1, setSel1] = useState("setA");
    const [sel2, setSel2] = useState("setB");

    // canvas refs
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const canvasRef3 = useRef(null);

    // chart instance refs
    const chartRef1 = useRef(null);
    const chartRef2 = useRef(null);
    const chartRef3 = useRef(null);

    // create charts 1,2,3 
    useEffect(() => {
        if (!canvasRef1.current || !canvasRef2.current || !canvasRef3.current) return;

        const makeLineConfig = (key) => {
        const ds = datasetsByKey[key];
        return {
            type: "line",
            data: {
            labels: ds.labels,
            datasets: [
                {
                label: ds.label,
                data: ds.data,
                tension: 0.3,
                borderWidth: 2,
                },
            ],
            },
            options: { responsive: true, maintainAspectRatio: false },
        };
        };

        chartRef1.current = new Chart(canvasRef1.current, makeLineConfig(sel1));
        chartRef2.current = new Chart(canvasRef2.current, makeLineConfig(sel2));

        // Chart 3 (bar chart)
        chartRef3.current = new Chart(canvasRef3.current, {
        type: "bar",
        data: {
            labels: ["Year1", "Year2", "Year3", "Year4", "Year5"],
            datasets: [
            {
                label: "Sector Performance",
                data: [12, 19, 3, 5, 2],
                borderWidth: 1,
            },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
            x: { stacked: true },
            y: { stacked: true },
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

  // update chart 1 when sel1 changes
  useEffect(() => {
    const chart = chartRef1.current;
    if (!chart) return;

    const ds = datasetsByKey[sel1];
    chart.data.labels = ds.labels;
    chart.data.datasets[0].label = ds.label;
    chart.data.datasets[0].data = ds.data;
    chart.update();
  }, [sel1, datasetsByKey]);

  // update chart 2 when sel2 changes
  useEffect(() => {
    const chart = chartRef2.current;
    if (!chart) return;

    const ds = datasetsByKey[sel2];
    chart.data.labels = ds.labels;
    chart.data.datasets[0].label = ds.label;
    chart.data.datasets[0].data = ds.data;
    chart.update();
  }, [sel2, datasetsByKey]);

  return (
        <div className="charts-page">
          <div className="charts-row">
            <div className="chart-box">
              <div className="chart-header">
                <h3>Total Returns</h3>
                <select value={sel1} onChange={(e) => setSel1(e.target.value)}>
                  <option value="setA">Dataset A</option>
                  <option value="setB">Dataset B</option>
                  <option value="setC">Dataset C</option>
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
                  <option value="setA">Dataset A</option>
                  <option value="setB">Dataset B</option>
                  <option value="setC">Dataset C</option>
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
