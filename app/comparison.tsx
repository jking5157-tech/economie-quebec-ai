import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";


export default function ComparisonScreen() {
  const colors = useColors();
  const router = useRouter();

  // Moyennes québécoises par catégorie (données de référence)
  const quebecAverages = {
    logement: 1350,
    epicerie: 550,
    transport: 420,
    loisirs: 280,
    assurances: 180,
    telecommunications: 150,
    sante: 120,
    autres: 450,
  };

  // Dépenses de l'utilisateur
  const userExpenses = {
    logement: 1200,
    epicerie: 450,
    transport: 280,
    loisirs: 220,
    assurances: 165,
    telecommunications: 195,
    sante: 95,
    autres: 330,
  };

  const categories = [
    {
      id: "logement",
      name: "Logement",
      icon: "house.fill",
      user: userExpenses.logement,
      average: quebecAverages.logement,
      color: colors.primary,
    },
    {
      id: "epicerie",
      name: "Épicerie",
      icon: "cart.fill",
      user: userExpenses.epicerie,
      average: quebecAverages.epicerie,
      color: "#22C55E",
    },
    {
      id: "transport",
      name: "Transport",
      icon: "car.fill",
      user: userExpenses.transport,
      average: quebecAverages.transport,
      color: "#F59E0B",
    },
    {
      id: "loisirs",
      name: "Loisirs",
      icon: "gamecontroller.fill",
      user: userExpenses.loisirs,
      average: quebecAverages.loisirs,
      color: "#8B5CF6",
    },
    {
      id: "assurances",
      name: "Assurances",
      icon: "shield.fill",
      user: userExpenses.assurances,
      average: quebecAverages.assurances,
      color: "#06B6D4",
    },
    {
      id: "telecommunications",
      name: "Télécommunications",
      icon: "antenna.radiowaves.left.and.right",
      user: userExpenses.telecommunications,
      average: quebecAverages.telecommunications,
      color: "#EC4899",
    },
  ];

  const calculateDifference = (user: number, average: number) => {
    const diff = user - average;
    const percent = ((diff / average) * 100).toFixed(0);
    return { diff, percent, isSaving: diff < 0 };
  };

  const totalUserExpenses = Object.values(userExpenses).reduce((a, b) => a + b, 0);
  const totalAverageExpenses = Object.values(quebecAverages).reduce((a, b) => a + b, 0);
  const totalDiff = totalUserExpenses - totalAverageExpenses;
  const isSavingOverall = totalDiff < 0;

  // Données pour le graphique
  const chartData = categories.map((cat) => ({
    category: cat.name.substring(0, 8),
    user: cat.user,
    average: cat.average,
  }));

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
              <Text className="text-3xl font-bold text-foreground">Comparaison</Text>
              <Text className="text-sm text-muted">Vos dépenses vs moyennes québécoises</Text>
            </View>
          </View>

          {/* Résumé global */}
          <View
            style={{
              backgroundColor: isSavingOverall ? colors.success + "10" : colors.error + "10",
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: isSavingOverall ? colors.success : colors.error,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted">Votre total mensuel</Text>
                <Text className="text-3xl font-bold text-foreground">
                  {totalUserExpenses} $
                </Text>
              </View>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isSavingOverall ? colors.success : colors.error,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol
                  name={isSavingOverall ? "arrow.down" : "arrow.up"}
                  size={32}
                  color="#FFFFFF"
                />
              </View>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: isSavingOverall ? colors.success : colors.error,
                marginVertical: 12,
                opacity: 0.3,
              }}
            />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Moyenne québécoise</Text>
              <Text className="text-lg font-semibold text-foreground">
                {totalAverageExpenses} $
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isSavingOverall ? colors.success : colors.error,
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
              }}
            >
              <Text className="text-sm font-semibold text-white text-center">
                {isSavingOverall ? "Vous économisez" : "Vous dépensez"}{" "}
                {Math.abs(totalDiff).toFixed(0)} $ {isSavingOverall ? "de moins" : "de plus"} que
                la moyenne
              </Text>
            </View>
          </View>

          {/* Graphique de comparaison simplifié */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-base font-semibold text-foreground mb-3">
              Comparaison visuelle
            </Text>
            <View className="gap-3">
              {categories.slice(0, 4).map((cat) => {
                const maxValue = Math.max(cat.user, cat.average);
                return (
                  <View key={cat.id} className="gap-2">
                    <Text className="text-xs font-medium text-foreground">{cat.name}</Text>
                    <View className="gap-1">
                      <View className="flex-row items-center gap-2">
                        <View
                          style={{
                            height: 20,
                            width: `${(cat.user / maxValue) * 100}%`,
                            backgroundColor: colors.primary,
                            borderRadius: 4,
                          }}
                        />
                        <Text className="text-xs text-muted">{cat.user} $</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View
                          style={{
                            height: 20,
                            width: `${(cat.average / maxValue) * 100}%`,
                            backgroundColor: colors.muted,
                            opacity: 0.5,
                            borderRadius: 4,
                          }}
                        />
                        <Text className="text-xs text-muted">{cat.average} $</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View className="flex-row items-center justify-center gap-4 mt-4">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                  }}
                />
                <Text className="text-xs text-muted">Vous</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: colors.muted,
                    opacity: 0.5,
                  }}
                />
                <Text className="text-xs text-muted">Moyenne QC</Text>
              </View>
            </View>
          </View>

          {/* Détails par catégorie */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Détails par catégorie</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => {
                const { diff, percent, isSaving } = calculateDifference(item.user, item.average);
                return (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-3">
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: item.color + "20",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconSymbol name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <Text className="text-base font-semibold text-foreground">
                          {item.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: isSaving ? colors.success + "20" : colors.error + "20",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: isSaving ? colors.success : colors.error }}
                        >
                          {isSaving ? "" : "+"}{percent}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-muted">Vous</Text>
                        <Text className="text-lg font-bold text-foreground">{item.user} $</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Moyenne QC</Text>
                        <Text className="text-lg font-semibold text-muted">{item.average} $</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Différence</Text>
                        <Text
                          className="text-lg font-bold"
                          style={{ color: isSaving ? colors.success : colors.error }}
                        >
                          {isSaving ? "" : "+"}{diff.toFixed(0)} $
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {/* Insights */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View className="flex-row items-start gap-3">
              <IconSymbol name="lightbulb.fill" size={24} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Insights personnalisés
                </Text>
                <Text className="text-sm text-foreground">
                  • Vous dépensez 30% de plus en télécommunications que la moyenne. Consultez
                  l'écran Économies pour des suggestions de forfaits moins chers.
                  {"\n\n"}• Votre budget transport est 33% inférieur à la moyenne - excellent
                  travail !{"\n\n"}• Votre épicerie est 18% sous la moyenne québécoise. Continuez
                  ainsi !
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
