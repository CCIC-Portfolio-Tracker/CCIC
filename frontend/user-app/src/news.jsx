import React, { useEffect, useState } from "react";
import "./news.css";


function cleanInput(rawData) {
  // If backend returned an error object
  if (rawData?.error) {
    return { articles: [], error: String(rawData.error) };
  }

  // Get the array
  const list = Array.isArray(rawData)
    ? rawData
    : rawData?.articles || rawData?.news || [];

  // Keep only usable article objects
  const articles = list
    .filter((a) => a?.headline && (a.link || a.url))
    .map((a) => ({
      headline: a.headline,
      link: a.link || a.url,
      company: a.company || a.related || "",
      date:
        a.date ||
        (a.datetime
          ? new Date(a.datetime * 1000).toLocaleDateString()
          : ""),
      summary: a.summary || "",
    }));

  return { articles, error: "" };
}

function News({ticker}) {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      // try to fetch news from backend
      try {
        const t = String(ticker || "").toUpperCase().trim();
        if (!t) {
          setArticles([]);
          setError("Missing ticker.");
          setLoading(false);
          return;
        }

        const res = await fetch("https://ccic.onrender.com/api/news/${encodeURIComponent(t)}", {
          headers: { Accept: "application/json" },
        });
        const rawData = await res.json();

        // Normalize backend response into UI-friendly articles list
        const { articles: cleaned, error: cleaningError } = cleanInput(rawData);

        if (cancelled) return;

        if (!res.ok) {
          setError(cleaningError || `Failed to load news (HTTP ${res.status}).`);
          setArticles([]);
          return;
        }

        // Update state based on cleaning result
        if (cleaningError) {
          setError(cleaningError);
          setArticles([]);
        } else {
          setArticles(cleaned);
          setError("");
        }
      } catch (err) {
        // catch errors from fetch or res.json()
        if (cancelled) return;
        console.error("Failed to load news:", err);
        setError(err?.message || "Failed to load news.");
        setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return (
    <div className="news-pane">
      <div className="news-header">News</div>
  
      <div className="news-scroll">
        {!loading && error && <div className="news-error">{error}</div>}
  
        {!loading && !error && articles.length === 0 && (
          <div className="news-empty">No news available.</div>
        )}
  
        {!loading &&
          !error &&
          articles.map((a, i) => (
            <div key={`${a.link}-${i}`} className="news-item">
              <a
                href={a.link}
                target="_blank"
                rel="noreferrer"
                className="news-headline"
              >
                {a.headline}
              </a>
  
              <div className="news-meta">
                {a.company}
                {a.company && a.date ? " • " : ""}
                {a.date}
              </div>
  
              {a.summary && <div className="news-summary">{a.summary}</div>}
            </div>
          ))}
      </div>
    </div>
  );
}  

export default News;
