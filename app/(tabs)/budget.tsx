import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useUserContext } from "@/contexts/UserContext";

interface CategoryBudget {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

export default function BudgetScreen() {
  const colors = useColors();

  // Utiliser les vraies valeurs du Context
  const {
    monthlyIncome,
    savingsGoal,
    housingExpense,
    groceriesExpense,
    transportExpense,
    cellphoneExpense,
    servicesExpense,
    otherExpense,
  } = useUserContext();

  const targetSavings = monthlyIncome * savingsGoal;
  const totalExpenses = housingExpense + groceriesExpense + transportExpense + cellphoneExpense + servicesExpense + otherExpense;

  // Budget fixe basé sur le revenu mensuel
  const budgetLimit = monthlyIncome;
  const remaining = budgetLimit - totalExpenses;

  // Calcul des économies réelles
  const currentSavings = remaining;
  const savingsProgress = (currentSavings / targetSavings) * 100;

  const categories: CategoryBudget[] = [
    { category: "Logement", spent: housingExpense, budget: housingExpense, color: "#0066CC" },
    { category: "Épicerie", spent: groceriesExpense, budget: groceriesExpense, color: "#22C55E" },
    { category: "Transport", spent: transportExpense, budget: transportExpense, color: "#F59E0B" },
    { category: "Cellulaire", spent: cellphoneExpense, budget: cellphoneExpense, color: "#EF4444" },
    { category: "Services", spent: servicesExpense, budget: servicesExpense, color: "#EC4899" },
    { category: "Autres", spent: otherExpense, budget: otherExpense, color: "#8B5CF6" },
  ];

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);

  const getBarWidth = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const isOverBudget = (spent: number, budget: number) => spent > budget;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Budget</Text>
            <Text className="text-base text-muted">Suivez vos dépenses et atteignez vos objectifs</Text>
          </View>

          {/* Objectif d'épargne */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-3">
              Objectif d'épargne mensuel ({(savingsGoal * 100).toFixed(0)}%)
            </Text>
            <View className="gap-2">
              <View className="flex-row items-end justify-between">
                <Text className="text-2xl font-bold text-foreground">{currentSavings} $</Text>
                <Text className="text-sm text-muted">sur {targetSavings} $</Text>
              </View>
              <View
                style={{
                  height: 12,
                  backgroundColor: colors.border,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(savingsProgress, 100)}%`,
                    backgroundColor: savingsProgress >= 100 ? colors.success : colors.primary,
                    borderRadius: 6,
                  }}
                />
              </View>
              <Text className="text-xs text-muted">{savingsProgress.toFixed(0)}% de l'objectif atteint</Text>
            </View>
          </View>

          {/* Résumé du mois */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-4">Ce mois-ci</Text>
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="text-xs text-muted">Dépensé</Text>
                <Text className="text-2xl font-bold text-foreground">{totalSpent} $</Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">Budget</Text>
                <Text className="text-2xl font-bold text-foreground">{budgetLimit} $</Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">Restant</Text>
                <Text
                  className="text-2xl font-bold"
                  style={{
                    color: remaining >= 0 ? colors.success : colors.error,
                  }}
                >
                  {remaining} $
                </Text>
              </View>
            </View>
          </View>

          {/* Répartition par catégorie */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Dépenses par catégorie</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text className="text-xs font-semibold text-white">Ajuster</Text>
              </TouchableOpacity>
            </View>

            {categories.map((cat, index) => (
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
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: cat.color,
                      }}
                    />
                    <Text className="text-base font-semibold text-foreground">{cat.category}</Text>
                  </View>
                  <Text className="text-sm text-muted">
                    {cat.spent} $ / {cat.budget} $
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: colors.border,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${getBarWidth(cat.spent, cat.budget)}%`,
                      backgroundColor: isOverBudget(cat.spent, cat.budget) ? colors.error : cat.color,
                      borderRadius: 4,
                    }}
                  />
                </View>
                {isOverBudget(cat.spent, cat.budget) && (
                  <Text className="text-xs mt-1" style={{ color: colors.error }}>
                    Dépassement de {cat.spent - cat.budget} $
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Comparaison avec le mois précédent */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-3">
              Comparaison avec janvier 2026
            </Text>
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="text-xs text-muted">Dépenses</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-bold" style={{ color: colors.success }}>
                    -8%
                  </Text>
                  <Text className="text-sm text-muted">(2420 $ → {totalSpent} $)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
