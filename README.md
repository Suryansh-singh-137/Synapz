# SYNAPZ — AI-Powered Second Brain

> Save anything. Ask everything. Your knowledge, queryable.

**Live Demo:** [synapz-gamma.vercel.app](https://synapz-gamma.vercel.app)

SYNAPZ is a full-stack AI application that lets you save articles, PDFs, tweets, and YouTube videos, then chat with your saved knowledge using natural language. Built on a production RAG (Retrieval-Augmented Generation) pipeline with semantic vector search.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [RAG Pipeline](#rag-pipeline)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)

---

## Features

- **Multi-source ingestion** — Save articles, PDFs, tweets, YouTube videos, and plain text notes
- **PDF text extraction** — Local extraction pipeline using `pdf-parse` before Cloudinary upload (bypasses CDN auth restrictions)
- **Smart content extraction** — Waterfall strategy: Jina AI Reader → direct HTML scrape (cheerio) → meta tag fallback
- **Vector embeddings** — Cohere `embed-english-v3.0` (1024 dimensions) for semantic understanding
- **RAG chat** — Ask questions in natural language, get answers grounded in your saved content
- **Public brain sharing** — Share your brain via a unique link; visitors can browse and chat with it
- **JWT authentication** — Secure signup/login with bcrypt password hashing
- **Brutalist design system** — Custom monochrome UI built with Tailwind CSS v4

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | React framework, SSR, routing |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Zustand | Client-side state management |
| Zod | Form validation |

### Backend
| Technology | Purpose |
|-----------|---------|
| Express.js v5 | REST API server |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| Multer | File upload handling |
| pdf-parse | PDF text extraction |
| Cheerio | HTML scraping fallback |
| JWT + bcrypt | Authentication |

### AI & Storage
| Service | Purpose |
|---------|---------|
| Cohere `embed-english-v3.0` | Text → 1024-dim vector embeddings |
| Groq `llama-3.3-70b-versatile` | LLM for answer generation |
| Jina AI Reader | Primary URL-to-text extraction |
| MongoDB Atlas | Database + vector storage |
| Cloudinary | PDF file storage |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| cron-job.org | Keep-alive pings for Render free tier |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                       │
│              Next.js 14 + Zustand + Tailwind             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API
┌────────────────────────▼────────────────────────────────┐
│                   SERVER (Render)                        │
│                Express.js + TypeScript                   │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │    Auth     │  │   Content    │  │     Brain     │  │
│  │  /signup    │  │  /content    │  │  /brain/chat  │  │
│  │  /signin    │  │  POST/GET    │  │  /brain/share │  │
│  └─────────────┘  │  /DELETE     │  │  /:hash/chat  │  │
│                   └──────────────┘  └───────────────┘  │
└───────┬───────────────────┬─────────────────────────────┘
        │                   │
┌───────▼───────┐   ┌───────▼──────────────────────────┐
│   MongoDB     │   │         External Services         │
│   Atlas       │   │                                   │
│               │   │  Cohere API  → embeddings         │
│  Users        │   │  Groq API    → LLM generation     │
│  Content      │   │  Jina AI     → URL extraction     │
│  Links        │   │  Cloudinary  → PDF storage        │
│  (+ vectors)  │   │                                   │
└───────────────┘   └──────────────────────────────────┘
```

---

## RAG Pipeline

SYNAPZ implements a complete Retrieval-Augmented Generation pipeline from scratch without any LLM framework abstractions.

### Indexing (when content is saved)

```
User submits URL / PDF / text
           │
           ▼
    ┌─────────────────────────────────────────┐
    │           EXTRACTION LAYER              │
    │                                         │
    │  PDF  → pdf-parse (local file, pre-CDN) │
    │  URL  → Jina AI Reader                  │
    │       → cheerio direct scrape (fallback)│
    │       → meta tag extraction (fallback)  │
    │  Text → stored directly                 │
    └──────────────────┬──────────────────────┘
                       │ raw text
                       ▼
    ┌─────────────────────────────────────────┐
    │            CHUNKING LAYER               │
    │                                         │
    │  chunkText(text, 500, 50)               │
    │  • 500 words per chunk                  │
    │  • 50-word overlap between chunks       │
    │  • Preserves context at boundaries      │
    └──────────────────┬──────────────────────┘
                       │ chunks[]
                       ▼
    ┌─────────────────────────────────────────┐
    │           EMBEDDING LAYER               │
    │                                         │
    │  Cohere embed-english-v3.0              │
    │  Each chunk → 1024-dimension vector     │
    │  input_type: "search_document"          │
    └──────────────────┬──────────────────────┘
                       │ vectors[]
                       ▼
    ┌─────────────────────────────────────────┐
    │             STORAGE LAYER               │
    │                                         │
    │  MongoDB: Content.chunks[]              │
    │  { text, chunkIndex, embedding[1024] }  │
    └─────────────────────────────────────────┘
```

### Retrieval + Generation (when user chats)

```
User asks: "What are the key concepts?"
           │
           ▼
    Cohere embed query → vector[1024]
    input_type: "search_query"
           │
           ▼
    Cosine similarity search across
    all chunks belonging to this userId
    Returns top-5 most similar chunks
           │
           ▼
    Build context string from chunks
    + source titles and links
           │
           ▼
    Groq llama-3.3-70b-versatile
    System: "Answer only from context"
    User: context + question
           │
           ▼
    Return { answer, sources[] }
```

### Why cosine similarity?

Two vectors are "similar" when they point in the same direction in 1024-dimensional space. The formula:

```
similarity = (A · B) / (||A|| × ||B||)

Result ranges from -1 to 1:
  1.0  = identical meaning
  0.7+ = strongly related
  0.5  = somewhat related
  0.0  = unrelated
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB Atlas account (free tier works)
- Cohere API key — [dashboard.cohere.com](https://dashboard.cohere.com)
- Groq API key — [console.groq.com](https://console.groq.com)
- Cloudinary account — [cloudinary.com](https://cloudinary.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/Suryansh-singh-137/Synapz.git
cd Synapz

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URL=mongodb+srv://...
JWT_SECRET=your_long_random_secret_here
GROQ_API_KEY=gsk_...
COHERE_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://synapz-gamma.vercel.app
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> **Production:** Set `NEXT_PUBLIC_API_URL` to your Render backend URL in the Vercel dashboard environment variables.

---

## API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/signup` | `{ username, password }` | Create account |
| POST | `/api/v1/signin` | `{ username, password }` | Login, returns JWT |

### Content (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/content` | — | Get all user content |
| POST | `/api/v1/content` | `{ type, title, link, tags }` or `FormData` for PDF | Add content |
| DELETE | `/api/v1/content` | `{ contentId }` | Delete content |

### Brain (requires auth)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/brain/chat` | `{ query }` | Chat with your brain |
| POST | `/api/v1/brain/share` | — | Generate share link |
| DELETE | `/api/v1/brain/share` | — | Deactivate share link |

### Public (no auth)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/brain/:hash` | — | Get shared brain content |
| POST | `/api/v1/brain/:hash/chat` | `{ query }` | Chat with shared brain |

---

## Project Structure

```
Synapz/
├── backend/
│   ├── src/
│   │   ├── controller/
│   │   │   ├── autht.ts            # signup, signin
│   │   │   ├── content.ts          # CRUD + background processing
│   │   │   ├── chatController.ts   # private + public RAG chat
│   │   │   ├── generateLink.ts     # share link management
│   │   │   └── extractController.ts
│   │   ├── middleware/
│   │   │   └── authmid.ts          # JWT verification
│   │   ├── models/
│   │   │   └── Schema.ts           # User, Content, Link models
│   │   ├── utils/
│   │   │   ├── embeddings.ts       # Cohere embedding calls
│   │   │   ├── extractText.ts      # Jina → scrape → meta fallback
│   │   │   ├── extractPdf.ts       # pdf-parse local extraction
│   │   │   ├── vectorSearch.ts     # cosine similarity search
│   │   │   ├── fileUpload.ts       # multer + Cloudinary
│   │   │   ├── validation.ts       # Zod schemas
│   │   │   └── hashGenrator.ts     # share link hash
│   │   └── index.ts                # Express app + route registration
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── signup/page.tsx
    │   │   ├── dashboard/
    │   │   │   ├── page.tsx         # dashboard home
    │   │   │   ├── content/page.tsx # content management
    │   │   │   ├── chat/page.tsx    # private brain chat
    │   │   │   └── layout.tsx
    │   │   ├── brain/[hash]/
    │   │   │   └── page.tsx         # public shared brain
    │   │   └── page.tsx             # landing page
    │   ├── components/
    │   │   ├── AddContentModal.tsx
    │   │   ├── ShareModal.tsx
    │   │   ├── DashboardLayout.tsx
    │   │   └── ...landing page components
    │   ├── store/
    │   │   ├── authStore.ts         # Zustand auth state
    │   │   ├── contentStore.ts      # Zustand content state
    │   │   ├── chatStore.ts         # Zustand chat state
    │   │   └── shareStore.ts        # Zustand share state
    │   └── lib/
    │       ├── apiClient.ts         # all fetch calls
    │       └── validation.ts        # Zod frontend schemas
    └── package.json
```

---

## Deployment

### Backend → Render

1. Connect GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables from `backend/.env`

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Framework: Next.js (auto-detected)
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api/v1`

### Keep Render alive (free tier)

Set up a cron job at [cron-job.org](https://cron-job.org) to ping `https://your-render-url.onrender.com/api/v1/test` every 10 minutes.

---

## Known Limitations & Future Improvements

### Current limitations

| Area | Current | Limitation |
|------|---------|------------|
| Chunking | Word-based (500 words) | Splits mid-sentence, loses semantic boundaries |
| Vector search | In-memory cosine similarity | O(n) — slows down as content grows |
| Similarity | Returns top-K regardless of score | May return irrelevant chunks if no good match |
| Twitter/X | URL context only | Full tweet text requires OAuth API access |
| Scanned PDFs | Fails gracefully | No OCR — image-only PDFs have no text layer |

### Planned improvements

- [ ] **MongoDB Atlas `$vectorSearch`** — HNSW index for O(log n) search at scale
- [ ] **Similarity threshold** — Filter chunks below 0.65 cosine similarity
- [ ] **Semantic chunking** — Split at paragraph/sentence boundaries
- [ ] **Streaming responses** — Word-by-word answer generation like ChatGPT
- [ ] **Browser extension** — Save any webpage to your brain in one click
- [ ] **Re-ranking** — Second-pass scoring of retrieved chunks before generation

---

## What I Learned Building This

Building SYNAPZ from scratch (without LLM frameworks like LangChain) taught me:

- **RAG fundamentals** — Why the same embedding model must be used at index time and query time, why overlap matters in chunking, how cosine similarity finds semantic matches
- **Production debugging** — Cloudinary access modes, TypeScript strict mode differences between dev and build, CORS configuration for monorepos
- **System design tradeoffs** — Why brute-force search works at small scale but needs indexes at scale, why PDF extraction must happen before CDN upload
- **Full-stack deployment** — Environment variable scoping (compile-time vs runtime), monorepo deployment with separate root directories

---

## License

MIT

---

*Built by [Suryansh Singh](https://github.com/Suryansh-singh-137)*
