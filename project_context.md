# AniVerse Project Context

This document provides the necessary context, theme guidelines, and technical stack information for the **AniVerse** project. It is designed to quickly onboard other AI assistants or developers to the codebase.

**GitHub Owner**: kapilsingh09

---

## 🏗️ Technical Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: Axios & React Query
- **Icons**: Lucide React

### Backend (`/backend`)
- **Framework**: Node.js with Express
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, bcryptjs
- **Caching/Other**: Redis, Nodemailer
- **Security**: Helmet, express-rate-limit, CORS

---

## 🎨 Project Theme & Aesthetics

AniVerse is designed with a **premium, modern dark mode** aesthetic. It focuses on visual excellence with dynamic micro-animations, glassmorphism, and high contrast.

- **Primary Vibe**: Sleek, cinematic, and immersive (similar to modern streaming platforms).
- **Core Elements**: 
  - **Glassmorphism**: Heavy use of translucent cards with `backdrop-blur-xl`, `bg-white/10`, and `border-white/20`.
  - **Clean Typography**: Uses standard Sans-Serif (`Inter`), relying on stark white text (`text-white`) for primary headings and muted zinc (`text-zinc-400`) for secondary text.
  - **No Clutter**: Icons are kept minimal in navigation; active states rely on subtle structural cues like a 2px bottom border or a left border (mobile) instead of heavy background colors.

---

## 💅 Global CSS & Design Tokens

The project uses CSS variables defined in `frontend/src/app/globals.css`. Do not hardcode random hex values; stick to this palette to maintain consistency.

### Core Color Palette
| Token | Hex Value | Tailwind Equivalent | Usage |
|-------|-----------|---------------------|-------|
| `--background` | `#18181b` | `zinc-900` | Main application background |
| `--surface` | `#27272a` | `zinc-800` | Secondary backgrounds, sidebars |
| `--card` | `#27272a` | `zinc-800` | Solid card backgrounds |
| `--primary` | `#ffffff` | `white` | Primary text and headings |
| `--secondary` | `#a1a1aa` | `zinc-400` | Subtitles, descriptions, muted text |
| `--border` | `#3f3f46` | `zinc-700` | Dividers, borders |

### Brand Accents
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--accent` | `#F47521` | Primary brand color (Orange), call-to-action buttons, active nav states |
| `--accent-secondary` | `#e57429` | Hover states for primary buttons |

### Reusable Custom Classes
The `globals.css` file also exports several custom utility classes that you should use instead of repeating Tailwind classes:
- `.container-main`: Standardized max-width (1320px) responsive container.
- `.section-padding`: Standardized vertical padding for page sections.
- `.card-base` / `.card-hover`: Base styling and hover lift effects for standard cards.
- `.gradient-text-accent`: Applies the brand orange gradient to text.
- **Scrollbar**: The global CSS includes webkit and firefox overrides to ensure scrollbars are thin and dark, matching the zinc theme.
