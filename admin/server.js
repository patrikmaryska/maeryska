const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3001;

const ROOT       = path.join(__dirname, '..');
const SONGS_JSON = path.join(ROOT, 'script', 'music.json');
const NEWS_JSON  = path.join(ROOT, 'script', 'news.json');
const VIDEOS_JSON= path.join(ROOT, 'script', 'videos.json');

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/site-img', express.static(path.join(ROOT, 'img')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Multer (image uploads) ────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const section = req.baseSection || 'songs';
        const dest = section === 'news'
            ? path.join(ROOT, 'img', 'blogs')
            : path.join(ROOT, 'img', 'songs');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename(req, file, cb) {
        const ext  = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext)
            .toLowerCase().replace(/[^a-z0-9]/g, '_');
        cb(null, `${base}_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function songUpload(req, res, next)  { req.baseSection = 'songs'; upload.single('img')(req, res, next); }
function newsUpload(req, res, next)  { req.baseSection = 'news';  upload.single('img')(req, res, next); }

// ── Helpers ───────────────────────────────────────────────────────────────────
const readJSON  = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJSON = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
const today     = () => new Date().toISOString().split('T')[0];

// ── GET all data ──────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
    res.json({
        songs:  readJSON(SONGS_JSON),
        news:   readJSON(NEWS_JSON),
        videos: readJSON(VIDEOS_JSON)
    });
});

// ── SONGS ─────────────────────────────────────────────────────────────────────
app.post('/api/songs/set-featured', (req, res) => {
    const songs = readJSON(SONGS_JSON);
    const i = parseInt(req.body.index);
    if (isNaN(i) || i < 0 || i >= songs.length) return res.status(400).json({ error: 'Invalid index' });
    const [song] = songs.splice(i, 1);
    songs.unshift(song);
    writeJSON(SONGS_JSON, songs);
    res.json({ ok: true });
});

app.post('/api/songs', songUpload, (req, res) => {
    const songs = readJSON(SONGS_JSON);
    const song = {
        title:   req.body.title,
        spotify: req.body.spotify || '',
        apple:   req.body.apple   || '',
        img:     req.file ? `img/songs/${req.file.filename}` : (req.body.imgPath || ''),
        tags:    req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    songs.unshift(song);
    writeJSON(SONGS_JSON, songs);
    res.json({ ok: true, song, index: 0 });
});

app.put('/api/songs/:i', songUpload, (req, res) => {
    const songs = readJSON(SONGS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= songs.length) return res.status(400).json({ error: 'Invalid index' });
    songs[i] = {
        title:   req.body.title   || songs[i].title,
        spotify: req.body.spotify !== undefined ? req.body.spotify : songs[i].spotify,
        apple:   req.body.apple   !== undefined ? req.body.apple   : songs[i].apple,
        img:     req.file ? `img/songs/${req.file.filename}` : (req.body.imgPath || songs[i].img),
        tags:    req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : (songs[i].tags || [])
    };
    writeJSON(SONGS_JSON, songs);
    res.json({ ok: true, song: songs[i] });
});

app.delete('/api/songs/:i', (req, res) => {
    const songs = readJSON(SONGS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= songs.length) return res.status(400).json({ error: 'Invalid index' });
    songs.splice(i, 1);
    writeJSON(SONGS_JSON, songs);
    res.json({ ok: true });
});

// ── NEWS ──────────────────────────────────────────────────────────────────────
app.post('/api/news', newsUpload, (req, res) => {
    const news = readJSON(NEWS_JSON);
    const item = {
        title:      req.body.title,
        title_cz:   req.body.title_cz   || '',
        content:    req.body.content    || '',
        content_cz: req.body.content_cz || '',
        date:       req.body.date       || today(),
        type:       req.body.type       || 'Information'
    };
    if (req.file) item.img = `img/blogs/${req.file.filename}`;
    const links = {};
    if (req.body.spotify) links.spotify = req.body.spotify;
    if (req.body.youtube) links.youtube = req.body.youtube;
    if (req.body.apple)   links.apple   = req.body.apple;
    if (Object.keys(links).length) item.links = links;
    news.unshift(item);
    writeJSON(NEWS_JSON, news);
    res.json({ ok: true, item });
});

app.put('/api/news/:i', newsUpload, (req, res) => {
    const news = readJSON(NEWS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= news.length) return res.status(400).json({ error: 'Invalid index' });
    const ex = news[i];
    news[i] = {
        title:      req.body.title      !== undefined ? req.body.title      : ex.title,
        title_cz:   req.body.title_cz   !== undefined ? req.body.title_cz   : (ex.title_cz   || ''),
        content:    req.body.content    !== undefined ? req.body.content    : ex.content,
        content_cz: req.body.content_cz !== undefined ? req.body.content_cz : (ex.content_cz || ''),
        date:       req.body.date       || ex.date,
        type:       req.body.type       || ex.type,
        img:        req.file ? `img/blogs/${req.file.filename}` : ex.img
    };
    if (!news[i].img) delete news[i].img;
    const links = {};
    if (req.body.spotify) links.spotify = req.body.spotify;
    if (req.body.youtube) links.youtube = req.body.youtube;
    if (req.body.apple)   links.apple   = req.body.apple;
    if (Object.keys(links).length) news[i].links = links;
    else if (ex.links) news[i].links = ex.links;
    writeJSON(NEWS_JSON, news);
    res.json({ ok: true, item: news[i] });
});

app.delete('/api/news/:i', (req, res) => {
    const news = readJSON(NEWS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= news.length) return res.status(400).json({ error: 'Invalid index' });
    news.splice(i, 1);
    writeJSON(NEWS_JSON, news);
    res.json({ ok: true });
});

// ── VIDEOS ────────────────────────────────────────────────────────────────────
app.post('/api/videos', (req, res) => {
    const videos = readJSON(VIDEOS_JSON);
    const video = { title: req.body.title, youtube: req.body.youtube };
    videos.unshift(video);
    writeJSON(VIDEOS_JSON, videos);
    res.json({ ok: true, video });
});

app.put('/api/videos/:i', (req, res) => {
    const videos = readJSON(VIDEOS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= videos.length) return res.status(400).json({ error: 'Invalid index' });
    videos[i] = {
        title:   req.body.title   || videos[i].title,
        youtube: req.body.youtube || videos[i].youtube
    };
    writeJSON(VIDEOS_JSON, videos);
    res.json({ ok: true, video: videos[i] });
});

app.delete('/api/videos/:i', (req, res) => {
    const videos = readJSON(VIDEOS_JSON);
    const i = parseInt(req.params.i);
    if (isNaN(i) || i < 0 || i >= videos.length) return res.status(400).json({ error: 'Invalid index' });
    videos.splice(i, 1);
    writeJSON(VIDEOS_JSON, videos);
    res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  Maeryska Admin Panel`);
    console.log(`  -> http://localhost:${PORT}\n`);
});
