document.addEventListener('DOMContentLoaded', function() {
    // Load articles if we're on the articles page
    if (document.getElementById('articles-list')) {
        loadArticles();
    }

    // Simple welcome message
    console.log('Welcome to your GitHub Pages site!');
});

async function loadArticles() {
    const articlesContainer = document.getElementById('articles-list');
    
    if (!articlesContainer) {
        return; // Not on articles page
    }
    
    try {
        // Load article metadata from JSON file
        const metadataResponse = await fetch('articles/articles.json');
        if (!metadataResponse.ok) {
            throw new Error('Could not load articles metadata');
        }
        
        const articlesMetadata = await metadataResponse.json();
        
        // Sort articles by date (newest first)
        articlesMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        articlesContainer.innerHTML = '';
        
        for (const articleMeta of articlesMetadata) {
            try {
                const response = await fetch(`articles/${articleMeta.filename}`);
                if (response.ok) {
                    const content = await response.text();
                    
                    // Parse the HTML to extract content for excerpt
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    
                    const contentDiv = doc.querySelector('.content');
                    const excerpt = contentDiv?.textContent.substring(0, 200) + '...' || 'No content available';
                    
                    // Format the date
                    const publishDate = new Date(articleMeta.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    // Create article preview
                    const articleElement = document.createElement('div');
                    articleElement.className = 'article';
                    articleElement.innerHTML = `
                        <h3>${articleMeta.title}</h3>
                        <div class="meta">Published: ${publishDate} | By: ${articleMeta.author}</div>
                        <div class="content">${excerpt}</div>
                        <a href="articles/${articleMeta.filename}" class="read-more">Read more</a>
                    `;
                    
                    articlesContainer.appendChild(articleElement);
                }
            } catch (error) {
                console.log(`Could not load article: ${articleMeta.filename}`);
            }
        }
        
        if (articlesContainer.children.length === 0) {
            articlesContainer.innerHTML = '<p>No articles found. Add some articles to the /articles folder and update articles.json!</p>';
        }
        
    } catch (error) {
        // Fallback message with instructions
        articlesContainer.innerHTML = `
            <p>Unable to load articles. Make sure you have:</p>
            <ul>
                <li>Created an <code>articles.json</code> file in the articles folder</li>
                <li>Added your article HTML files to the articles folder</li>
                <li>Updated the metadata in <code>articles.json</code></li>
            </ul>
        `;
        console.error('Error loading articles:', error);
    }
}