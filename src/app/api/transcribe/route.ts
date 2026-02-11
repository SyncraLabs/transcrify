import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

async function getVideoInfo(url: string) {
    const info = await ytdl.getInfo(url);
    return {
        title: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds),
    };
}

async function downloadAudio(url: string): Promise<Buffer> {
    const stream = ytdl(url, {
        filter: "audioonly",
        quality: "lowestaudio",
    });
    return streamToBuffer(stream as unknown as Readable);
}

async function transcribeAudio(audioBuffer: Buffer, filename: string) {
    const uint8Array = new Uint8Array(audioBuffer);
    const file = new File([uint8Array], filename, { type: "audio/webm" });

    const result = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: file,
        response_format: "verbose_json",
    });

    const segments = (result.segments || []).map((seg: any) => ({
        start: Math.round(seg.start * 100) / 100,
        end: Math.round(seg.end * 100) / 100,
        text: seg.text?.trim() || "",
    }));

    const fullText = result.text?.trim() || "";

    // Create paragraphs
    const paragraphs: string[] = [];
    let currentPara: string[] = [];
    let lastEnd = 0;

    for (const seg of segments) {
        currentPara.push(seg.text);
        if (seg.end - lastEnd > 15 || (seg.text && ".!?".includes(seg.text.slice(-1)))) {
            paragraphs.push(currentPara.join(" "));
            currentPara = [];
            lastEnd = seg.end;
        }
    }
    if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(" "));
    }

    // Fallback if no segments
    if (paragraphs.length === 0 && fullText) {
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < sentences.length; i += 3) {
            paragraphs.push(sentences.slice(i, i + 3).join(" "));
        }
    }

    return { full_text: fullText, paragraphs, segments };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ detail: "URL is required" }, { status: 400 });
        }

        // Get video info
        const info = await getVideoInfo(url);

        // Download audio
        const audioBuffer = await downloadAudio(url);

        // Transcribe
        const result = await transcribeAudio(audioBuffer, `${info.title}.webm`);

        return NextResponse.json({
            title: info.title,
            ...result,
        });
    } catch (error: any) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { detail: error.message || "Failed to transcribe" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
