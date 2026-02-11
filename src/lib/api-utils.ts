import { NextRequest, NextResponse } from "next/server";

// ============================================
// API Key Authentication
// ============================================

const API_KEYS = new Set(
    (process.env.API_KEYS || "").split(",").filter(Boolean)
);

export function validateApiKey(request: NextRequest): { valid: boolean; error?: NextResponse } {
    // If no API keys configured, allow all requests (development mode)
    if (API_KEYS.size === 0) {
        return { valid: true };
    }

    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
        return {
            valid: false,
            error: NextResponse.json(
                { error: "Missing API key. Include 'x-api-key' header." },
                { status: 401 }
            ),
        };
    }

    if (!API_KEYS.has(apiKey)) {
        return {
            valid: false,
            error: NextResponse.json(
                { error: "Invalid API key." },
                { status: 403 }
            ),
        };
    }

    return { valid: true };
}

// ============================================
// Rate Limiting (In-Memory)
// ============================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX || "10");

function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; error?: NextResponse; remaining: number } {
    // Cleanup old entries periodically
    if (Math.random() < 0.1) cleanupExpiredEntries();

    // Use API key or IP as identifier
    const apiKey = request.headers.get("x-api-key");
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const identifier = apiKey || ip;

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        // New window
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
    }

    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            error: NextResponse.json(
                {
                    error: "Rate limit exceeded. Try again later.",
                    retry_after_seconds: retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": retryAfter.toString(),
                        "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
                    },
                }
            ),
        };
    }

    entry.count++;
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

// ============================================
// Webhook Notification
// ============================================

export async function sendWebhook(
    webhookUrl: string,
    data: Record<string, unknown>,
    secret?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Add signature if secret is provided
        if (secret) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(JSON.stringify(data))
            );
            const signatureHex = Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
            headers["X-Webhook-Signature"] = `sha256=${signatureHex}`;
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return {
                success: false,
                error: `Webhook returned ${response.status}`
            };
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

// ============================================
// CORS Headers
// ============================================

export function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    };
}

export function optionsResponse() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(),
    });
}

// ============================================
// Combined Middleware
// ============================================

export function apiMiddleware(request: NextRequest): { ok: boolean; error?: NextResponse } {
    // Check API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
        return { ok: false, error: authResult.error };
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
        return { ok: false, error: rateLimitResult.error };
    }

    return { ok: true };
}
