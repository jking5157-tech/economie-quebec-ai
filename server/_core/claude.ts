// Claude API client for document analysis with vision
// Uses Anthropic's Claude 3.5 Sonnet model

export type ClaudeMessage = {
    role: "user" | "assistant";
    content: string | Array<{
        type: "text" | "image";
        text?: string;
        source?: {
            type: "base64" | "url";
            media_type: string;
            data?: string;
            url?: string;
        };
    }>;
};

export type ClaudeResponse = {
    id: string;
    type: "message";
    role: "assistant";
    content: Array<{
        type: "text";
        text: string;
    }>;
    model: string;
    stop_reason: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
};

/**
 * Call Claude API with vision support
 */
export async function callClaude(params: {
    messages: ClaudeMessage[];
    system?: string;
    maxTokens?: number;
}): Promise<ClaudeResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not configured in .env");
    }

    const payload = {
        model: "claude-3-haiku-20240307", // Using Haiku
        max_tokens: params.maxTokens || 4096,
        messages: params.messages,
        ...(params.system ? { system: params.system } : {}),
    };

    const apiUrl = "https://api.anthropic.com/v1/messages";
    console.log("🤖 [Claude] Calling API:", apiUrl);
    console.log("🤖 [Claude] Model:", payload.model);

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [Claude] API Error:", errorText);
        throw new Error(`Claude API failed: ${response.status} ${response.statusText} – ${errorText}`);
    }

    const result = await response.json() as ClaudeResponse;
    console.log("✅ [Claude] Response received, tokens:", result.usage);

    return result;
}

/**
 * Helper to download image from URL and convert to base64
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<{ base64: string; mediaType: string; buffer: Buffer }> {
    console.log("📥 [Claude] Downloading image:", imageUrl);

    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Detect media type from response headers or URL
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mediaType = contentType.split(";")[0].trim();

    console.log("✅ [Claude] Image downloaded, size:", buffer.length, "bytes, type:", mediaType);

    return { base64, mediaType, buffer };
}
