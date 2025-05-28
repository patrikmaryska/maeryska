const songs = [
    {
        img: 'img/songs/dance_thorugh_the_darkness_piano.jpg',
        title: 'Dance through the Darkness (Piano version)',
        link: 'https://open.spotify.com/track/5JOR9fbmiqMXhwds3bX9M7?si=f340e9739ee34990'
    },
    {
        img: 'img/songs/dance_through_darkness.jpg',
        title: 'Dance through the Darkness',
        link: 'https://open.spotify.com/track/56c36GTYATaQKKCNP4wlK5?si=5414728b91784336'
    },
    {
        img: 'img/songs/hail_to_mother.jpg',
        title: 'Hail to mother nature',
        link: 'https://open.spotify.com/track/7fs5PWwkztqgip0IWKskjm?si=a78eb1aba5974c03'
    },
    {
        img: 'img/songs/dance_of_fantasy.jpg',
        title: 'Dance of Fantasy',
        link: 'https://open.spotify.com/track/2c4Nd6u1todTNaU8lDzLNb?si=6198ff3b172f4a20'
    },
    {
        img: 'img/songs/sorry.jpg',
        title: 'I am sorry for my heart',
        link: 'https://open.spotify.com/track/7emwOnWoYdspeZI7XlMeXh?si=239f7059c4cb4453'
    },
    {
        img: 'img/songs/song6.jpg',
        title: 'Timeless Tales',
        link: 'https://open.spotify.com/track/6example'
    }
];

let currentPage = 0;
const itemsPerPage = 4;

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

const newsItems = [
    {
        title: 'New Album Release: "Enchanted Horizons"',
        content: 'Maeryska’s latest album debuts next month, inviting listeners into a realm of ethereal melodies and timeless emotion.',
        date: '2025-06-10',
        type: 'Single Release',
        links: {
            spotify: 'https://open.spotify.com/album/example',
            youtube: 'https://www.youtube.com/watch?v=-MgiI8J5PCQ',
            apple: 'https://music.apple.com/album/example'
        }
    },
    {
        title: 'Upcoming Concert Tour',
        content: 'Experience Maeryska live across Europe. Dates and venues to be announced soon.',
        date: '2025-06-01',
        type: 'Concert'
    },
    {
        title: 'Behind the Scenes: Studio Diary',
        content: 'A glimpse into the creative process of Maeryska’s latest compositions.',
        date: '2025-05-25',
        type: 'Blog',
        links: {
            youtube: 'https://youtube.com/watch?v=example2'
        }
    },
    {
        title: 'Fan Club Update',
        content: 'New rewards, early access tickets, and exclusive content are now live for fan club members!',
        date: '2025-05-20',
        type: 'Information'
    }
];

let newsPage = 0;
const newsPerPage = 2;

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
    renderNews();
    renderSongs();
});
