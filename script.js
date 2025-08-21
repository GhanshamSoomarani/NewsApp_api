class NewsApp {
    constructor() {
        this.API_KEY = "05303261f6df42068f21662378319f9b";
        this.BASE_URL = "https://newsapi.org/v2";

        this.state = {
            category: "general",
            query: "",
            page: 1,
            articles: [],
            totalResults: Infinity,
            loading: false
        };
    }

    init() {
        this.setupEvents();
        this.loadMore();
    }

    setupEvents() {
        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.onclick = () => this.changeCategory(btn.dataset.category);
        });

        document.getElementById("searchInput").addEventListener("input", (e) => {
            this.search(e.target.value);
        });

        window.onscroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 1000 && !this.state.loading) {
                if (this.state.articles.length < this.state.totalResults) {
                    this.loadMore();
                } else {
                    this.showEndMessage();
                }
            }
        };

        document.onclick = (e) => {
            const card = e.target.closest(".news-card");
            if (card?.dataset.url) {
                window.open(card.dataset.url, "_blank");
            }
        };
    }

    changeCategory(category) {
        if (category === this.state.category) return;

        document.querySelectorAll(".category-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        document.querySelector(`[data-category="${category}"]`).classList.add("active");

        this.resetState({ category, query: "" });
        document.getElementById("searchInput").value = "";
    }

    search(query) {
        this.resetState({ query, category: "" });
    }

    resetState(updates) {
        this.state = {
            ...this.state,
            ...updates,
            page: 1,
            articles: [],
            totalResults: Infinity,
            loading: false
        };
        document.getElementById("newsGrid").innerHTML = "";
        this.hideEndMessage();
        this.loadMore();
    }

    async loadMore() {
        if (this.state.loading || this.state.articles.length >= this.state.totalResults) return;

        this.state.loading = true;
        this.toggleLoading(true);
        this.hideError();

        try {
            const url = this.buildUrl();
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "ok" && data.articles.length > 0) {
                this.state.articles.push(...data.articles);
                this.state.totalResults = data.totalResults;
                this.renderNews(data.articles, true);
            } else {
                this.showError(data.message || "No news found.");
                this.showEndMessage();
            }
        } catch (error) {
            this.showError("Failed to fetch news. Please check your connection.");
        }

        this.toggleLoading(false);
    }

    buildUrl() {
        const params = new URLSearchParams({
            apiKey: this.API_KEY,
            page: this.state.page,
            pageSize: 20,
        });

        if (this.state.category) {
            params.append("category", this.state.category);
            params.append("country", "us");
        }

        if (this.state.query) {
            params.append("q", this.state.query);
        }

        return `${this.BASE_URL}/top-headlines?${params}`;
    }

    renderNews(articles, append = false) {
        const grid = document.getElementById("newsGrid");
        if (!append) grid.innerHTML = "";

        articles.forEach(article => {
            const card = document.createElement("div");
            card.className = "news-card";
            card.dataset.url = article.url;

            const img = article.urlToImage
                ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image" onerror="this.outerHTML='<div class=\\'news-image default-image\\'>YOUR NEWS</div>'">`
                : `<div class="news-image default-image">YOUR NEWS</div>`;

            card.innerHTML = `
                ${img}
                <div class="news-content">
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${article.description || 'No description available.'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source.name}</span>
                        <span class="news-date">${new Date(article.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })}</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    toggleLoading(show) {
        this.state.loading = show;
        document.getElementById("loading").style.display = show ? "block" : "none";
    }

    showEndMessage() {
        document.getElementById("endMessage").style.display = "block";
    }

    hideEndMessage() {
        document.getElementById("endMessage").style.display = "none";
    }

    showError(msg) {
        const error = document.getElementById("error");
        error.textContent = msg;
        error.style.display = "block";
    }

    hideError() {
        document.getElementById("error").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new NewsApp();
    app.init();
});

// Mobile navbar toggle
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("navMenu").classList.toggle("open");
});
