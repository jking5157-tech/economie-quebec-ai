import { View, Text } from "react-native";

/**
 * Widget de résumé mensuel
 * Affiche les économies réalisées et l'objectif mensuel
 * 
 * Note: Les widgets Expo sont actuellement en développement préliminaire.
 * Cette implémentation est une structure de base qui sera fonctionnelle
 * lorsque expo-widgets sera pleinement supporté.
 * 
 * Pour l'instant, les widgets nécessitent une configuration native supplémentaire
 * et ne sont pas automatiquement disponibles sur tous les appareils.
 */

export default function SummaryWidget() {
  // Données de démonstration (en production, ces données viendraient d'AsyncStorage ou de l'API)
  const data = {
    savedThisMonth: 280,
    goalThisMonth: 350,
    percentageAchieved: 80,
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0066CC",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#FFFFFF",
          opacity: 0.9,
        }}
      >
        Ce mois-ci
      </Text>

      <View style={{ gap: 8 }}>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: "#FFFFFF",
              opacity: 0.8,
            }}
          >
            Économies réalisées
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            {data.savedThisMonth} $
          </Text>
        </View>

        <View>
          <Text
            style={{
              fontSize: 12,
              color: "#FFFFFF",
              opacity: 0.8,
            }}
          >
            Objectif (10%)
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {data.goalThisMonth} $
          </Text>
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
            width: `${data.percentageAchieved}%`,
            height: "100%",
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>

      <Text
        style={{
          fontSize: 12,
          color: "#FFFFFF",
          opacity: 0.9,
          textAlign: "center",
        }}
      >
        {data.percentageAchieved}% de votre objectif
      </Text>
    </View>
  );
}
