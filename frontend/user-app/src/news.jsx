import { useState } from "react";
import "./App.css";

function News() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  const loadNews = () => {
    fetch("/api/news")
      .then(res => res.json())
      .then(json => {
        setArticles(json.articles || []);
      })
      .catch(err => {
        console.error("Failed to load /api/news:", err);
        setError("Failed to load news");
      });
  };

  return (
    <div>
      <h2>News Section</h2>

      <button onClick={loadNews}>Load Latest News</button>

      {error && <p>{error}</p>}

      {articles.map((article, i) => (
        <div key={i} className="article">
          <h3>{article.title}</h3>
          <p>{article.description}</p>
        </div>
      ))}
    </div>
  );
}

export default News;
