import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { CartesianChart, Line, Bar } from "victory-native";
import { useFont } from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");
const chartWidth = width - 48; // padding 24 de chaque côté

export default function StatsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Données de démonstration pour les graphiques
  const savingsData = [
    { month: "Jan", amount: 120 },
    { month: "Fév", amount: 180 },
    { month: "Mar", amount: 150 },
    { month: "Avr", amount: 220 },
    { month: "Mai", amount: 280 },
    { month: "Juin", amount: 240 },
  ];

  const categoryData = [
    { category: "Logement", amount: 1200, percentage: 34 },
    { category: "Épicerie", amount: 450, percentage: 13 },
    { category: "Transport", amount: 280, percentage: 8 },
    { category: "Autres", amount: 330, percentage: 9 },
  ];

  const progressData = [
    { week: "S1", saved: 50, goal: 87.5 },
    { week: "S2", saved: 120, goal: 87.5 },
    { week: "S3", saved: 180, goal: 87.5 },
    { week: "S4", saved: 280, goal: 87.5 },
  ];

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
              <Text className="text-3xl font-bold text-foreground">Statistiques</Text>
              <Text className="text-sm text-muted">Visualisez vos tendances</Text>
            </View>
          </View>

          {/* Sélecteur de période */}
          <View className="flex-row gap-2">
            {(["week", "month", "year"] as const).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={{
                  backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedPeriod === period ? "#FFFFFF" : colors.foreground,
                  }}
                >
                  {period === "week" ? "Semaine" : period === "month" ? "Mois" : "Année"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Graphique des économies mensuelles */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-base font-semibold text-foreground mb-4">
              Économies mensuelles
            </Text>
            <View style={{ height: 200 }}>
              <CartesianChart
                data={savingsData}
                xKey="month"
                yKeys={["amount"]}
                domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                {({ points, chartBounds }) => (
                  <Line
                    points={points.amount}
                    color={colors.success}
                    strokeWidth={3}
                    curveType="natural"
                    animate={{ type: "timing", duration: 300 }}
                  />
                )}
              </CartesianChart>
            </View>
            <Text className="text-xs text-muted mt-2 text-center">
              Évolution de vos économies sur 6 mois
            </Text>
          </View>

          {/* Graphique de répartition par catégorie */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-base font-semibold text-foreground mb-4">
              Dépenses par catégorie
            </Text>
            <View style={{ height: 220 }}>
              <CartesianChart
                data={categoryData}
                xKey="category"
                yKeys={["amount"]}
                domainPadding={{ left: 10, right: 10, top: 20, bottom: 20 }}
              >
                {({ points, chartBounds }) => (
                  <Bar
                    points={points.amount}
                    chartBounds={chartBounds}
                    color={colors.primary}
                    roundedCorners={{ topLeft: 8, topRight: 8 }}
                    animate={{ type: "timing", duration: 300 }}
                  />
                )}
              </CartesianChart>
            </View>
            <View className="gap-2 mt-4">
              {categoryData.map((cat, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    />
                    <Text className="text-sm text-foreground">{cat.category}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {cat.amount}$ ({cat.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Graphique de progression vers l'objectif */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-base font-semibold text-foreground mb-4">
              Progression vers l'objectif 10%
            </Text>
            <View style={{ height: 200 }}>
              <CartesianChart
                data={progressData}
                xKey="week"
                yKeys={["saved", "goal"]}
                domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                {({ points, chartBounds }) => (
                  <>
                    <Line
                      points={points.goal}
                      color={colors.muted}
                      strokeWidth={2}
                    />
                    <Bar
                      points={points.saved}
                      chartBounds={chartBounds}
                      color={colors.success}
                      roundedCorners={{ topLeft: 6, topRight: 6 }}
                      animate={{ type: "timing", duration: 300 }}
                    />
                  </>
                )}
              </CartesianChart>
            </View>
            <Text className="text-xs text-muted mt-2 text-center">
              Objectif hebdomadaire: 87.50$ (10% de 3500$)
            </Text>
          </View>

          {/* Résumé des tendances */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <IconSymbol name="chart.bar.fill" size={24} color={colors.primary} />
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                Tendances du mois
              </Text>
            </View>
            <View className="gap-2">
              <Text className="text-sm text-foreground">
                📈 Vos économies ont augmenté de 27% ce mois-ci
              </Text>
              <Text className="text-sm text-foreground">
                💡 Vous avez appliqué 8 suggestions d'économies
              </Text>
              <Text className="text-sm text-foreground">
                🎯 Vous êtes à 80% de votre objectif mensuel
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
