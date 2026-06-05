const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const revealObserver = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 })
    : null;

function addReveal(el, delay) {
    if (!revealObserver) return;
    el.classList.add('reveal');
    if (delay) el.style.transitionDelay = delay;
    revealObserver.observe(el);
}

function updateThemeIcon(icon, theme) {
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        icon.nextElementSibling.textContent = typeof t === 'function' ? t('theme.light') : 'Light Mode';
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.nextElementSibling.textContent = typeof t === 'function' ? t('theme.dark') : 'Dark Mode';
    }
}

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

function renderFeatured() {
    if (!songs.length) return;
    const latest = songs[0];
    const img = document.getElementById('featured-img');
    const title = document.getElementById('featured-title');
    const links = document.getElementById('featured-links');
    if (!img || !title || !links) return;
    img.src = latest.img;
    img.alt = latest.title;
    title.textContent = latest.title;
    links.innerHTML = [
        latest.spotify ? `<a href="${latest.spotify}" target="_blank" rel="noopener noreferrer" class="featured-link spotify"><i class="fab fa-spotify"></i> ${typeof t === 'function' ? t('featured.spotify') : 'Spotify'}</a>` : '',
        latest.apple   ? `<a href="${latest.apple}"   target="_blank" rel="noopener noreferrer" class="featured-link apple"><i class="fab fa-apple"></i> ${typeof t === 'function' ? t('featured.apple') : 'Apple Music'}</a>` : '',
    ].join('');
}

function renderSongs() {
    const musicPagination = document.getElementById('music-pagination');
    musicPagination.innerHTML = '';
    const pageSongs = paginate(songs, currentPage, itemsPerPage);

    pageSongs.forEach((song, i) => {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.innerHTML = `
            <img src="${song.img}" alt="${song.title}" loading="lazy">
            <div class="song-title">${song.title}</div>
            <div class="music-links">
                ${song.spotify ? `<a href="${song.spotify}" target="_blank" rel="noopener noreferrer" aria-label="Spotify"><i class="fab fa-spotify"></i></a>` : ''}
                ${song.apple ? `<a href="${song.apple}" target="_blank" rel="noopener noreferrer" aria-label="Apple Music"><i class="fab fa-apple"></i></a>` : ''}
            </div>
        `;
        musicPagination.appendChild(item);
        addReveal(item, `${i * 0.08}s`);
    });

    document.getElementById('prev-button').disabled = currentPage === 0;
    document.getElementById('next-button').disabled = (currentPage + 1) * itemsPerPage >= songs.length;
}

let videoItems = [];
let videoPage = 0;
const videosPerPage = 3;

function getYouTubeId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

