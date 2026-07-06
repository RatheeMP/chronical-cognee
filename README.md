# Chronicle

## 🚀 Live Deployed link
https://chronical-cognee.vercel.app

## 🎥 Demo Video
https://youtu.be/YOUR_VIDEO_LINK

## 📖 Overview
Chronicle is a Decision Intelligence Engine powered by Cognee Cloud that remembers the reasoning behind technical and product decisions, enabling contextual recall, impact analysis, and connected memory exploration.


## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11+, [Cognee Cloud](https://docs.cognee.ai/cognee-cloud/connections/cloud-sdk) for memory

## Prerequisites

- Node.js 20+
- Python 3.11+
- npm
- Cognee Cloud tenant URL and API key (from the [dashboard](https://platform.cognee.ai))

## Quick Start

### 1. Configure environment

```powershell
cd chronicle
copy frontend\.env.local.example frontend\.env.local
copy backend\.env.example backend\.env
```

Edit `backend\.env` and set your Cognee Cloud **tenant URL** and **API key**:

```env
COGNEE_SERVICE_URL=https://your-tenant.aws.cognee.ai
COGNEE_API_KEY=your_cognee_api_key
COGNEE_DATASET_NAME=main_dataset
```

### 2. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000

### 4. Run both (from root)

```powershell
npm install
npm run dev
```

## Project Structure

```
chronicle/
├── frontend/   Next.js application
├── backend/    FastAPI + Cognee Cloud REST client
│   └── app/
│       ├── api/            HTTP routes
│       ├── config/         App settings
│       ├── integrations/   Cognee Cloud httpx client
│       ├── models/         Request schemas
│       └── services/       Memory orchestration
├── README.md
└── .env.example
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/memory/remember` | Store plain text in Cognee memory |

### Remember memory

```powershell
curl -X POST http://localhost:8000/memory/remember `
  -H "Content-Type: application/json" `
  -d "{\"text\": \"Chronicle stores this in Cognee memory.\"}"
```

Response: the raw JSON object returned by Cognee Cloud (`POST /api/v1/remember`).

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL |
| `CORS_ORIGINS` | backend | Allowed frontend origins |
| `ENVIRONMENT` | backend | `development` or `production` |
| `COGNEE_SERVICE_URL` | backend | Cognee Cloud tenant URL |
| `COGNEE_API_KEY` | backend | Cognee Cloud API key |
| `COGNEE_DATASET_NAME` | backend | Target dataset for remember |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend and backend |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run lint` | Lint frontend |
| `npm run test:backend` | Run backend tests |

## Development Notes

- Frontend calls the backend via `NEXT_PUBLIC_API_URL`
- CORS allows `http://localhost:3000`
- Cognee Cloud is called via REST (`X-Api-Key`); recall/improve/forget are not implemented yet
