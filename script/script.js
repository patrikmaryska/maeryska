const songs = [
    { img: 'img/songs/dance_thorugh_the_darkness_piano.jpg', title: 'Dance through the Darkness (Piano version)', link: 'https://open.spotify.com/track/5example' },
    { img: 'img/songs/dance_through_darkness.jpg', title: 'Dance through the Darkness', link: 'https://open.spotify.com/track/56c36GTYATaQKKCNP4wlK5?si=5414728b91784336' },
    { img: 'img/songs/hail_to_mother.jpg', title: 'Hail to mother nature', link: 'https://open.spotify.com/track/7fs5PWwkztqgip0IWKskjm?si=a78eb1aba5974c03' },
    { img: 'img/songs/dance_of_fantasy.jpg', title: 'Dance of Fantasy', link: 'https://open.spotify.com/track/2c4Nd6u1todTNaU8lDzLNb?si=6198ff3b172f4a20' },
    { img: 'img/songs/sorry.jpg', title: 'I am sorry for my heart', link: 'https://open.spotify.com/track/7emwOnWoYdspeZI7XlMeXh?si=239f7059c4cb4453' },
    { img: 'img/songs/song6.jpg', title: 'Timeless Tales', link: 'https://open.spotify.com/track/6example' }
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

renderSongs();
