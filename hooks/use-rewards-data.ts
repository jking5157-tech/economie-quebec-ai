import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

/**
 * Hook pour soumettre des données anonymisées au programme de récompenses.
 * 
 * Logique conditionnelle (Loi 25 Québec) :
 * - SI consent_given == TRUE : hache les infos (SHA-256), garde montant/catégorie/ville
 * - SI consent_given == FALSE : ne fait rien
 * 
 * Utilisation :
 * ```tsx
 * const { submitTransaction } = useRewardsData();
 * await submitTransaction({ amount: "45.99", category: "épicerie", city: "Montréal" });
 * ```
 */
export function useRewardsData() {
  const { isAuthenticated } = useAuth();
  const submitMutation = trpc.rewards.submitData.useMutation();
  const consentQuery = trpc.rewards.getConsent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  /**
   * Soumet une transaction pour anonymisation et points récompenses.
   * Ne fait rien si le consentement n'est pas actif.
   * Le backend vérifie aussi le consentement (double vérification).
   */
  const submitTransaction = useCallback(
    async (data: { amount: string; category: string; city: string; inventory?: any[] }) => {
      // Vérification côté client
      if (!isAuthenticated) return { submitted: false, reason: "Non authentifié" };
      if (!consentQuery.data?.consentGiven) return { submitted: false, reason: "Consentement non donné" };

      try {
        // Le backend re-vérifie le consentement, hache le userId en SHA-256,
        // et ne conserve que montant, catégorie et ville
        const result = await submitMutation.mutateAsync({ ...data, inventory: data.inventory || [] });
        return { submitted: true, ...result };
      } catch (error) {
        console.error("Erreur lors de la soumission des données anonymisées:", error);
        return { submitted: false, reason: "Erreur technique" };
      }
    },
    [isAuthenticated, consentQuery.data, submitMutation]
  );

  return {
    submitTransaction,
    isConsentActive: consentQuery.data?.consentGiven ?? false,
    rewardPoints: consentQuery.data?.rewardPoints ?? 0,
    isLoading: submitMutation.isPending,
  };
}
