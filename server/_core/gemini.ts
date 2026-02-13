import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callGemini(params: {
    messages: any[];
    systemPrompt?: string;
}) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: params.systemPrompt
    });

    const lastMessage = params.messages[params.messages.length - 1];

    // Detection du type de fichier (PDF ou Image)
    const isPDF = lastMessage.content[1].source.media_type === 'application/pdf' ||
        lastMessage.content[1].source.data.startsWith('JVBER'); // Signature base64 du PDF (%PDF)

    const mimeType = isPDF ? 'application/pdf' : lastMessage.content[1].source.media_type;

    console.log(`📄 [Gemini] Model: gemini-1.5-flash | FileType: ${mimeType}`);

    // Ensure content matches expected [text, media] structure
    // We expect content[0] to be text prompt and content[1] to be media
    const result = await model.generateContent([
        lastMessage.content[0].text,
        {
            inlineData: {
                data: lastMessage.content[1].source.data,
                mimeType: mimeType
            }
        }
    ]);

    const text = result.response.text();

    // 1. Nettoyage du Markdown (User requested logic)
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Trouver le VRAI début et la VRAIE fin du JSON
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    // 3. Tenter de lire le JSON nettoyé
    try {
        const data = JSON.parse(cleanText);
        // On retourne l'objet sous forme de string pour que routers.ts puisse le re-parser sans erreur
        return { content: [{ text: JSON.stringify(data) }] };
    } catch (e) {
        console.error("🔥 Échec lecture JSON PDF:", cleanText);
        throw new Error("Le PDF a été lu mais le format est invalide.");
    }
}

/**
 * Helper to download image from URL and convert to base64
 * (Moved from claude.ts)
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<{ base64: string; mediaType: string; buffer: Buffer }> {
    console.log("📥 [Gemini] Downloading file:", imageUrl);

    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Detect media type from response headers or URL
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mediaType = contentType.split(";")[0].trim();

    console.log("✅ [Gemini] File downloaded, size:", buffer.length, "bytes, type:", mediaType);

    return { base64, mediaType, buffer };
}
