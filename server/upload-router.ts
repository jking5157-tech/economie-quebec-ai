import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

/**
 * Router pour gérer l'upload de fichiers vers S3
 */
export const uploadRouter = router({
  /**
   * Upload une image encodée en base64 vers S3
   * Retourne l'URL publique de l'image
   */
  uploadImage: publicProcedure
    .input(
      z.object({
        base64Data: z.string(), // Image en base64 (sans le préfixe data:image/...)
        fileName: z.string().optional(),
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Convertir base64 en Buffer
        const buffer = Buffer.from(input.base64Data, "base64");

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = input.fileName || `document-${timestamp}.jpg`;

        // Le key ne doit PAS inclure "uploads/" car storage.ts l'ajoute déjà
        // Avant: key = "uploads/document.jpg" → uploads/uploads/document.jpg ❌
        // Après: key = "document.jpg" → uploads/document.jpg ✅
        const key = fileName;

        console.log("📤 [Upload] Uploading file:", fileName);

        // Upload vers storage (local ou Forge)
        const result = await storagePut(key, buffer, input.contentType);

        console.log("✅ [Upload] Success! URL:", result.url);

        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      } catch (error) {
        console.error("❌ [Upload] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erreur lors de l'upload",
        };
      }
    }),
});
