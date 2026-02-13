// Note: Ce service doit être utilisé avec les hooks tRPC dans les composants React
// Exemple: const mutation = trpc.ai.analyzeDocument.useMutation();
// puis: await mutation.mutateAsync({ imageUrl, documentType });

export interface DocumentAnalysisResult {
  success: boolean;
  extractedData?: {
    amount?: number;
    vendor?: string;
    category?: string;
    date?: string;
    items?: Array<{ name: string; price: number }>;
  };
  suggestions?: Array<{
    category: "impots" | "cellulaire" | "epicerie" | "services" | "energie";
    title: string;
    description: string;
    savings: number;
  }>;
  error?: string;
}

export interface ChatResponse {
  content: string;
  suggestions?: string[];
}

/**
 * Service pour interagir avec l'API AI du backend
 */
export const AIService = {
  /**
   * Analyser un document (facture, relevé bancaire, etc.)
   * @param imageUrl URL publique de l'image du document
   * @param documentType Type de document à analyser
   */
  // Cette fonction est un exemple - utilisez trpc.ai.analyzeDocument.useMutation() dans vos composants
  analyzeDocument: null as any,

  /**
   * Générer des suggestions d'économies basées sur les données utilisateur
   * @param userContext Contexte financier de l'utilisateur
   */
  generateSuggestions: null as any,

  /**
   * Discuter avec l'assistant AI
   * @param message Message de l'utilisateur
   * @param context Contexte financier pour des réponses personnalisées
   */
  chat: null as any,

  /**
   * Analyser une facture d'électricité Hydro-Québec
   * @param imageUrl URL de l'image de la facture
   */
  analyzeHydroQuebecBill: null as any,

  /**
   * Calculer les crédits d'impôt québécois disponibles
   * @param taxData Données fiscales de l'utilisateur
   */
  calculateTaxCredits: null as any,
};
