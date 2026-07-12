# AniVerse 🎌

A premium, cinematic anime discovery platform. Built with Next.js 15 + Express.

---

## ✨ Features

- 🔥 **Hero Slider** — Seasonal popular anime (airing now), auto-advances every 6s with smooth Framer Motion transitions
- 📺 **Multi-source Sliders** — Trending (Jikan/MAL), Popular (Kitsu), Top Rated, Latest Releases
- 🎬 **Anime Detail Page** — Full info page with expandable synopsis, genre pills, studio info, and episode list
- 📋 **Episode Management** — Shows 6 episodes by default with a black blur fade + "Show All N Episodes" button. For series with 100+ episodes, automatically groups into arcs (every 24 eps) with switchable tabs
- 🔎 **Search Overlay** — Keyboard-friendly search with zero layout shift (scrollbar compensation)
- 📁 **Playlists** — Add anime to named playlists (UI ready, backend connected)
- 🎨 **Design** — Glassmorphism, cinematic dark mode, Apple-like hover animations

---

## 🏗️ Architecture

```
just_built/
├── backend/                  Express API server
│   ├── controllers/
│   │   ├── jikanAnimeController.js   GET /api/jikan/*
│   │   └── kitsuAnimeController.js   GET /api/anime/*
│   ├── services/
│   │   ├── jikanAnimeService.js      Jikan (MyAnimeList) + Redis cache
│   │   ├── kitsuAnimeService.js      Kitsu API + Redis cache
│   │   └── redisService.js           Cache-aside helpers
│   └── routes/
│       ├── jikanAnimeRoutes.js
│       └── kitsuAnimeRoutes.js
│
└── frontend/                 Next.js 15 App Router
    └── src/
        ├── app/
        │   ├── page.tsx              Home — all sliders
        │   └── anime/[source]/[id]/  Detail page
        ├── components/
        │   ├── hero/HeroSlider.tsx
        │   ├── anime/AnimeCard.tsx   Clickable → routes to detail page
        │   ├── anime/AnimeSlider.tsx
        │   └── layout/Navbar.tsx
        ├── hooks/
        │   ├── useAnime.ts           All list hooks
        │   └── useAnimeDetail.ts     Detail + episodes hooks
        └── types/anime.ts            Shared Anime, AnimeDetail, Episode types
```

---

## 🌐 API Routes

### Jikan (MyAnimeList) — mounted at `/api/jikan`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/jikan/popular` | Airing anime ranked by score |
| GET | `/api/jikan/:id` | Full anime detail (genres, studios, trailer) |
| GET | `/api/jikan/:id/episodes` | Episode list page 1 (100 eps/page) |

### Kitsu — mounted at `/api/anime`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/anime/popular` | Most followed anime on Kitsu |
| GET | `/api/anime/top-rated` | Sorted by averageRating |
| GET | `/api/anime/latest` | Sorted by startDate desc |
| GET | `/api/anime/seasonal` | Current season, sorted by fans |
| GET | `/api/anime/:id` | Full detail with genres (via `?include=categories`) |
| GET | `/api/anime/:id/episodes` | Episode list page 1 (20 eps/page) |

---

## 🔗 Detail Page URL Scheme

Every `AnimeCard` links to:

```
/anime/jikan/:mal_id     ← for Jikan/MAL cards
/anime/kitsu/:kitsu_id   ← for Kitsu cards
```

The `source` field is added to every anime object by the backend transform so the frontend always knows which API to call.

---

## 🚀 Running Locally

**Prerequisites**: Node.js 18+, Redis running on `localhost:6379`

```bash
# Backend
cd backend
npm install
npx nodemon          # runs on :5000 by default

# Frontend (new terminal)
cd frontend
npm install
npm run dev          # runs on :3000
```

---

## 📌 TODOs (marked in code with ╔═══╗ box comments)

- [ ] **Watch Now** — wire to a streaming source or external link
- [ ] **Add to List** — connect to user account system
- [ ] **Episode pagination** — currently page 1 only; add `?page=N` support to hooks + backend
- [ ] **Arc metadata** — integrate AniList/AniDB for true season/arc episode grouping
- [ ] **Kitsu studios** — studios need a separate `?include=producers` relationship fetch