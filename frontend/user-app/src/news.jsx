import React, { useEffect, useState } from "react";
import "./news.css";

/**
 * Cleans and normalizes backend response into a consistent format for the UI
 * @param {*} rawData 
 * @returns reformatted date
 */
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

/**
 * News component to display news articles related to a given ticker
 * @param {*} ticker company tickecr
 * @returns scrollable news bar
 */
function News({ticker}) {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Load news articles from backend for the given ticker
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

        // fetch news from backend API 
        const url = `/api/news/${encodeURIComponent(t)}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });


        const contentType = res.headers.get("content-type") || "";
        const bodyText = await res.text();

        if (!res.ok) {
          // show real server error page/text
          throw new Error(`HTTP ${res.status} from ${url}: ${bodyText.slice(0, 200)}`);
        }

        if (!contentType.includes("application/json")) {
          // HTML came back (often index.html or an error page)
          throw new Error(`Non-JSON response from ${url}: ${bodyText.slice(0, 200)}`);
        }

        const rawData = JSON.parse(bodyText);
        //const rawData = await res.json();

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

  /**
   * Generate ticker-related news articles list
   */
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
