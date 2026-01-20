function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
}

function paginate(arr, page, perPage) {
    const start = page * perPage;
    return arr.slice(start, start + perPage);
}

let songs = [];
let currentPage = 0;
const itemsPerPage = 4;

async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.json();
}

function renderSongs() {
    const musicPagination = document.getElementById('music-pagination');
    musicPagination.innerHTML = '';
    const pageSongs = paginate(songs, currentPage, itemsPerPage);

    pageSongs.forEach(song => {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.innerHTML = `
            <a href="${song.link}" target="_blank" rel="noopener noreferrer">
                <img src="${song.img}" alt="${song.title}">
            </a>
            <div class="song-title">${song.title}</div>
        `;
        musicPagination.appendChild(item);
    });

    document.getElementById('prev-button').disabled = currentPage === 0;
    document.getElementById('next-button').disabled = (currentPage + 1) * itemsPerPage >= songs.length;
}

let newsItems = [];
let newsPage = 0;
const newsPerPage = 2;

const typeIconMap = {
    'Single Release': { icon: 'fa-music', color: '#d63384' },
    'Blog': { icon: 'fa-pen-nib', color: '#20c997' },
    'Concert': { icon: 'fa-ticket-alt', color: '#0d6efd' },
    'Information': { icon: 'fa-info-circle', color: '#6c757d' }
};

function renderNews() {
    const container = document.getElementById('news-feed');
    container.innerHTML = '';
    const pageNews = paginate(newsItems, newsPage, newsPerPage);

    pageNews.forEach(item => {
        const type = item.type || 'Information';
        const { icon, color } = typeIconMap[type] || typeIconMap['Information'];
        const typeHtml = `
            <div class="news-type" style="--type-color: ${color}">
                <i class="fas ${icon}"></i>
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

    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        ${typeHtml}
        <div class="news-date">${new Date(item.date).toLocaleDateString()}</div>
        <h3>${item.title}</h3>
        <p>${item.content}</p>
        ${item.img ? `<img src="${item.img}" alt="${item.title}" class="news-img">` : ''}
        ${youtubeEmbed}
        ${linksHtml}
    `;
    container.appendChild(card);
    });

    document.getElementById('prev-news').disabled = newsPage === 0;
    document.getElementById('next-news').disabled = (newsPage + 1) * newsPerPage >= newsItems.length;
}

const galleryImages = [
    "img/gallery/keys1.JPG",
    "img/gallery/keys2.jpg",
    "img/gallery/keys3.jpg",
    "img/gallery/keys8.jpg",
    "img/gallery/keys9.JPG",
    "img/gallery/keys10.JPG",
    "img/gallery/keys2.JPG",
     "img/gallery/keys5.JPG",
     "img/blogs/agony_zk_18012026.jpg",
];
let galleryPage = 0;
const galleryPerPage = 3;

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    const pageImages = paginate(galleryImages, galleryPage, galleryPerPage);

    pageImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = "Gallery image";
        galleryGrid.appendChild(img);
    });

    document.getElementById('prev-gallery').disabled = galleryPage === 0;
    document.getElementById('next-gallery').disabled = (galleryPage + 1) * galleryPerPage >= galleryImages.length;
}

function addPaginationHandlers() {
    [
        { id: 'prev-button', fn: () => { if (currentPage > 0) { currentPage--; renderSongs(); } } },
        { id: 'next-button', fn: () => { if ((currentPage + 1) * itemsPerPage < songs.length) { currentPage++; renderSongs(); } } },
        { id: 'prev-news', fn: () => { if (newsPage > 0) { newsPage--; renderNews(); } } },
        { id: 'next-news', fn: () => { if ((newsPage + 1) * newsPerPage < newsItems.length) { newsPage++; renderNews(); } } },
        { id: 'prev-gallery', fn: () => { if (galleryPage > 0) { galleryPage--; renderGallery(); } } },
        { id: 'next-gallery', fn: () => { if ((galleryPage + 1) * galleryPerPage < galleryImages.length) { galleryPage++; renderGallery(); } } }
    ].forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    });
}

onReady(async () => {
    addPaginationHandlers();
    renderGallery();

    try {
        [songs, newsItems] = await Promise.all([
            loadJSON('script/music.json'),
            loadJSON('script/news.json')
        ]);
        renderSongs();
        renderNews();
    } catch (error) {
        console.error('Error loading data:', error);
    }
});