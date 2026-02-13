import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";

interface Challenge {
  id: string;
  day: number;
  title: string;
  description: string;
  points: number;
  category: string;
  completed: boolean;
  difficulty: "facile" | "moyen" | "difficile";
}

export default function CoachScreen() {
  const colors = useColors();
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(5);
  const [totalPoints, setTotalPoints] = useState(420);

  // 30 défis d'économies progressifs
  const challenges: Challenge[] = [
    {
      id: "1",
      day: 1,
      title: "Préparez votre café à la maison",
      description: "Évitez le café au restaurant aujourd'hui",
      points: 10,
      category: "Alimentation",
      completed: true,
      difficulty: "facile",
    },
    {
      id: "2",
      day: 2,
      title: "Comparez 3 forfaits cellulaires",
      description: "Recherchez des forfaits moins chers que le vôtre",
      points: 15,
      category: "Télécommunications",
      completed: true,
      difficulty: "facile",
    },
    {
      id: "3",
      day: 3,
      title: "Cuisinez un repas maison",
      description: "Préparez votre lunch au lieu de commander",
      points: 20,
      category: "Alimentation",
      completed: true,
      difficulty: "facile",
    },
    {
      id: "4",
      day: 4,
      title: "Révisez vos abonnements",
      description: "Identifiez un abonnement inutilisé à annuler",
      points: 25,
      category: "Abonnements",
      completed: true,
      difficulty: "moyen",
    },
    {
      id: "5",
      day: 5,
      title: "Journée sans dépense",
      description: "Ne dépensez aucun argent aujourd'hui",
      points: 30,
      category: "Discipline",
      completed: false,
      difficulty: "moyen",
    },
    {
      id: "6",
      day: 6,
      title: "Optimisez votre Hydro-Québec",
      description: "Baissez le thermostat de 2°C",
      points: 20,
      category: "Énergie",
      completed: false,
      difficulty: "facile",
    },
    {
      id: "7",
      day: 7,
      title: "Planifiez vos repas de la semaine",
      description: "Créez un menu et une liste d'épicerie",
      points: 25,
      category: "Alimentation",
      completed: false,
      difficulty: "moyen",
    },
    {
      id: "8",
      day: 8,
      title: "Utilisez les transports en commun",
      description: "Laissez votre voiture à la maison aujourd'hui",
      points: 15,
      category: "Transport",
      completed: false,
      difficulty: "facile",
    },
    {
      id: "9",
      day: 9,
      title: "Vérifiez vos crédits d'impôt",
      description: "Consultez le calculateur de crédits québécois",
      points: 30,
      category: "Impôts",
      completed: false,
      difficulty: "moyen",
    },
    {
      id: "10",
      day: 10,
      title: "Vendez un objet inutilisé",
      description: "Mettez en vente quelque chose sur Marketplace",
      points: 35,
      category: "Revenus",
      completed: false,
      difficulty: "difficile",
    },
  ];

  const completedChallenges = challenges.filter((c) => c.completed).length;
  const progressPercentage = (completedChallenges / challenges.length) * 100;

  const rewards = [
    { points: 100, title: "Débutant économe", icon: "star.fill", unlocked: true },
    { points: 300, title: "Expert des économies", icon: "star.circle.fill", unlocked: true },
    { points: 500, title: "Maître financier", icon: "crown.fill", unlocked: false },
    { points: 1000, title: "Légende québécoise", icon: "trophy.fill", unlocked: false },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile":
        return colors.success;
      case "moyen":
        return colors.warning;
      case "difficile":
        return colors.error;
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
              <Text className="text-3xl font-bold text-foreground">Coach Financier</Text>
              <Text className="text-sm text-muted">Défi 30 jours d'économies</Text>
            </View>
          </View>

          {/* Progression globale */}
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-sm text-white opacity-80">Jour actuel</Text>
                <Text className="text-4xl font-bold text-white">{currentDay}/30</Text>
              </View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-2xl font-bold text-white">{totalPoints}</Text>
                <Text className="text-xs text-white opacity-80">points</Text>
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
                  width: `${progressPercentage}%`,
                  height: "100%",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>
            <Text className="text-xs text-white opacity-80 mt-2">
              {completedChallenges} défis complétés sur {challenges.length}
            </Text>
          </View>

          {/* Récompenses */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Récompenses</Text>
            <View className="flex-row gap-3">
              {rewards.map((reward, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: reward.unlocked ? colors.success + "20" : colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: reward.unlocked ? colors.success : colors.border,
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <IconSymbol
                    name={reward.icon as any}
                    size={24}
                    color={reward.unlocked ? colors.success : colors.muted}
                  />
                  <Text
                    className="text-xs font-semibold text-center"
                    style={{ color: reward.unlocked ? colors.success : colors.muted }}
                  >
                    {reward.points} pts
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Défi du jour */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Défi du jour</Text>
            {challenges
              .filter((c) => c.day === currentDay)
              .map((challenge) => (
                <View
                  key={challenge.id}
                  style={{
                    backgroundColor: colors.primary + "10",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 2,
                    borderColor: colors.primary,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          style={{
                            backgroundColor: getDifficultyColor(challenge.difficulty) + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: getDifficultyColor(challenge.difficulty) }}
                          >
                            {challenge.difficulty.toUpperCase()}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: colors.primary + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                            {challenge.category}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xl font-bold text-foreground mb-2">
                        {challenge.title}
                      </Text>
                      <Text className="text-sm text-muted">{challenge.description}</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.warning,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text className="text-lg font-bold text-white">+{challenge.points}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text className="text-base font-semibold text-white">
                      Marquer comme complété
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Liste des défis */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Tous les défis</Text>
            <FlatList
              data={challenges}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: item.completed ? colors.success + "10" : colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: item.completed ? colors.success : colors.border,
                    opacity: item.day > currentDay ? 0.5 : 1,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          style={{
                            backgroundColor: item.completed
                              ? colors.success + "20"
                              : colors.muted + "20",
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: item.completed ? colors.success : colors.muted }}
                          >
                            {item.day}
                          </Text>
                        </View>
                        <Text className="text-sm font-semibold text-foreground">{item.title}</Text>
                      </View>
                      <Text className="text-xs text-muted ml-8">{item.description}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-xs text-muted">{item.category}</Text>
                      <Text className="text-lg font-bold" style={{ color: colors.warning }}>
                        +{item.points}
                      </Text>
                    </View>
                  </View>
                  {item.completed && (
                    <View
                      style={{
                        backgroundColor: colors.success,
                        borderRadius: 6,
                        padding: 8,
                        marginTop: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                      <Text className="text-xs font-semibold text-white">Complété</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Conseils */}
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
                  Conseil du coach
                </Text>
                <Text className="text-sm text-foreground">
                  Complétez les défis dans l'ordre pour maximiser vos points ! Les défis difficiles
                  rapportent plus de points mais demandent plus d'efforts. Prenez votre temps et
                  célébrez chaque victoire.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
