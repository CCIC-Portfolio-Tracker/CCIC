import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./App.css";

function News() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  const loadNews = () => {
    fetch("https://ccic.onrender.com/api/news")
      .then(res => res.json())
      .then(json => {
        const mapped = (json || []).map((d) => [
            d.headline ?? "",
            d.company ?? "",
            d.date ?? 0,
            d.summary ?? 0,
            d.link ?? 0,
          ]);
          setRows(mapped);
                })
      .catch(err => {
        console.error("Failed to load https://ccic.onrender.com/api/news:", err);
        setRows([]);
      });
  };

  return (
    <div>
      <h2>News Section</h2>

      <button onClick={loadNews}>Load Latest News</button>

      {error && <p>{error}</p>}
    </div>
  );
}

export default News;
