# Environment Variables Configuration

This document lists all the environment variables required to run the Transcrify application.

## Backend (FastAPI)

These variables are needed for the Python backend (`backend/`).

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | **Required**. Your OpenAI API key for Whisper transcription. | `sk-proj-...` |

**Local Development:**
Create a file named `.env` in the `backend/` directory with the following content:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Vercel Deployment:**
Add `OPENAI_API_KEY` to the Environment Variables settings in your Vercel project for the backend service.

---

## Frontend (Next.js)

These variables are needed for the Next.js frontend (`frontend/`).

| Variable Name | Description | Default (Local) | Production Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The URL of your backend API. | `http://localhost:8000` | `https://your-backend-url.vercel.app` |

**Local Development:**
You can create a `.env.local` file in the `frontend/` directory, but it is optional as the code defaults to localhost.
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Vercel Deployment:**
Add `NEXT_PUBLIC_API_URL` to the Environment Variables settings in your Vercel project for the frontend. Set it to the URL where your backend is deployed.
