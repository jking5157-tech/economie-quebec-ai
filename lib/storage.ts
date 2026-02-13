import AsyncStorage from "@react-native-async-storage/async-storage";

// Types pour les données stockées
export interface ScannedDocument {
  id: string;
  type: "facture" | "releve-bancaire" | "carte-credit";
  date: string;
  status: "analysé" | "en cours" | "erreur";
  imageUri?: string;
  extractedData?: {
    amount?: number;
    vendor?: string;
    category?: string;
    items?: Array<{ name: string; price: number }>;
  };
}

export interface Suggestion {
  id: string;
  category: "impots" | "cellulaire" | "epicerie" | "services" | "energie";
  title: string;
  description: string;
  savings: number;
  status: "active" | "appliquee" | "ignoree";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UserPreferences {
  region: string;
  savingsGoal: number; // Pourcentage (0.1 = 10%)
  monthlyIncome: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
  onboardingCompleted?: boolean;
  userName?: string; // Nom de l'utilisateur
}

export interface BudgetCategory {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

// Clés de stockage
const STORAGE_KEYS = {
  DOCUMENTS: "@economie_quebec/documents",
  SUGGESTIONS: "@economie_quebec/suggestions",
  CHAT_HISTORY: "@economie_quebec/chat_history",
  PREFERENCES: "@economie_quebec/preferences",
  BUDGET_CATEGORIES: "@economie_quebec/budget_categories",
  TOTAL_SAVINGS: "@economie_quebec/total_savings",
};

// Service de stockage
export const StorageService = {
  // Documents
  async getDocuments(): Promise<ScannedDocument[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  },

  async saveDocuments(documents: ScannedDocument[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error("Error saving documents:", error);
    }
  },

  async addDocument(document: ScannedDocument): Promise<void> {
    const documents = await this.getDocuments();
    documents.unshift(document); // Ajouter au début
    await this.saveDocuments(documents);
  },

  // Suggestions
  async getSuggestions(): Promise<Suggestion[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading suggestions:", error);
      return [];
    }
  },

  async saveSuggestions(suggestions: Suggestion[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
    } catch (error) {
      console.error("Error saving suggestions:", error);
    }
  },

  async updateSuggestionStatus(
    id: string,
    status: "active" | "appliquee" | "ignoree"
  ): Promise<void> {
    const suggestions = await this.getSuggestions();
    const updated = suggestions.map((s) => (s.id === id ? { ...s, status } : s));
    await this.saveSuggestions(updated);
  },

  // Historique de chat
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Convertir les timestamps en objets Date
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  },

  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  },

  async addChatMessage(message: ChatMessage): Promise<void> {
    const history = await this.getChatHistory();
    history.push(message);
    await this.saveChatHistory(history);
  },

  async clearChatHistory(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  // Préférences utilisateur
  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!data) {
        // Valeurs par défaut
        return {
          region: "Montréal",
          savingsGoal: 0.1,
          monthlyIncome: 3500,
          notificationsEnabled: true,
          darkMode: false,
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading preferences:", error);
      return {
        region: "Montréal",
        savingsGoal: 0.1,
        monthlyIncome: 3500,
        notificationsEnabled: true,
        darkMode: false,
      };
    }
  },

  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  },

  async updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> {
    const prefs = await this.getPreferences();
    prefs[key] = value;
    await this.savePreferences(prefs);
  },

  // Budget
  async getBudgetCategories(): Promise<BudgetCategory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET_CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading budget categories:", error);
      return [];
    }
  },

  async saveBudgetCategories(categories: BudgetCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving budget categories:", error);
    }
  },

  // Total des économies
  async getTotalSavings(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_SAVINGS);
      return data ? parseFloat(data) : 0;
    } catch (error) {
      console.error("Error loading total savings:", error);
      return 0;
    }
  },

  async saveTotalSavings(amount: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_SAVINGS, amount.toString());
    } catch (error) {
      console.error("Error saving total savings:", error);
    }
  },

  async addToTotalSavings(amount: number): Promise<void> {
    const current = await this.getTotalSavings();
    await this.saveTotalSavings(current + amount);
  },

  // Initialisation avec données de démonstration
  async initializeDemoData(): Promise<void> {
    const documents = await this.getDocuments();
    const suggestions = await this.getSuggestions();

    // Initialiser seulement si vide
    if (documents.length === 0) {
      const demoDocuments: ScannedDocument[] = [
        {
          id: "1",
          type: "facture",
          date: "2026-02-05",
          status: "analysé",
          extractedData: {
            amount: 85,
            vendor: "Vidéotron",
            category: "cellulaire",
          },
        },
        {
          id: "2",
          type: "releve-bancaire",
          date: "2026-02-03",
          status: "analysé",
        },
        {
          id: "3",
          type: "carte-credit",
          date: "2026-02-01",
          status: "analysé",
        },
      ];
      await this.saveDocuments(demoDocuments);
    }

    if (suggestions.length === 0) {
      const demoSuggestions: Suggestion[] = [
        {
          id: "1",
          category: "cellulaire",
          title: "Forfait cellulaire moins cher",
          description: "Économisez en passant de Vidéotron à Fizz avec un forfait similaire",
          savings: 35,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          category: "impots",
          title: "Crédit d'impôt pour transport en commun",
          description: "Réclamez vos frais de transport en commun pour 2025",
          savings: 180,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          category: "epicerie",
          title: "Optimisez vos achats d'épicerie",
          description: "Maxi offre des prix 15% moins chers sur vos produits habituels",
          savings: 45,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          category: "energie",
          title: "Réduisez votre facture d'électricité",
          description: "Passez aux heures creuses pour économiser sur Hydro-Québec",
          savings: 25,
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ];
      await this.saveSuggestions(demoSuggestions);
    }
  },

  // Effacer toutes les données
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  },
};
