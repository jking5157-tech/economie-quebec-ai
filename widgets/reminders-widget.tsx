import { View, Text } from "react-native";

/**
 * Widget de rappels
 * Affiche les 3 prochains rappels importants
 * 
 * Note: Les widgets Expo sont actuellement en développement préliminaire.
 * Cette implémentation est une structure de base qui sera fonctionnelle
 * lorsque expo-widgets sera pleinement supporté.
 */

export default function RemindersWidget() {
  // Données de démonstration
  const reminders = [
    {
      id: "1",
      title: "Déclaration d'impôts",
      dueDate: "30 avril",
      icon: "💰",
    },
    {
      id: "2",
      title: "Renouvellement assurance",
      dueDate: "15 mars",
      icon: "🛡️",
    },
    {
      id: "3",
      title: "Facture Hydro-Québec",
      dueDate: "5 mars",
      icon: "💡",
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#11181C",
        }}
      >
        Prochains rappels
      </Text>

      {reminders.map((reminder) => (
        <View
          key={reminder.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#F5F5F5",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>{reminder.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#11181C",
              }}
            >
              {reminder.title}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#687076",
                marginTop: 2,
              }}
            >
              {reminder.dueDate}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
