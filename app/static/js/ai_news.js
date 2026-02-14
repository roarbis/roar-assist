// AI News JavaScript
let allNews = [];
let filteredNews = [];
let bookmarkedArticles = [];
let readArticles = [];

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');
const filterDate = document.getElementById('filterDate');
const viewBookmarksBtn = document.getElementById('viewBookmarksBtn');
const bookmarkModal = document.getElementById('bookmarkModal');
const closeBookmarksBtn = document.getElementById('closeBookmarks');
const bookmarksList = document.getElementById('bookmarksList');
const bookmarkCount = document.getElementById('bookmarkCount');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBookmarksFromStorage();
    loadReadArticlesFromStorage();
    fetchNews();
    setupEventListeners();
});

function setupEventListeners() {
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        fetchNews();
    });

    retryBtn.addEventListener('click', fetchNews);

    filterDate.addEventListener('change', () => {
        filterNewsByDate();
    });

    viewBookmarksBtn.addEventListener('click', () => {
        showBookmarksModal();
    });

    closeBookmarksBtn.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });

    // Close modal on background click
    bookmarkModal.addEventListener('click', (e) => {
        if (e.target === bookmarkModal) {
            bookmarkModal.style.display = 'none';
        }
    });
}

async function fetchNews() {
    try {
        showLoading();

        const response = await fetch('/news/api/fetch');
        const data = await response.json();

        if (data.success) {
            allNews = data.news;
            filteredNews = [...allNews];
            renderNews();
            hideLoading();
        } else {
            showError(data.error || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showError('Network error. Please check your connection.');
    } finally {
        refreshBtn.classList.remove('spinning');
    }
}

function renderNews() {
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    newsGrid.innerHTML = '';

    filteredNews.forEach((article, index) => {
        const card = createNewsCard(article, index);
        newsGrid.appendChild(card);
    });
}

function createNewsCard(article, index) {
    const card = document.createElement('div');
    card.className = 'news-card';

    const isBookmarked = bookmarkedArticles.some(a => a.link === article.link);
    const isRead = readArticles.includes(article.link);

    if (isRead) {
        card.classList.add('read');
    }

    const imageHtml = article.image
        ? `<img src="${article.image}" alt="${escapeHtml(article.title)}" class="news-image" onerror="this.parentElement.innerHTML='<div class=\\'news-image-placeholder\\'>📰</div>'">`
        : `<div class="news-image-placeholder">📰</div>`;

    card.innerHTML = `
        ${imageHtml}
        <div class="news-content">
            <span class="news-source">${escapeHtml(article.source)}</span>
            <h3 class="news-card-title">${escapeHtml(article.title)}</h3>
            <p class="news-description">${escapeHtml(article.description)}</p>
            <div class="news-footer">
                <div class="news-date">
                    <span>🕒</span>
                    <span>${article.published_readable}</span>
                </div>
                <div class="news-actions">
                    <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}"
                            data-index="${index}"
                            title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}">
                        ${isBookmarked ? '⭐' : '☆'}
                    </button>
                    <button class="btn-read-more" data-index="${index}" title="Read article">
                        →
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const bookmarkBtn = card.querySelector('.btn-bookmark');
    const readMoreBtn = card.querySelector('.btn-read-more');

    bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBookmark(article, bookmarkBtn);
    });

    readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openArticle(article);
    });

    return card;
}

function toggleBookmark(article, btn) {
    const isBookmarked = bookmarkedArticles.some(a => a.link === article.link);

    if (isBookmarked) {
        // Remove bookmark
        bookmarkedArticles = bookmarkedArticles.filter(a => a.link !== article.link);
        btn.classList.remove('bookmarked');
        btn.innerHTML = '☆';
        btn.title = 'Bookmark this article';
    } else {
        // Add bookmark
        bookmarkedArticles.push(article);
        btn.classList.add('bookmarked');
        btn.innerHTML = '⭐';
        btn.title = 'Remove bookmark';
    }

    saveBookmarksToStorage();
    updateBookmarkCount();
}

function openArticle(article) {
    // Mark as read
    if (!readArticles.includes(article.link)) {
        readArticles.push(article.link);
        saveReadArticlesToStorage();
    }

    // Open in new tab
    window.open(article.link, '_blank');

    // Re-render to show read state
    renderNews();
}

function filterNewsByDate() {
    const selectedDate = filterDate.value;

    if (!selectedDate) {
        filteredNews = [...allNews];
    } else {
        const filterDateObj = new Date(selectedDate);
        filteredNews = allNews.filter(article => {
            const articleDate = new Date(article.published);
            return articleDate.toDateString() === filterDateObj.toDateString();
        });
    }

    renderNews();
}

function showBookmarksModal() {
    if (bookmarkedArticles.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-state">
                <p>No saved articles yet</p>
                <p class="text-muted">Click the bookmark icon on any article to save it</p>
            </div>
        `;
    } else {
        bookmarksList.innerHTML = '';
        bookmarkedArticles.forEach((article, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.innerHTML = `
                <div class="bookmark-item-content">
                    <div class="bookmark-item-title">${escapeHtml(article.title)}</div>
                    <div class="bookmark-item-source">${escapeHtml(article.source)} - ${article.published_readable}</div>
                </div>
                <button class="btn-remove-bookmark" data-index="${index}" title="Remove bookmark">
                    ×
                </button>
            `;

            const removeBtn = item.querySelector('.btn-remove-bookmark');
            removeBtn.addEventListener('click', () => {
                bookmarkedArticles.splice(index, 1);
                saveBookmarksToStorage();
                updateBookmarkCount();
                showBookmarksModal(); // Refresh modal
                renderNews(); // Update main view
            });

            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-remove-bookmark')) return;
                window.open(article.link, '_blank');
            });

            bookmarksList.appendChild(item);
        });
    }

    bookmarkModal.style.display = 'flex';
}

function updateBookmarkCount() {
    if (bookmarkedArticles.length > 0) {
        bookmarkCount.textContent = bookmarkedArticles.length;
        bookmarkCount.style.display = 'block';
    } else {
        bookmarkCount.style.display = 'none';
    }
}

function saveBookmarksToStorage() {
    localStorage.setItem('ai_news_bookmarks', JSON.stringify(bookmarkedArticles));
}

function loadBookmarksFromStorage() {
    const saved = localStorage.getItem('ai_news_bookmarks');
    if (saved) {
        bookmarkedArticles = JSON.parse(saved);
        updateBookmarkCount();
    }
}

function saveReadArticlesToStorage() {
    localStorage.setItem('ai_news_read', JSON.stringify(readArticles));
}

function loadReadArticlesFromStorage() {
    const saved = localStorage.getItem('ai_news_read');
    if (saved) {
        readArticles = JSON.parse(saved);
    }
}

function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    newsGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loadingState.style.display = 'none';
    newsGrid.style.display = 'grid';
}

function showError(message) {
    loadingState.style.display = 'none';
    newsGrid.style.display = 'none';
    emptyState.style.display = 'none';
    errorState.style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
