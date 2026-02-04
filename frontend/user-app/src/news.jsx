import "./App.css";

function News() {
    const loadNews = () => {
        fetch("/api/news")
            .then((res) => res.json())
            .then((json) => {
                const articles = json.articles || [];
                let newsContent = "Latest News:\n\n";
                articles.forEach((article, index) => {
                    newsContent += `${index + 1}. ${article.title}\n${article.description}\n\n`;
                });
                alert(newsContent);
            })
            .catch((err) => {
                console.error("Failed to load /api/news:", err);
                alert("Failed to load news.");
            });
    }

    // generate page
    return (
        <div>
            <h2>News Section</h2>
            <button onClick={loadNews}>Load Latest News</button>
        </div>
    );
}