function renderVideos() {
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '';
    const pageVideos = paginate(videoItems, videoPage, videosPerPage);

    pageVideos.forEach((video, i) => {
        const id = getYouTubeId(video.youtube);
        if (!id) return;

        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="video-thumb" data-id="${id}">
                <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${video.title}" loading="lazy">
                <button class="video-play-btn" aria-label="Play ${video.title}">
                    <i class="fab fa-youtube"></i>
                </button>
            </div>
            <p class="video-title">${video.title}</p>
        `;

        item.querySelector('.video-thumb').addEventListener('click', function () {
            this.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        });

        grid.appendChild(item);
        addReveal(item, `${i * 0.1}s`);
    });

    document.getElementById('prev-video').disabled = videoPage === 0;
    document.getElementById('next-video').disabled = (videoPage + 1) * videosPerPage >= videoItems.length;
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

const typeI18nKey = {
    'Single Release': 'news.type.single',
    'Blog': 'news.type.blog',
    'Concert': 'news.type.concert',
    'Information': 'news.type.information',
};

function renderNews() {
    const container = document.getElementById('news-feed');
    container.innerHTML = '';
    const pageNews = paginate(newsItems, newsPage, newsPerPage);

    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const locale = lang === 'cz' ? 'cs-CZ' : 'en-GB';

    pageNews.forEach((item, i) => {
        const type = item.type || 'Information';
        const { icon, color } = typeIconMap[type] || typeIconMap['Information'];
        const typeLabel = typeof t === 'function' ? t(typeI18nKey[type] || 'news.type.information') : type;
        const typeHtml = `
            <div class="news-type" style="--type-color: ${color}">
                <i class="fas ${icon}"></i>
                <span>${typeLabel}</span>
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

    const title = (lang === 'cz' && item.title_cz) ? item.title_cz : item.title;
    const content = (lang === 'cz' && item.content_cz) ? item.content_cz : item.content;

    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        ${typeHtml}
        <div class="news-date">${new Date(item.date).toLocaleDateString(locale)}</div>
        <h3>${title}</h3>
        <p>${content}</p>
        ${item.img ? `<img src="${item.img}" alt="${title}" class="news-img" loading="lazy">` : ''}
        ${youtubeEmbed}
        ${linksHtml}
    `;
    container.appendChild(card);
    addReveal(card, `${i * 0.12}s`);
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
    "img/gallery/keys10.jpg",
    "img/gallery/keys6.jpg",
     "img/gallery/keys5.JPG",
     "img/blogs/agony_zk_18012026.jpg",
];
let galleryPage = 0;
const galleryPerPage = 3;

let lightboxIndex = 0;

function openLightbox(index) {
    lightboxIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = galleryImages[index];
    img.alt = typeof t === 'function' ? t('gallery.img.alt') : 'Gallery image';
    document.getElementById('lightbox-prev').disabled = index === 0;
    document.getElementById('lightbox-next').disabled = index === galleryImages.length - 1;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
    document.getElementById('lightbox').hidden = true;
    document.body.style.overflow = '';
}

function moveLightbox(dir) {
    const next = lightboxIndex + dir;
    if (next >= 0 && next < galleryImages.length) openLightbox(next);
}

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    const pageImages = paginate(galleryImages, galleryPage, galleryPerPage);

    pageImages.forEach((src, pageIndex) => {
        const globalIndex = galleryPage * galleryPerPage + pageIndex;
        const img = document.createElement('img');
        img.src = src;
        img.alt = typeof t === 'function' ? t('gallery.img.alt') : 'Gallery image';
        img.loading = 'lazy';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(globalIndex));
        galleryGrid.appendChild(img);
        addReveal(img, `${pageIndex * 0.1}s`);
    });

    document.getElementById('prev-gallery').disabled = galleryPage === 0;
    document.getElementById('next-gallery').disabled = (galleryPage + 1) * galleryPerPage >= galleryImages.length;
}

function addPaginationHandlers() {
    [
        { id: 'prev-button', fn: () => { if (currentPage > 0) { currentPage--; renderSongs(); } } },
        { id: 'next-button', fn: () => { if ((currentPage + 1) * itemsPerPage < songs.length) { currentPage++; renderSongs(); } } },
        { id: 'prev-video', fn: () => { if (videoPage > 0) { videoPage--; renderVideos(); } } },
        { id: 'next-video', fn: () => { if ((videoPage + 1) * videosPerPage < videoItems.length) { videoPage++; renderVideos(); } } },
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
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        updateThemeIcon(icon, savedTheme);
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(icon, next);
        });
    }

    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'accepted') {
        gtag('consent', 'update', { analytics_storage: 'granted' });
    } else if (!cookieConsent) {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.hidden = false;
            document.getElementById('cookie-accept').addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'accepted');
                gtag('consent', 'update', { analytics_storage: 'granted' });
                banner.hidden = true;
            });
            document.getElementById('cookie-decline').addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'declined');
                banner.hidden = true;
            });
        }
    }

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll(
        '#about h2, ' +
        '#music h2, #music .section-subtext, ' +
        '#videos h2, #videos .section-subtext, ' +
        '#news h2, #news .section-subtext, ' +
        '#gallery h2, #gallery .section-subtext, ' +
        '#contact h2, #contact .section-subtext, ' +
        '.form-group, #contact [type="submit"]'
    ).forEach(el => addReveal(el));

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const next = (document.documentElement.getAttribute('data-lang') || 'en') === 'en' ? 'cz' : 'en';
            localStorage.setItem('lang', next);
            setLanguage(next);
        });
    }

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => moveLightbox(-1));
    document.getElementById('lightbox-next').addEventListener('click', () => moveLightbox(1));
    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        const lb = document.getElementById('lightbox');
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') moveLightbox(-1);
        if (e.key === 'ArrowRight') moveLightbox(1);
    });

    addPaginationHandlers();
    renderGallery();

    try {
        [songs, newsItems, videoItems] = await Promise.all([
            loadJSON('script/music.json'),
            loadJSON('script/news.json'),
            loadJSON('script/videos.json')
        ]);
        renderFeatured();
        renderSongs();
        renderVideos();
        renderNews();
    } catch (error) {
        console.error('Error loading data:', error);
    }
});