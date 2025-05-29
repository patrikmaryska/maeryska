let songs = [];
let newsItems = [];

let currentPage = 0;
const itemsPerPage = 4;

let newsPage = 0;
const newsPerPage = 2;

async function loadSongs() {
    try {
        const response = await fetch('script/music.json');
        songs = await response.json();
        renderSongs();
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

async function loadNews() {
    try {
        const response = await fetch('script/news.json');
        newsItems = await response.json();
        renderNews();
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function renderSongs() {
    const musicPagination = document.getElementById('music-pagination');
    musicPagination.innerHTML = '';

    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;

    songs.slice(start, end).forEach(song => {
        const item = document.createElement('div');
        item.classList.add('music-item');

        item.innerHTML = `
            <a href="${song.link}" target="_blank" rel="noopener noreferrer">
                <img src="${song.img}" alt="${song.title}">
            </a>
            <div class="song-title">${song.title}</div>
        `;

        musicPagination.appendChild(item);
    });

    document.getElementById('prev-button').disabled = currentPage === 0;
    document.getElementById('next-button').disabled = end >= songs.length;
}

function renderNews() {
    const container = document.getElementById('news-feed');
    container.innerHTML = '';

    const start = newsPage * newsPerPage;
    const end = start + newsPerPage;

    newsItems.slice(start, end).forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';

        const typeIconMap = {
            'Single Release': { icon: 'fa-music', color: '#d63384' },
            'Blog': { icon: 'fa-pen-nib', color: '#20c997' },
            'Concert': { icon: 'fa-ticket-alt', color: '#0d6efd' },
            'Information': { icon: 'fa-info-circle', color: '#6c757d' }
        };

        const type = item.type || 'Information';
        const typeMeta = typeIconMap[type] || typeIconMap['Information'];
        const typeHtml = `
            <div class="news-type" style="--type-color: ${typeMeta.color}">
                <i class="fas ${typeMeta.icon}"></i>
                <span>${type}</span>
            </div>
        `;

        let youtubeEmbed = '';
        if (item.links?.youtube) {
            const match = item.links.youtube.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            if (match && match[1]) {
                youtubeEmbed = `
                    <div class="video-embed">
                        <iframe 
                            src="https://www.youtube.com/embed/${match[1]}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            }
        }

        const linksHtml = item.links ? `
            <div class="news-links">
                ${item.links.spotify ? `<a href="${item.links.spotify}" target="_blank" aria-label="Spotify"><i class="fab fa-spotify"></i></a>` : ''}
                ${item.links.apple ? `<a href="${item.links.apple}" target="_blank" aria-label="Apple Music"><i class="fab fa-apple"></i></a>` : ''}
            </div>
        ` : '';

        card.innerHTML = `
            ${typeHtml}
            <div class="news-date">${new Date(item.date).toLocaleDateString()}</div>
            <h3>${item.title}</h3>
            <p>${item.content}</p>
            ${youtubeEmbed}
            ${linksHtml}
        `;

        container.appendChild(card);
    });

    document.getElementById('prev-news').disabled = newsPage === 0;
    document.getElementById('next-news').disabled = end >= newsItems.length;
}

document.getElementById('prev-button').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderSongs();
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if ((currentPage + 1) * itemsPerPage < songs.length) {
        currentPage++;
        renderSongs();
    }
});

document.getElementById('prev-news').addEventListener('click', () => {
    if (newsPage > 0) {
        newsPage--;
        renderNews();
    }
});

document.getElementById('next-news').addEventListener('click', () => {
    if ((newsPage + 1) * newsPerPage < newsItems.length) {
        newsPage++;
        renderNews();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadSongs();
    loadNews();
});