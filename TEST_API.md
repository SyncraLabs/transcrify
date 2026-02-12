# How to Test the Transcrify API

The Transcrify API is running on **localhost:3000**.

> **Note:** The backend logic has been moved to the Next.js app. There is no separate Python backend to run.

## 1. Prerequisites

- Ensure the server is running (`npm run dev`).
- Ensure you have added your `OPENAI_API_KEY` to `.env.local`.

## 2. API Endpoint

- **URL:** `http://localhost:3000/api/transcribe`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`

## 3. Request Body

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

## 4. Testing with cURL

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://www.youtube.com/watch?v=jNQXAC9IVRw\"}"
```

## Troubleshooting

### "Connection Timed Out" (Firewall Issue)
If you get a timeout when using your local IP (`192.168.1.x`), Windows Firewall is likely blocking the connection from Docker.

**Solution:** Run this command in **PowerShell as Administrator**:
```powershell
netsh advfirewall firewall add rule name="NextJS Port 3000" dir=in action=allow protocol=TCP localport=3000
```

### "Connection Refused" in n8n / Docker
If you are running n8n in Docker, **`localhost` inside n8n refers to the container itself**, not your computer.
- **Solution:** Use your local IP address (e.g., `http://192.168.1.130:3000/api/transcribe`).
- Alternatively, try `http://host.docker.internal:3000/api/transcribe` (requires Docker desktop configuration).

### "Connection Refused" in Browser
This usually means the server is not running or listening on port 3000.
    - Check if the terminal says `Ready in ... ms`.
    - If it says "Port 3000 is in use", it might have started on a different port (e.g., 3001). Check the terminal output.
