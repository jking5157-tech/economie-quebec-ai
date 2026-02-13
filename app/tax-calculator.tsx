import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { StorageService } from "@/lib/storage";

export default function TaxCalculatorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [income, setIncome] = useState("");
  const [hasChildren, setHasChildren] = useState(false);
  const [usesPublicTransport, setUsesPublicTransport] = useState(false);
  const [hasChildcareCosts, setHasChildcareCosts] = useState(false);
  const [region, setRegion] = useState("Montréal");
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const calculateMutation = trpc.ai.calculateTaxCredits.useMutation();

  const handleCalculate = async () => {
    if (!income || parseFloat(income) <= 0) {
      alert("Veuillez entrer un revenu valide");
      return;
    }

    setIsCalculating(true);
    try {
      const prefs = await StorageService.getPreferences();
      const result = await calculateMutation.mutateAsync({
        income: parseFloat(income),
        hasChildren,
        usesPublicTransport,
        hasChildcareCosts,
        region: prefs.region,
      });

      setResults(result);
    } catch (error) {
      console.error("Error calculating tax credits:", error);
      alert("Erreur lors du calcul des crédits d'impôt");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Crédits d'impôt</Text>
              <Text className="text-sm text-muted">Calculateur québécois</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View className="gap-4">
            {/* Revenu annuel */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Revenu annuel ($)</Text>
              <TextInput
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                placeholder="Ex: 50000"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Options */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground flex-1">J'ai des enfants</Text>
                <Switch
                  value={hasChildren}
                  onValueChange={setHasChildren}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground flex-1">
                  J'utilise le transport en commun
                </Text>
                <Switch
                  value={usesPublicTransport}
                  onValueChange={setUsesPublicTransport}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground flex-1">
                  J'ai des frais de garde d'enfants
                </Text>
                <Switch
                  value={hasChildcareCosts}
                  onValueChange={setHasChildcareCosts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Bouton calculer */}
            <TouchableOpacity
              onPress={handleCalculate}
              disabled={isCalculating}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                opacity: isCalculating ? 0.6 : 1,
              }}
            >
              <Text className="text-lg font-semibold text-white">
                {isCalculating ? "Calcul en cours..." : "Calculer mes crédits"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Résultats */}
          {results && (
            <View className="gap-4">
              <View
                style={{
                  backgroundColor: colors.success + "20",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: colors.success,
                }}
              >
                <Text className="text-sm text-muted mb-2">Total estimé des crédits</Text>
                <Text className="text-4xl font-bold" style={{ color: colors.success }}>
                  {results.totalAmount || 0} $
                </Text>
              </View>

              <Text className="text-sm font-semibold text-foreground">Détails des crédits</Text>

              {results.credits && results.credits.length > 0 ? (
                results.credits.map((credit: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: 8,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-foreground flex-1">
                        {credit.name}
                      </Text>
                      <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                        {credit.amount} $
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">{credit.description}</Text>
                    <View
                      style={{
                        backgroundColor: colors.primary + "10",
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 4,
                      }}
                    >
                      <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                        💡 {credit.howToClaim}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted text-center">
                  Aucun crédit disponible selon votre profil
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
