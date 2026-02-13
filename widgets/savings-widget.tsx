import { View, Text } from "react-native";

/**
 * Widget de suggestions d'économies
 * Affiche les suggestions actives avec le montant total d'économies possibles
 * 
 * Note: Les widgets Expo sont actuellement en développement préliminaire.
 * Cette implémentation est une structure de base qui sera fonctionnelle
 * lorsque expo-widgets sera pleinement supporté.
 */

export default function SavingsWidget() {
  // Données de démonstration
  const data = {
    activeSuggestions: 5,
    totalPotentialSavings: 297,
    topSuggestions: [
      { id: "1", title: "Forfait cellulaire", savings: 85, icon: "📱" },
      { id: "2", title: "Épicerie", savings: 120, icon: "🛒" },
      { id: "3", title: "Hydro-Québec", savings: 45, icon: "💡" },
    ],
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#E6F9F0",
        borderRadius: 16,
        padding: 16,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#11181C",
          }}
        >
          Économies possibles
        </Text>
        <View
          style={{
            backgroundColor: "#22C55E",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {data.activeSuggestions} actives
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#687076",
          }}
        >
          Total potentiel
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#22C55E",
            marginTop: 4,
          }}
        >
          {data.totalPotentialSavings} $
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {data.topSuggestions.map((suggestion) => (
          <View
            key={suggestion.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <Text style={{ fontSize: 20 }}>{suggestion.icon}</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#11181C",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {suggestion.title}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#22C55E",
              }}
            >
              {suggestion.savings} $
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
