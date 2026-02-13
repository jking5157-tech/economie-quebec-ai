// Storage system with automatic fallback to local filesystem
// Uses Forge storage if configured, otherwise saves to local uploads/ directory

import { ENV } from "./_core/env";
import * as fs from "fs";
import * as path from "path";

type StorageConfig = { baseUrl: string; apiKey: string };

// Détecter si les clés Forge sont configurées
function hasForgeConfig(): boolean {
  return !!(ENV.forgeApiUrl && ENV.forgeApiKey);
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(baseUrl: string, relKey: string, apiKey: string): Promise<string> {
  const downloadApiUrl = new URL("v1/storage/downloadUrl", ensureTrailingSlash(baseUrl));
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string,
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

// ========== LOCAL STORAGE FALLBACK ==========

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensure the uploads directory exists
 */
function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log("📁 [Storage] Created uploads directory:", UPLOADS_DIR);
  }
}

/**
 * Get the base URL for the server
 * Used to construct complete URLs for local storage
 */
function getBaseUrl(): string {
  // Try to get from environment
  const host = process.env.HOST || "localhost";
  const port = process.env.PORT || "3000";
  return `http://${host}:${port}`;
}

/**
 * Save file to local filesystem
 */
async function saveToLocal(
  relKey: string,
  data: Buffer | Uint8Array | string,
): Promise<{ key: string; url: string }> {
  ensureUploadsDir();

  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOADS_DIR, key);

  // Create subdirectories if needed
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Convert data to Buffer if needed
  const buffer = typeof data === "string"
    ? Buffer.from(data)
    : data instanceof Uint8Array
      ? Buffer.from(data)
      : data;

  // Write file
  fs.writeFileSync(filePath, buffer);

  // Generate complete URL (required for Zod validation)
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/uploads/${key}`;

  console.log("💾 [Storage] Saved to local filesystem:", filePath);
  console.log("🔗 [Storage] Public URL:", url);
  return { key, url };
}

/**
 * Get local file URL
 */
async function getFromLocal(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/uploads/${key}`;
  return { key, url };
}

// ========== PUBLIC API ==========

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // Use local storage if Forge is not configured
  if (!hasForgeConfig()) {
    console.log("📦 [Storage] Using local filesystem (Forge not configured)");
    return saveToLocal(relKey, data);
  }

  // Use Forge storage
  console.log("☁️ [Storage] Using Forge storage");
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`,
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  // Use local storage if Forge is not configured
  if (!hasForgeConfig()) {
    return getFromLocal(relKey);
  }

  // Use Forge storage
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
