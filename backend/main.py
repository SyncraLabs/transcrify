from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import yt_dlp
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI Client
from dotenv import load_dotenv

load_dotenv()

# OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TranscribeRequest(BaseModel):
    url: str

class BatchTranscribeRequest(BaseModel):
    urls: List[str]

def cleanup_file(path: str):
    if os.path.exists(path):
        os.remove(path)

def download_audio_with_info(video_url: str) -> tuple[str, str]:
    """Downloads audio from URL and returns (file_path, video_title)."""
    temp_id = str(uuid.uuid4())
    audio_path = f"temp_{temp_id}.mp3"

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': f"temp_{temp_id}.%(ext)s",
        'quiet': True,
    }

    print(f"Downloading audio from {video_url}...")
    
    # Get video info first
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(video_url, download=False)
        title = info.get('title', 'Untitled Video')
    
    # Download audio
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    # Verify file existence
    if not os.path.exists(audio_path):
        files = [f for f in os.listdir('.') if f.startswith(f"temp_{temp_id}")]
        if files:
            audio_path = files[0]
        else:
            raise Exception("Download failed, audio file not found.")
    
    return audio_path, title

def transcribe_audio_openai(audio_path: str) -> dict:
    """Transcribes audio using OpenAI Whisper API and returns structured segments."""
    print(f"Transcribing {audio_path} with OpenAI Whisper API...")
    
    with open(audio_path, "rb") as audio_file:
        # Use verbose_json to get segments with timestamps
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json"
        )
    
    # Extract segments for structured output
    segments = []
    for seg in getattr(result, 'segments', []) or []:
        # OpenAI returns TranscriptionSegment objects with attributes, not dicts
        segments.append({
            "start": round(getattr(seg, 'start', 0), 2),
            "end": round(getattr(seg, 'end', 0), 2),
            "text": getattr(seg, 'text', "").strip()
        })
    
    full_text = result.text.strip() if hasattr(result, 'text') else ""
    
    # Create paragraph-formatted text
    paragraphs = []
    current_para = []
    last_end = 0
    
    for seg in segments:
        current_para.append(seg["text"])
        # Create new paragraph every ~15 seconds or after a sentence ends
        if seg["end"] - last_end > 15 or (seg["text"] and seg["text"][-1] in '.!?'):
            paragraphs.append(" ".join(current_para))
            current_para = []
            last_end = seg["end"]
    
    if current_para:
        paragraphs.append(" ".join(current_para))
    
    # If no segments, just split by sentences
    if not paragraphs and full_text:
        import re
        sentences = re.split(r'(?<=[.!?])\s+', full_text)
        # Group into paragraphs of ~3 sentences
        for i in range(0, len(sentences), 3):
            paragraphs.append(" ".join(sentences[i:i+3]))
    
    return {
        "full_text": full_text,
        "paragraphs": paragraphs,
        "segments": segments
    }

@app.post("/transcribe")
def transcribe_video(request: TranscribeRequest):
    video_url = request.url
    if not video_url:
        raise HTTPException(status_code=400, detail="URL is required")

    audio_path = None
    try:
        audio_path, title = download_audio_with_info(video_url)
        result = transcribe_audio_openai(audio_path)
        cleanup_file(audio_path)
        return {
            "title": title,
            **result
        }

    except Exception as e:
        if audio_path:
            cleanup_file(audio_path)
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe/batch")
def transcribe_batch(request: BatchTranscribeRequest):
    """Process multiple URLs and return all transcriptions."""
    if not request.urls:
        raise HTTPException(status_code=400, detail="URLs list is empty")
    
    results = []
    for url in request.urls:
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
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
