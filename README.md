# Locale

Hyperlocal UGC sourcing platform for F&B businesses. Connects operators (restaurants, coffee shops, cafes) with pre-vetted local creators based on vibe, values, and neighborhood alignment.

## Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **PostgreSQL** 14+ running locally
- **npm** 9+

### 1. Clone & Install

```bash
git clone <repo-url>
cd nuvention
npm run install:all
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb locale
```

Configure `.env` in `server/`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your `DATABASE_URL`:

```
DATABASE_URL=postgresql://<your-username>@localhost:5432/locale?schema=public
```

Run migrations and seed:

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Run the App

From the root directory:

```bash
npm run dev
```

This starts both:
- **Frontend** at http://localhost:5173
- **Backend** at http://localhost:3001

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3001) |
| `DEMO_MODE` | No | Enable demo mode (default: true) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:5173) |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features (brand analysis, portfolio analysis, match rationale). Falls back to templates without it. |
| `GOOGLE_PLACES_API_KEY` | No | Google Places API key for auto-import from Google Maps URLs. Falls back to preset data without it. |
| `YELP_API_KEY` | No | Yelp Fusion API key for auto-import from Yelp URLs. Falls back to preset data without it. |
| `AWS_REGION` | No | AWS region for S3 (default: us-east-1) |
| `AWS_ACCESS_KEY_ID` | No | AWS access key for S3 uploads. Uses placeholder URLs without it. |
| `AWS_SECRET_ACCESS_KEY` | No | AWS secret key for S3 uploads. Uses placeholder URLs without it. |
| `S3_BUCKET_NAME` | No | S3 bucket name for file uploads (default: locale-uploads) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (future - not used in demo) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret (future - not used in demo) |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL (uses Vite proxy to `/api` by default) |

**Important:** The app works fully in demo mode without any API keys. All AI features, file uploads, and external API calls gracefully fall back to pre-seeded data and placeholder URLs.

---

## Optional Services Setup

### OpenAI (AI-Powered Features)

Enables real-time brand analysis from Google/Yelp data, creator portfolio image analysis, and AI-generated match rationales.

1. Get an API key from https://platform.openai.com
2. Set `OPENAI_API_KEY=sk-...` in `server/.env`

Uses `gpt-4o-mini` for text analysis and vision. Cost: ~$0.01-0.02 per portfolio analysis, ~$0.003 per content request matching.

### Google Places API (Auto-Import from Google Maps)

Enables operators to paste a Google Maps URL during onboarding to auto-fill their brand profile.

1. Go to https://console.cloud.google.com
2. Enable "Places API (New)"
3. Create an API key restricted to Places API
4. Set `GOOGLE_PLACES_API_KEY=...` in `server/.env`

Free tier: $200/month credit covers ~40,000 requests.

### Yelp Fusion API (Auto-Import from Yelp)

Enables operators to paste a Yelp URL during onboarding.

1. Create an app at https://www.yelp.com/developers
2. Get the API key
3. Set `YELP_API_KEY=...` in `server/.env`

Free tier: 5,000 API calls/day.

### AWS S3 (File Uploads)

Enables real file uploads for creator portfolios and project drafts.

1. Create an S3 bucket (e.g., `locale-uploads`)
2. Configure bucket for public read access (for image URLs)
3. Create an IAM user with S3 permissions
4. Set in `server/.env`:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=locale-uploads
   ```

Without S3: File uploads return placeholder URLs. The app still works - images use Unsplash URLs from seed data.

---

## Production Deployment

### Frontend (Netlify)

1. Connect GitHub repo to Netlify
2. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`

### Backend (AWS EC2)

1. Launch EC2 instance (t3.micro is sufficient)
2. Install Node.js 20+
3. Clone repo, `cd server && npm install`
4. Configure `.env` with production values
5. Run migrations: `npx prisma migrate deploy`
6. Seed database: `npx prisma db seed`
7. Start with PM2: `pm2 start src/index.js --name locale-api`
8. Set up Nginx reverse proxy: port 80/443 → localhost:3001

### Database (AWS RDS)

1. Create PostgreSQL 16 instance on RDS
2. Security group: allow port 5432 from EC2 only
3. Set `DATABASE_URL` in server `.env` to the RDS endpoint

---

## Demo Accounts

The seed script creates these demo accounts:

### Operators
| Name | Email | Business | Status |
|------|-------|----------|--------|
| Josh Rivera | josh@colectivo.com | Colectivo Coffee | Returning (2 active projects) |
| Marie Laurent | marie@coralie.com | Patisserie Coralie | Returning (1 completed project) |
| Ellen King | ellen@hewn.com | Hewn Bread | Returning (1 active project) |
| Josie Chen | josie@coffeelab.com | New Coffee Lab | New (triggers onboarding) |

### Creators
| Name | Email | Display Name | Status |
|------|-------|-------------|--------|
| Shaurya Garg | shaurya@locale.app | Shaurya G. | Returning (3 active projects) |
| Katelyn Liu | katelyn@locale.app | Katelyn L. | Returning (1 active project) |
| Alex Torres | newcreator@locale.app | - | New (triggers onboarding) |

Use the Demo Switcher (bottom-right corner) to switch between accounts during the demo.

---

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, Axios
- **Backend:** Node.js 20+, Express.js, Prisma ORM
- **Database:** PostgreSQL 16
- **File Storage:** AWS S3 (optional)
- **AI:** OpenAI API (optional)
- **Design:** Playfair Display + DM Sans, warm earth-tone palette

---

## Project Structure

```
locale/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api/               # Axios client + API functions
│   │   ├── components/        # Shared UI components
│   │   ├── contexts/          # AuthContext (demo user state)
│   │   ├── pages/             # Route-level page components
│   │   │   ├── operator/      # Operator pages
│   │   │   └── creator/       # Creator pages
│   │   └── utils/             # Constants, formatters
│   └── tailwind.config.js
│
├── server/                    # Express backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Demo data seeding
│   └── src/
│       ├── config/            # DB, S3, OpenAI clients
│       ├── middleware/        # Auth middleware
│       ├── routes/            # API route handlers
│       ├── services/          # Matching, AI, payments
│       └── utils/             # Constants
│
└── package.json               # Root monorepo config
```
