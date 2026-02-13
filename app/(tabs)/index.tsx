import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useUserContext } from "@/contexts/UserContext";

interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface Suggestion {
  id: string;
  title: string;
  savings: number;
  icon: any;
}

export default function HomeInteractiveScreen() {
  const colors = useColors();
  const router = useRouter();

  // Utiliser le Context au lieu de useState locaux
  const {
    userName,
    monthlyIncome,
    savingsGoal,
    housingExpense,
    groceriesExpense,
    transportExpense,
    otherExpense,
  } = useUserContext();

  // Calculs dynamiques
  const income = monthlyIncome || 0;
  const savingsGoalAmount = income * savingsGoal;
  
  const housing = housingExpense || 0;
  const groceries = groceriesExpense || 0;
  const transport = transportExpense || 0;
  const other = otherExpense || 0;
  
  const totalExpenses = housing + groceries + transport + other;
  const actualSavings = income - totalExpenses;
  const budgetRemaining = income - totalExpenses;
  const potentialSavings = Math.max(0, savingsGoalAmount - actualSavings);

  const expenses: CategoryExpense[] = [
    { 
      category: "Logement", 
      amount: housing, 
      percentage: income > 0 ? Math.round((housing / income) * 100) : 0, 
      color: "#0066CC" 
    },
    { 
      category: "Épicerie", 
      amount: groceries, 
      percentage: income > 0 ? Math.round((groceries / income) * 100) : 0, 
      color: "#22C55E" 
    },
    { 
      category: "Transport", 
      amount: transport, 
      percentage: income > 0 ? Math.round((transport / income) * 100) : 0, 
      color: "#F59E0B" 
    },
    { 
      category: "Autres", 
      amount: other, 
      percentage: income > 0 ? Math.round((other / income) * 100) : 0, 
      color: "#8B5CF6" 
    },
  ];

  const topSuggestions: Suggestion[] = [
    {
      id: "1",
      title: "Crédit d'impôt transport",
      savings: 180,
      icon: "doc.text.viewfinder",
    },
    {
      id: "2",
      title: "Forfait cellulaire moins cher",
      savings: 35,
      icon: "message.fill",
    },
    {
      id: "3",
      title: "Optimiser l'épicerie",
      savings: 45,
      icon: "house.fill",
    },
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête avec profil */}
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-3xl font-bold text-foreground">
                {userName ? `Bonjour, ${userName}! 👋` : "Bonjour! 👋"}
              </Text>
              <Text className="text-base text-muted">Voici votre résumé financier</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push("/stats")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <IconSymbol name="chart.bar.fill" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Carte de résumé mensuel */}
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <Text className="text-sm font-medium text-white opacity-90 mb-4">Ce mois-ci</Text>
            <View className="flex-row justify-between mb-6">
              <View className="gap-1">
                <Text className="text-xs text-white opacity-75">Économies réalisées</Text>
                <Text className="text-3xl font-bold text-white">{actualSavings.toFixed(0)} $</Text>
              </View>
              <View className="gap-1 items-end">
                <Text className="text-xs text-white opacity-75">Objectif ({(savingsGoal * 100).toFixed(0)}%)</Text>
                <Text className="text-3xl font-bold text-white">{savingsGoalAmount.toFixed(0)} $</Text>
              </View>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${Math.min((actualSavings / savingsGoalAmount) * 100, 100)}%`,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text className="text-xs text-white opacity-75 mt-2">
              {((actualSavings / savingsGoalAmount) * 100).toFixed(0)}% de votre objectif
            </Text>
          </View>

          {/* Statistiques rapides */}
          <View className="flex-row gap-3">
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-xs text-muted mb-1">Budget restant</Text>
              <Text className="text-2xl font-bold text-foreground">{budgetRemaining.toFixed(0)} $</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.success + "20",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text className="text-xs text-muted mb-1">Économies possibles</Text>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {potentialSavings.toFixed(0)} $
              </Text>
            </View>
          </View>

          {/* Graphique des dépenses */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-4">
              Répartition des dépenses
            </Text>
            <View className="gap-3">
              {expenses.map((expense, index) => (
                <View key={index} className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: expense.color,
                        }}
                      />
                      <Text className="text-sm text-foreground">{expense.category}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">
                      {expense.amount.toFixed(0)} $ ({expense.percentage}%)
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.border,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${expense.percentage * 3}%`,
                        backgroundColor: expense.color,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Top suggestions d'économies */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Suggestions d'économies</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/savings")}>
                <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            {topSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                onPress={() => router.push("/(tabs)/savings")}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol name={suggestion.icon} size={20} color={colors.primary} />
                  </View>
                  <View className="gap-1">
                    <Text className="text-sm font-medium text-foreground">{suggestion.title}</Text>
                    <Text className="text-xs" style={{ color: colors.success }}>
                      Économie: {suggestion.savings} $
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Boutons d'action rapide */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/savings" as any)}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
                gap: 2,
              }}
            >
              <IconSymbol name="doc.text.viewfinder" size={24} color="#FFFFFF" />
              <Text className="text-sm font-semibold text-white">Économies</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/budget" as any)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
                gap: 2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="message.fill" size={24} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
