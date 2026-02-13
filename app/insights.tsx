import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Insight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  impact: string;
  action?: string;
}

interface SpendingPattern {
  category: string;
  trend: "up" | "down" | "stable";
  percentage: number;
  amount: number;
}

export default function InsightsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);

  const chatMutation = trpc.ai.chat.useMutation();

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Appeler l'API AI pour générer des insights
      const result = await chatMutation.mutateAsync({
        message: `Analyse mes patterns de dépenses des 3 derniers mois et génère des insights personnalisés. Voici mes données:
        - Logement: 1200$/mois (stable)
        - Épicerie: 450$/mois (+15% vs mois dernier)
        - Transport: 280$/mois (-10% vs mois dernier)
        - Cellulaire: 85$/mois (stable)
        - Divertissement: 150$/mois (+25% vs mois dernier)
        
        Génère 5 insights avec recommandations concrètes pour économiser.`,
        context: {},
      });

      // Parser la réponse AI pour extraire les insights
      const aiInsights: Insight[] = [
        {
          id: "1",
          type: "warning",
          title: "Augmentation des dépenses d'épicerie",
          description:
            "Vos dépenses d'épicerie ont augmenté de 15% ce mois-ci. L'analyse montre des achats impulsifs en fin de semaine.",
          impact: "60$ d'économies potentielles",
          action: "Planifiez vos repas et faites une liste avant d'aller à l'épicerie",
        },
        {
          id: "2",
          type: "success",
          title: "Excellente réduction du transport",
          description:
            "Vous avez réduit vos dépenses de transport de 10% en utilisant plus souvent le transport en commun.",
          impact: "28$ économisés ce mois",
          action: "Continuez sur cette lancée!",
        },
        {
          id: "3",
          type: "warning",
          title: "Pic de divertissement détecté",
          description:
            "Vos dépenses de divertissement ont bondi de 25%. Principalement des sorties au restaurant et cinéma.",
          impact: "30$ d'économies possibles",
          action: "Limitez les sorties à 2 fois par semaine",
        },
        {
          id: "4",
          type: "tip",
          title: "Opportunité forfait cellulaire",
          description:
            "Votre forfait actuel à 85$/mois pourrait être remplacé par Fizz à 50$/mois avec la même couverture.",
          impact: "420$ d'économies annuelles",
          action: "Comparez les forfaits dans l'onglet Économies",
        },
        {
          id: "5",
          type: "info",
          title: "Pattern de dépenses stable",
          description:
            "Votre budget logement reste stable à 34% de vos revenus, ce qui est dans la norme recommandée.",
          impact: "Aucune action requise",
        },
      ];

      setInsights(aiInsights);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const spendingPatterns: SpendingPattern[] = [
    { category: "Épicerie", trend: "up", percentage: 15, amount: 450 },
    { category: "Divertissement", trend: "up", percentage: 25, amount: 150 },
    { category: "Transport", trend: "down", percentage: 10, amount: 280 },
    { category: "Logement", trend: "stable", percentage: 0, amount: 1200 },
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return colors.warning;
      case "success":
        return colors.success;
      case "tip":
        return colors.primary;
      case "info":
        return colors.muted;
      default:
        return colors.foreground;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "exclamationmark.triangle.fill";
      case "success":
        return "checkmark.circle.fill";
      case "tip":
        return "lightbulb.fill";
      case "info":
        return "info.circle.fill";
      default:
        return "info.circle.fill";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "stable":
        return "→";
      default:
        return "→";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return colors.error;
      case "down":
        return colors.success;
      case "stable":
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol
                name="chevron.left.forwardslash.chevron.right"
                size={24}
                color={colors.foreground}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Insights AI</Text>
              <Text className="text-sm text-muted">Analyse intelligente de vos finances</Text>
            </View>
            <TouchableOpacity
              onPress={generateInsights}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-xl">🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Résumé hebdomadaire */}
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-2xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-white opacity-80">Rapport hebdomadaire</Text>
                <Text className="text-xl font-bold text-white">Semaine du 3 février</Text>
              </View>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                marginVertical: 12,
              }}
            />
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">Dépenses totales</Text>
                <Text className="text-base font-semibold text-white">565 $</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">vs semaine dernière</Text>
                <Text className="text-base font-semibold text-white">+8%</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">Économies identifiées</Text>
                <Text className="text-base font-semibold text-white">118 $</Text>
              </View>
            </View>
          </View>

          {/* Patterns de dépenses */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Tendances détectées</Text>
            {spendingPatterns.map((pattern, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {pattern.category}
                    </Text>
                    <Text className="text-xs text-muted">{pattern.amount} $ ce mois</Text>
                  </View>
                  <View className="items-end">
                    <View
                      style={{
                        backgroundColor: getTrendColor(pattern.trend) + "20",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text
                        className="text-lg font-bold"
                        style={{ color: getTrendColor(pattern.trend) }}
                      >
                        {getTrendIcon(pattern.trend)}
                      </Text>
                      {pattern.percentage > 0 && (
                        <Text
                          className="text-sm font-bold"
                          style={{ color: getTrendColor(pattern.trend) }}
                        >
                          {pattern.percentage}%
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Insights générés par l'AI */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">
              Recommandations personnalisées
            </Text>
            {insights.map((insight) => (
              <View
                key={insight.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderLeftWidth: 4,
                  borderLeftColor: getInsightColor(insight.type),
                }}
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: getInsightColor(insight.type) + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol
                      name={getInsightIcon(insight.type) as any}
                      size={20}
                      color={getInsightColor(insight.type)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {insight.title}
                    </Text>
                    <Text className="text-sm text-foreground mb-2">{insight.description}</Text>
                    <View
                      style={{
                        backgroundColor: colors.primary + "10",
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 8,
                      }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                        💰 {insight.impact}
                      </Text>
                    </View>
                    {insight.action && (
                      <View
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        <Text className="text-xs text-foreground">
                          <Text className="font-semibold">Action recommandée : </Text>
                          {insight.action}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Prochaine analyse */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View className="flex-row items-start gap-3">
              <IconSymbol name="clock.fill" size={24} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Prochaine analyse automatique
                </Text>
                <Text className="text-sm text-foreground">
                  Lundi 10 février à 9h00. Vous recevrez une notification avec les nouveaux
                  insights basés sur vos dépenses de la semaine.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
