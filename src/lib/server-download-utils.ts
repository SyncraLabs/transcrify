import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

// Helper to convert stream to buffer
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

// Platform detection
export type Platform = "youtube" | "instagram" | "tiktok" | "other";

export function detectPlatform(url: string): Platform {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("tiktok.com")) return "tiktok";
    return "other";
}

// Cobalt API Interface
interface CobaltResponse {
    status: "stream" | "redirect" | "picker" | "error";
    url?: string;
    text?: string;
    picker?: any[];
}

export async function downloadWithCobalt(url: string): Promise<{ buffer: Buffer; filename: string }> {
    try {
        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                url: url,
                filenamePattern: "classic",
                aFormat: "mp3",
                isAudioOnly: true
            })
        });

        const data = await response.json() as CobaltResponse;

        if (data.status === "error" || !data.url) {
            throw new Error(data.text || "Cobalt API failed to process URL");
        }

        // Download the actual file from the URL provided by Cobalt
        const fileResponse = await fetch(data.url);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download file from Cobalt: ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Try to get filename from Content-Disposition header or fallback
        const contentDisposition = fileResponse.headers.get("content-disposition");
        let filename = "audio.mp3";
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
                filename = match[1];
            }
        }

        return { buffer, filename };

    } catch (error: any) {
        console.error("Cobalt download error:", error);
        throw new Error(`Cobalt download failed: ${error.message}`);
    }
}

export async function getVideoInfo(url: string) {
    try {
        // Try ytdl first for YouTube as it's faster for info
        if (detectPlatform(url) === "youtube") {
            const info = await ytdl.getBasicInfo(url);
            return {
                title: info.videoDetails.title,
                duration: parseInt(info.videoDetails.lengthSeconds),
            };
        }

        // For others, we might need a different strategy or just use a generic title
        // Cobalt doesn't always return metadata in the first step without processing
        return {
            title: `Download from ${detectPlatform(url)}`,
            duration: 0,
        };
    } catch (e) {
        return {
            title: "Unknown Video",
            duration: 0
        };
    }
}

export async function downloadAudio(url: string): Promise<{ buffer: Buffer; filename: string }> {
    const platform = detectPlatform(url);

    if (platform === "youtube") {
        try {
            console.log("Attempting download with ytdl-core...");
            // Use ytdl-core to get info for filename
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // Download audio stream
            const stream = ytdl(url, {
                filter: "audioonly",
                quality: "lowestaudio",
            });

            const buffer = await streamToBuffer(stream as unknown as Readable);
            return { buffer, filename: `${title}.mp3` };
        } catch (error) {
            console.warn("ytdl-core failed, falling back to Cobalt:", error);
            // Fallback to cobalt
        }
    }

    // Default to Cobalt for everything else (or fallback)
    console.log(`Attempting download with Cobalt for ${platform}...`);
    return await downloadWithCobalt(url);
}
