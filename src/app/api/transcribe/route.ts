import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";
import { apiMiddleware, sendWebhook, optionsResponse, corsHeaders } from "@/lib/api-utils";

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
    console.log("----------------------------------------------------------------");
    console.log("API: POST /api/transcribe called");
    console.log("----------------------------------------------------------------");

    // Apply middleware (auth + rate limiting)
    const middleware = apiMiddleware(request);
    if (!middleware.ok) {
        console.log("API: Middleware failed", middleware.error);
        return middleware.error;
    }

    try {
        const body = await request.json();
        console.log("API: Body parsed", body);
        const { url, webhook_url, webhook_secret } = body;

        if (!url) {
            console.log("API: No URL provided");
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Get video info
        console.log("API: Getting video info for", url);
        const info = await getVideoInfo(url);
        console.log("API: Video info retrieved", info.title);

        // Download audio
        console.log("API: Downloading audio...");
        const audioBuffer = await downloadAudio(url);
        console.log("API: Audio downloaded, size:", audioBuffer.length);

        // Transcribe
        console.log("API: Transcribing...");
        const result = await transcribeAudio(audioBuffer, `${info.title}.webm`);
        console.log("API: Transcription complete");

        const responseData = {
            success: true,
            title: info.title,
            url,
            ...result,
        };

        // Send webhook if provided
        if (webhook_url) {
            console.log("API: Sending webhook to", webhook_url);
            const webhookResult = await sendWebhook(
                webhook_url,
                {
                    event: "transcription.completed",
                    timestamp: new Date().toISOString(),
                    data: responseData,
                },
                webhook_secret
            );

            if (!webhookResult.success) {
                console.error("Webhook failed:", webhookResult.error);
            } else {
                console.log("API: Webhook sent successfully");
            }
        }

        return NextResponse.json(responseData, { headers: corsHeaders() });
    } catch (error: any) {
        console.error("Transcription error:", error);

        const errorResponse = {
            success: false,
            error: error.message || "Failed to transcribe",
        };

        return NextResponse.json(errorResponse, {
            status: 500,
            headers: corsHeaders(),
        });
    }
}

export async function GET() {
    return NextResponse.json(
        {
            message: "Transcrify API is running.",
            instruction: "Send a POST request with { url: '...' } to transcribe video."
        },
        { status: 200, headers: corsHeaders() }
    );
}

export async function OPTIONS() {
    return optionsResponse();
}
