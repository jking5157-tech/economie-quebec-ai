import { useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";

/**
 * Hook pour initialiser l'application au démarrage
 * Charge les données de démonstration si nécessaire
 */
export function useAppInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Initialiser les données de démonstration si nécessaire
      await StorageService.initializeDemoData();
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing app:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isInitialized, isLoading };
}
