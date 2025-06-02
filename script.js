document.addEventListener('DOMContentLoaded', function() {
    fetch('Articles.json')
        .then(response => response.json())
        .then(data => {
            const articles = data.articles;
            
            initDashboard(articles);
            
            document.getElementById('sortSelect').addEventListener('change', () => {
                displayArticles(articles);
            });
            
            const themeToggle = document.getElementById('themeToggle');
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-bs-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
            
            themeToggle.addEventListener('change', () => {
                const newTheme = themeToggle.checked ? 'dark' : 'light';
                document.documentElement.setAttribute('data-bs-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        })
        .catch(error => console.error('Error loading articles:', error));
});

function initDashboard(articles) {
    displayArticles(articles);
    
    displayMostPopular(articles);
    
    populateCategories(articles);
}

function displayArticles(articles) {
    const sortBy = document.getElementById('sortSelect').value;
    const articlesGrid = document.getElementById('articlesGrid');
    
    articlesGrid.innerHTML = '';
    
    const sortedArticles = [...articles].sort((a, b) => {
        if (sortBy === 'views') {
            return b.views - a.views;
        } else {
            return new Date(b.date) - new Date(a.date);
        }
    });
    
    sortedArticles.forEach(article => {
        const articleElement = createArticleCard(article);
        articlesGrid.appendChild(articleElement);
    });
}

function createArticleCard(article) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.innerHTML = `
        <div class="card-body">
            <span class="badge bg-primary mb-2">${article.category}</span>
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.content.substring(0, 100)}...</p>
        </div>
        <div class="card-footer bg-transparent">
            <small class="text-muted">Published: ${formatDate(article.date)}</small>
            <span class="float-end reading-time">${calculateReadingTime(article.wordCount)} min read</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showArticleModal(article);
        article.views++;
        displayMostPopular(articles);
    });
    
    col.appendChild(card);
    return col;
}

function displayMostPopular(articles) {
    const mostPopularContainer = document.getElementById('mostPopular');
    const mostPopular = [...articles].sort((a, b) => b.views - a.views)[0];
    
    mostPopularContainer.innerHTML = `
        <div class="card-body">
            <span class="badge bg-primary mb-2">${mostPopular.category}</span>
            <h3 class="card-title">${mostPopular.title}</h3>
            <p class="card-text">${mostPopular.content.substring(0, 200)}...</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Published: ${formatDate(mostPopular.date)} | ${mostPopular.views} views</small>
                <span class="reading-time">${calculateReadingTime(mostPopular.wordCount)} min read</span>
            </div>
            <button class="btn btn-primary mt-3" onclick="showArticleModal(${JSON.stringify(mostPopular).replace(/"/g, '&quot;')})">Read More</button>
        </div>
    `;
}

function populateCategories(articles) {
    const categoryList = document.getElementById('categoryList');
    const categories = [...new Set(articles.map(article => article.category))];
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `<a class="nav-link" href="#" data-category="${category}">${category}</a>`;
        categoryList.appendChild(li);
    });
    
    document.querySelectorAll('#categoryList .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('#categoryList .nav-link').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
            
            const category = link.dataset.category;
            filterArticlesByCategory(category);
        });
    });
}

function filterArticlesByCategory(category) {
    fetch('Articles.json')
        .then(response => response.json())
        .then(data => {
            let filteredArticles = data.articles;
            if (category !== 'all') {
                filteredArticles = data.articles.filter(article => article.category === category);
            }
            displayArticles(filteredArticles);
        });
}

function showArticleModal(article) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalMeta = document.getElementById('modalMeta');
    
    modalTitle.textContent = article.title;
    modalBody.innerHTML = `
        <p><span class="badge bg-primary">${article.category}</span></p>
        <p>${article.content}</p>
    `;
    modalMeta.innerHTML = `
        Published: ${formatDate(article.date)} | 
        ${article.views} views | 
        ${calculateReadingTime(article.wordCount)} min read
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function calculateReadingTime(wordCount) {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
}

window.showArticleModal = showArticleModal;
