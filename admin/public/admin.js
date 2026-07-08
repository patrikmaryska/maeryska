// ── State ─────────────────────────────────────────────────────────────────────
let songs = [], news = [], videos = [];
let editMode = null; // { type, index }

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadData();
});

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

async function loadData() {
    try {
        const r = await fetch('/api/data');
        const d = await r.json();
        songs  = d.songs  || [];
        news   = d.news   || [];
        videos = d.videos || [];
        renderSongs();
        renderNews();
        renderVideos();
    } catch (e) {
        toast('Failed to load data — is the server running?', true);
    }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderSongs() {
    const list = document.getElementById('songs-list');
    if (!songs.length) { list.innerHTML = '<p style="color:var(--muted);padding:16px">No songs yet.</p>'; return; }
    list.innerHTML = songs.map((s, i) => `
        <div class="item-card ${i === 0 ? 'featured' : ''}">
            ${s.img
                ? `<img class="item-thumb" src="/site-img/${s.img.replace(/^img\//, '')}" alt="">`
                : `<div class="item-thumb-placeholder"><i class="fas fa-music"></i></div>`}
            <div class="item-info">
                <div class="item-title">
                    ${esc(s.title)}
                    ${i === 0 ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                </div>
                <div class="item-meta">
                    ${s.spotify ? '<i class="fab fa-spotify" style="color:#1db954"></i> ' : ''}
                    ${s.apple   ? '<i class="fab fa-apple"   style="color:#fc3c44"></i> ' : ''}
                </div>
            </div>
            <div class="item-actions">
                ${i !== 0 ? `<button class="btn btn-gold btn-icon" title="Set as Featured" onclick="setFeatured(${i})"><i class="fas fa-star"></i></button>` : ''}
                <button class="btn btn-ghost btn-icon" title="Edit" onclick="openEditSong(${i})"><i class="fas fa-pen"></i></button>
                <button class="btn btn-danger btn-icon" title="Delete" onclick="confirmDelete('song',${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderNews() {
    const list = document.getElementById('news-list');
    if (!news.length) { list.innerHTML = '<p style="color:var(--muted);padding:16px">No news yet.</p>'; return; }
    const badgeClass = { 'Single Release': 'badge-single', 'Blog': 'badge-blog', 'Concert': 'badge-concert', 'Information': 'badge-info' };
    list.innerHTML = news.map((n, i) => `
        <div class="item-card">
            ${n.img
                ? `<img class="item-thumb" src="/site-img/${n.img.replace(/^img\//, '')}" alt="">`
                : `<div class="item-thumb-placeholder"><i class="fas fa-newspaper"></i></div>`}
            <div class="item-info">
                <div class="item-title">${esc(n.title)}</div>
                <div class="item-meta">
                    <span class="item-badge ${badgeClass[n.type] || 'badge-info'}">${esc(n.type)}</span>
                    ${n.date}
                    ${n.title_cz ? ' · <span style="color:var(--accent);font-size:0.75rem">CZ</span>' : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-ghost btn-icon" title="Edit" onclick="openEditNews(${i})"><i class="fas fa-pen"></i></button>
                <button class="btn btn-danger btn-icon" title="Delete" onclick="confirmDelete('news',${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderVideos() {
    const list = document.getElementById('videos-list');
    if (!videos.length) { list.innerHTML = '<p style="color:var(--muted);padding:16px">No videos yet.</p>'; return; }
    list.innerHTML = videos.map((v, i) => {
        const id = ytId(v.youtube);
        return `
        <div class="item-card">
            ${id
                ? `<img class="item-thumb" src="https://img.youtube.com/vi/${id}/default.jpg" alt="">`
                : `<div class="item-thumb-placeholder"><i class="fab fa-youtube"></i></div>`}
            <div class="item-info">
                <div class="item-title">${esc(v.title)}</div>
                <div class="item-meta">${esc(v.youtube || '')}</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-ghost btn-icon" title="Edit" onclick="openEditVideo(${i})"><i class="fas fa-pen"></i></button>
                <button class="btn btn-danger btn-icon" title="Delete" onclick="confirmDelete('video',${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

// ── Set Featured ──────────────────────────────────────────────────────────────
async function setFeatured(index) {
    const fd = new FormData();
    fd.append('index', index);
    const r = await fetch('/api/songs/set-featured', { method: 'POST', body: fd });
    if ((await r.json()).ok) { await loadData(); toast('Featured song updated!'); }
}

// ── Add / Edit Songs ──────────────────────────────────────────────────────────
function openAddSong() {
    editMode = null;
    document.getElementById('modal-title').textContent = 'Add Song';
    document.getElementById('modal-body').innerHTML = songForm(null);
    openModal();
    setupImgPreview('song-img', 'song-img-preview');
}

function openEditSong(i) {
    editMode = { type: 'song', index: i };
    const s = songs[i];
    document.getElementById('modal-title').textContent = 'Edit Song';
    document.getElementById('modal-body').innerHTML = songForm(s);
    openModal();
    setupImgPreview('song-img', 'song-img-preview');
}

function songForm(s) {
    return `
    <form id="song-form" onsubmit="submitSong(event)">
        <div class="form-row">
            <label>Title <span class="req">*</span></label>
            <input name="title" value="${esc(s?.title || '')}" placeholder="Song title" required>
        </div>
        <div class="form-cols">
            <div class="form-row">
                <label><i class="fab fa-spotify" style="color:#1db954"></i> Spotify URL</label>
                <input name="spotify" type="url" value="${esc(s?.spotify || '')}" placeholder="https://open.spotify.com/...">
            </div>
            <div class="form-row">
                <label><i class="fab fa-apple" style="color:#fc3c44"></i> Apple Music URL</label>
                <input name="apple" type="url" value="${esc(s?.apple || '')}" placeholder="https://music.apple.com/...">
            </div>
        </div>
        <div class="form-row">
            <label>Tags <span style="color:var(--muted);font-weight:400">(comma-separated: Orchestral, Cinematic, Piano…)</span></label>
            <input name="tags" type="text" value="${esc((s?.tags || []).join(', '))}" placeholder="Orchestral, Cinematic, ...">
        </div>
        <div class="form-row">
            <label>Album Art ${!editMode ? '<span class="req">*</span>' : '<span style="color:var(--muted);font-size:0.75em">(leave blank to keep existing)</span>'}</label>
            <input name="img" id="song-img" type="file" accept="image/*" ${!editMode ? 'required' : ''}>
            <div class="img-preview-wrap">
                <img id="song-img-preview" class="img-preview" ${s?.img ? `src="/site-img/${s.img.replace(/^img\//, '')}" style="display:block"` : ''} alt="">
            </div>
            ${s?.img ? `<input type="hidden" name="imgPath" value="${esc(s.img)}">` : ''}
        </div>
        ${!editMode ? crossCreateSongHtml() : ''}
        <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Song</button>
        </div>
    </form>`;
}

function crossCreateSongHtml() {
    const todayStr = new Date().toISOString().split('T')[0];
    return `
    <div class="form-section-title">Cross-create</div>
    <div class="crosscreate">
        <label class="crosscreate-header">
            <input type="checkbox" id="cc-news-chk" onchange="toggleCrossCreate('cc-news-body',this)">
            <span><i class="fas fa-newspaper"></i> Also create a News post for this release</span>
        </label>
        <div class="crosscreate-body" id="cc-news-body">
            <div class="form-cols">
                <div class="form-row">
                    <label>News Title (EN) <span class="req">*</span></label>
                    <input id="cc-news-title" placeholder="New song released – …">
                </div>
                <div class="form-row">
                    <label>News Title (CZ)</label>
                    <input id="cc-news-title-cz" placeholder="Nová píseň – …">
                </div>
            </div>
            <div class="form-cols">
                <div class="form-row">
                    <label>Content (EN)</label>
                    <textarea id="cc-news-content" rows="2"></textarea>
                </div>
                <div class="form-row">
                    <label>Content (CZ)</label>
                    <textarea id="cc-news-content-cz" rows="2"></textarea>
                </div>
            </div>
            <div class="form-row">
                <label>Date</label>
                <input id="cc-news-date" type="date" value="${todayStr}">
            </div>
        </div>
    </div>
    <div class="crosscreate">
        <label class="crosscreate-header">
            <input type="checkbox" id="cc-video-chk" onchange="toggleCrossCreate('cc-video-body',this)">
            <span><i class="fab fa-youtube"></i> Also add to Videos section</span>
        </label>
        <div class="crosscreate-body" id="cc-video-body">
            <div class="form-row">
                <label>YouTube URL <span class="req">*</span></label>
                <input id="cc-video-url" type="url" placeholder="https://www.youtube.com/watch?v=...">
                <img id="cc-yt-preview" class="yt-preview" alt="">
            </div>
        </div>
    </div>`;
}

function toggleCrossCreate(bodyId, chk) {
    document.getElementById(bodyId).classList.toggle('open', chk.checked);
    if (bodyId === 'cc-news-body') {
        const titleInput = document.getElementById('cc-news-title');
        if (titleInput) titleInput.required = chk.checked;
    }
    if (bodyId === 'cc-video-body') {
        const urlInput = document.getElementById('cc-video-url');
        if (urlInput) {
            urlInput.required = chk.checked;
            urlInput.addEventListener('input', updateYtPreview);
        }
    }
}

function updateYtPreview() {
    const url = document.getElementById('cc-video-url')?.value;
    const preview = document.getElementById('cc-yt-preview');
    if (!preview) return;
    const id = ytId(url);
    if (id) {
        preview.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

async function submitSong(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const url = editMode ? `/api/songs/${editMode.index}` : '/api/songs';
    const method = editMode ? 'PUT' : 'POST';
    const r = await fetch(url, { method, body: fd });
    const d = await r.json();
    if (!d.ok) return toast('Error saving song: ' + (d.error || ''), true);

    // Cross-create news
    const newsChk = document.getElementById('cc-news-chk');
    if (newsChk?.checked) {
        const nfd = new FormData();
        nfd.append('title',      document.getElementById('cc-news-title').value || `New song released – ${fd.get('title')}`);
        nfd.append('title_cz',   document.getElementById('cc-news-title-cz').value || '');
        nfd.append('content',    document.getElementById('cc-news-content').value || '');
        nfd.append('content_cz', document.getElementById('cc-news-content-cz').value || '');
        nfd.append('date',       document.getElementById('cc-news-date').value);
        nfd.append('type',       'Single Release');
        if (fd.get('spotify')) nfd.append('spotify', fd.get('spotify'));
        if (fd.get('apple'))   nfd.append('apple',   fd.get('apple'));
        await fetch('/api/news', { method: 'POST', body: nfd });
    }

    // Cross-create video
    const videoChk = document.getElementById('cc-video-chk');
    if (videoChk?.checked) {
        const ytUrl = document.getElementById('cc-video-url')?.value;
        if (ytUrl) {
            const vfd = new FormData();
            vfd.append('title',   fd.get('title'));
            vfd.append('youtube', ytUrl);
            await fetch('/api/videos', { method: 'POST', body: vfd });
        }
    }

    await loadData();
    closeModal();
    toast(editMode ? 'Song updated!' : 'Song added!');
}

// ── Add / Edit News ───────────────────────────────────────────────────────────
function openAddNews() {
    editMode = null;
    document.getElementById('modal-title').textContent = 'Add News';
    document.getElementById('modal-body').innerHTML = newsForm(null);
    openModal();
    setupImgPreview('news-img', 'news-img-preview');
}

function openEditNews(i) {
    editMode = { type: 'news', index: i };
    const n = news[i];
    document.getElementById('modal-title').textContent = 'Edit News';
    document.getElementById('modal-body').innerHTML = newsForm(n);
    openModal();
    setupImgPreview('news-img', 'news-img-preview');
    setupYtPreviewInput('news-youtube', 'news-yt-preview');
}

function newsForm(n) {
    const types = ['Single Release', 'Blog', 'Concert', 'Information'];
    const todayStr = new Date().toISOString().split('T')[0];
    return `
    <form id="news-form" onsubmit="submitNews(event)">
        <div class="form-section-title">Titles</div>
        <div class="form-cols">
            <div class="form-row">
                <label>Title EN <span class="req">*</span></label>
                <input name="title" value="${esc(n?.title || '')}" placeholder="News title" required>
            </div>
            <div class="form-row">
                <label>Title CZ</label>
                <input name="title_cz" value="${esc(n?.title_cz || '')}" placeholder="Nadpis novinky">
            </div>
        </div>
        <div class="form-section-title">Content</div>
        <div class="form-cols">
            <div class="form-row">
                <label>Content EN <span class="req">*</span></label>
                <textarea name="content" placeholder="News content…" required>${esc(n?.content || '')}</textarea>
            </div>
            <div class="form-row">
                <label>Content CZ</label>
                <textarea name="content_cz">${esc(n?.content_cz || '')}</textarea>
            </div>
        </div>
        <div class="form-section-title">Meta</div>
        <div class="form-cols">
            <div class="form-row">
                <label>Date</label>
                <input name="date" type="date" value="${n?.date || todayStr}">
            </div>
            <div class="form-row">
                <label>Type</label>
                <select name="type">
                    ${types.map(t => `<option value="${t}" ${n?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-section-title">Media &amp; Links</div>
        <div class="form-row">
            <label>Image (optional)</label>
            <input name="img" id="news-img" type="file" accept="image/*">
            <div class="img-preview-wrap">
                <img id="news-img-preview" class="img-preview" ${n?.img ? `src="/site-img/${n.img.replace(/^img\//, '')}" style="display:block"` : ''} alt="">
            </div>
        </div>
        <div class="form-row">
            <label><i class="fab fa-youtube" style="color:#ff0000"></i> YouTube URL</label>
            <input name="youtube" id="news-youtube" type="url" value="${esc(n?.links?.youtube || '')}" placeholder="https://www.youtube.com/watch?v=...">
            <img id="news-yt-preview" class="yt-preview" alt="" ${n?.links?.youtube ? `src="https://img.youtube.com/vi/${ytId(n.links.youtube)}/hqdefault.jpg" style="display:block"` : ''}>
        </div>
        <div class="form-cols">
            <div class="form-row">
                <label><i class="fab fa-spotify" style="color:#1db954"></i> Spotify URL</label>
                <input name="spotify" type="url" value="${esc(n?.links?.spotify || '')}">
            </div>
            <div class="form-row">
                <label><i class="fab fa-apple" style="color:#fc3c44"></i> Apple Music URL</label>
                <input name="apple" type="url" value="${esc(n?.links?.apple || '')}">
            </div>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
        </div>
    </form>`;
}

async function submitNews(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const url = editMode ? `/api/news/${editMode.index}` : '/api/news';
    const method = editMode ? 'PUT' : 'POST';
    const r = await fetch(url, { method, body: fd });
    const d = await r.json();
    if (!d.ok) return toast('Error: ' + (d.error || ''), true);
    await loadData();
    closeModal();
    toast(editMode ? 'News updated!' : 'News added!');
}

// ── Add / Edit Videos ─────────────────────────────────────────────────────────
function openAddVideo() {
    editMode = null;
    document.getElementById('modal-title').textContent = 'Add Video';
    document.getElementById('modal-body').innerHTML = videoForm(null);
    openModal();
    setupYtPreviewInput('video-youtube', 'video-yt-preview');
}

function openEditVideo(i) {
    editMode = { type: 'video', index: i };
    const v = videos[i];
    document.getElementById('modal-title').textContent = 'Edit Video';
    document.getElementById('modal-body').innerHTML = videoForm(v);
    openModal();
    setupYtPreviewInput('video-youtube', 'video-yt-preview');
}

function videoForm(v) {
    const id = v ? ytId(v.youtube) : null;
    return `
    <form id="video-form" onsubmit="submitVideo(event)">
        <div class="form-row">
            <label>Title <span class="req">*</span></label>
            <input name="title" value="${esc(v?.title || '')}" placeholder="Video title" required>
        </div>
        <div class="form-row">
            <label>YouTube URL <span class="req">*</span></label>
            <input name="youtube" id="video-youtube" type="url" value="${esc(v?.youtube || '')}" required placeholder="https://www.youtube.com/watch?v=...">
            <img id="video-yt-preview" class="yt-preview" alt="" ${id ? `src="https://img.youtube.com/vi/${id}/hqdefault.jpg" style="display:block"` : ''}>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
        </div>
    </form>`;
}

async function submitVideo(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const url = editMode ? `/api/videos/${editMode.index}` : '/api/videos';
    const method = editMode ? 'PUT' : 'POST';
    const r = await fetch(url, { method, body: fd });
    const d = await r.json();
    if (!d.ok) return toast('Error: ' + (d.error || ''), true);
    await loadData();
    closeModal();
    toast(editMode ? 'Video updated!' : 'Video added!');
}

// ── Delete ────────────────────────────────────────────────────────────────────
let pendingDelete = null;

function confirmDelete(type, index) {
    pendingDelete = { type, index };
    const names = { song: songs[index]?.title, news: news[index]?.title, video: videos[index]?.title };
    document.getElementById('confirm-text').textContent = `Delete "${names[type]}"?`;
    document.getElementById('confirm-overlay').hidden = false;
    document.getElementById('confirm-yes').onclick = executeDelete;
}

async function executeDelete() {
    if (!pendingDelete) return;
    const { type, index } = pendingDelete;
    const endpoints = { song: 'songs', news: 'news', video: 'videos' };
    const r = await fetch(`/api/${endpoints[type]}/${index}`, { method: 'DELETE' });
    const d = await r.json();
    closeConfirm();
    if (!d.ok) return toast('Delete failed', true);
    await loadData();
    toast('Deleted.');
}

function closeConfirm() {
    document.getElementById('confirm-overlay').hidden = true;
    pendingDelete = null;
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal()  { document.getElementById('modal-overlay').hidden = false; }
function closeModal() { document.getElementById('modal-overlay').hidden = true; editMode = null; }

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeConfirm(); }
});

// ── UI helpers ────────────────────────────────────────────────────────────────
function setupImgPreview(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
        reader.readAsDataURL(file);
    });
}

function setupYtPreviewInput(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('input', () => {
        const id = ytId(input.value);
        if (id) { preview.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`; preview.style.display = 'block'; }
        else    { preview.style.display = 'none'; }
    });
}

let toastTimer = null;
function toast(msg, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast' + (isError ? ' error' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

function ytId(url) {
    if (!url) return null;
    const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return m ? m[1] : null;
}

function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
