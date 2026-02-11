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

    if (paragraphs.length === 0 && fullText) {
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < sentences.length; i += 3) {
            paragraphs.push(sentences.slice(i, i + 3).join(" "));
        }
    }

    return { full_text: fullText, paragraphs, segments };
}

async function processUrl(url: string) {
    try {
        const info = await getVideoInfo(url);
        const audioBuffer = await downloadAudio(url);
        const result = await transcribeAudio(audioBuffer, `${info.title}.webm`);

        return {
            url,
            title: info.title,
            success: true,
            ...result,
        };
    } catch (error: any) {
        return {
            url,
            title: "Error",
            success: false,
            error: error.message || "Failed to transcribe",
        };
    }
}

export async function POST(request: NextRequest) {
    // Apply middleware (auth + rate limiting)
    const middleware = apiMiddleware(request);
    if (!middleware.ok) {
        return middleware.error;
    }

    try {
        const body = await request.json();
        const { urls, webhook_url, webhook_secret } = body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json(
                { error: "URLs array is required and must not be empty" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Limit batch size to prevent abuse
        const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE || "10");
        if (urls.length > maxBatchSize) {
            return NextResponse.json(
                { error: `Batch size exceeds maximum of ${maxBatchSize}` },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Process URLs sequentially to avoid overwhelming the API
        const results = [];
        for (const url of urls) {
            const result = await processUrl(url);
            results.push(result);
        }

        const responseData = {
            success: true,
            total: urls.length,
            completed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };

        // Send webhook if provided
        if (webhook_url) {
            const webhookResult = await sendWebhook(
                webhook_url,
                {
                    event: "batch_transcription.completed",
                    timestamp: new Date().toISOString(),
                    data: responseData,
                },
                webhook_secret
            );

            if (!webhookResult.success) {
                console.error("Webhook failed:", webhookResult.error);
            }
        }

        return NextResponse.json(responseData, { headers: corsHeaders() });
    } catch (error: any) {
        console.error("Batch transcription error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to process batch",
            },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function OPTIONS() {
    return optionsResponse();
}
