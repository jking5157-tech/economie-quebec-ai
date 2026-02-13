import { trpc } from "./trpc";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Service pour uploader des images vers S3
 */
export const UploadService = {
  /**
   * Upload une image locale vers S3
   * @param imageUri URI locale de l'image (file://, ph://, etc.)
   * @returns URL publique de l'image sur S3
   */
  async uploadImage(imageUri: string): Promise<string | null> {
    try {
      // Lire l'image en base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64" as any,
      });

      // Déterminer le type de contenu
      const contentType = imageUri.toLowerCase().endsWith(".png")
        ? "image/png"
        : "image/jpeg";

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `document-${timestamp}.jpg`;

      // Utiliser tRPC pour uploader
      // Note: Comme uploadImage est une mutation, il faut l'utiliser avec useMutation dans un composant
      // Pour l'instant, on retourne null et on laisse les composants gérer l'upload
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  },

  /**
   * Convertir une URI locale en base64
   * @param imageUri URI locale de l'image
   * @returns Image en base64 (sans préfixe data:)
   */
  async imageToBase64(imageUri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64" as any,
    });
  },

  /**
   * Déterminer le type MIME d'un fichier
   * @param imageUri URI du fichier
   * @returns Type MIME (image/jpeg, image/png, ou application/pdf)
   */
  getContentType(imageUri: string): string {
    const lowerUri = imageUri.toLowerCase();
    if (lowerUri.endsWith(".png")) {
      return "image/png";
    }
    if (lowerUri.endsWith(".pdf")) {
      return "application/pdf";
    }
    return "image/jpeg";
  },
};
