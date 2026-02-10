from http.server import BaseHTTPRequestHandler
import json
import os
import uuid
import yt_dlp
from openai import OpenAI

# OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def cleanup_file(path: str):
    if os.path.exists(path):
        os.remove(path)

def download_audio_with_info(video_url: str) -> tuple:
    """Downloads audio from URL without FFmpeg and returns (file_path, video_title)."""
    temp_id = str(uuid.uuid4())
    temp_dir = "/tmp"

    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
        'outtmpl': f'{temp_dir}/temp_{temp_id}.%(ext)s',
        'quiet': True,
        'no_warnings': True,
    }

    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(video_url, download=False)
        title = info.get('title', 'Untitled Video')

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    files = [f for f in os.listdir(temp_dir) if f.startswith(f"temp_{temp_id}")]
    if not files:
        raise Exception("Download failed, audio file not found.")

    audio_path = os.path.join(temp_dir, files[0])
    return audio_path, title

def transcribe_audio_openai(audio_path: str) -> dict:
    """Transcribes audio using OpenAI Whisper API."""
    import re

    with open(audio_path, "rb") as audio_file:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json"
        )

    segments = []
    for seg in getattr(result, 'segments', []) or []:
        segments.append({
            "start": round(getattr(seg, 'start', 0), 2),
            "end": round(getattr(seg, 'end', 0), 2),
            "text": getattr(seg, 'text', "").strip()
        })

    full_text = result.text.strip() if hasattr(result, 'text') else ""

    paragraphs = []
    current_para = []
    last_end = 0

    for seg in segments:
        current_para.append(seg["text"])
        if seg["end"] - last_end > 15 or (seg["text"] and seg["text"][-1] in '.!?'):
            paragraphs.append(" ".join(current_para))
            current_para = []
            last_end = seg["end"]

    if current_para:
        paragraphs.append(" ".join(current_para))

    if not paragraphs and full_text:
        sentences = re.split(r'(?<=[.!?])\s+', full_text)
        for i in range(0, len(sentences), 3):
            paragraphs.append(" ".join(sentences[i:i+3]))

    return {
        "full_text": full_text,
        "paragraphs": paragraphs,
        "segments": segments
    }

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            urls = data.get('urls', [])
            if not urls:
                self.send_error_response(400, "URLs list is empty")
                return

            results = []
            for url in urls:
                audio_path = None
                try:
                    audio_path, title = download_audio_with_info(url)
                    result = transcribe_audio_openai(audio_path)
                    cleanup_file(audio_path)
                    results.append({
                        "url": url,
                        "title": title,
                        "success": True,
                        **result
                    })
                except Exception as e:
                    if audio_path:
                        cleanup_file(audio_path)
                    results.append({
                        "url": url,
                        "title": "Error",
                        "success": False,
                        "error": str(e)
                    })

            self.send_json_response(200, {"results": results})

        except Exception as e:
            self.send_error_response(500, str(e))

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"detail": message}).encode())
