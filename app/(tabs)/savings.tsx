import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { StorageService, type Suggestion as StoredSuggestion } from "@/lib/storage";

type SuggestionCategory = "impots" | "cellulaire" | "epicerie" | "services" | "energie";
type SuggestionStatus = "active" | "appliquee" | "ignoree";

const CATEGORIES = [
  { key: "tous" as const, label: "Tous" },
  { key: "impots" as const, label: "Impôts" },
  { key: "cellulaire" as const, label: "Cellulaire" },
  { key: "epicerie" as const, label: "Épicerie" },
  { key: "services" as const, label: "Services" },
  { key: "energie" as const, label: "Énergie" },
];

const TABS: { key: SuggestionStatus | "active"; label: string }[] = [
  { key: "active", label: "Suggestions actives" },
  { key: "appliquee", label: "Réalisées" },
  { key: "ignoree", label: "Ignorées" },
];

export default function SavingsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<SuggestionStatus | "active">("active");
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory | "tous">("tous");
  const [suggestions, setSuggestions] = useState<StoredSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSuggestions();
    }, [])
  );

  const loadSuggestions = async () => {
    setIsLoading(true);
    const stored = await StorageService.getSuggestions();
    setSuggestions(stored);
    const documents = await StorageService.getDocuments();
    const alertDoc = documents.find(d => (d.extractedData as any)?.type === 'credit_alert' && !(d as any).alertShown);
    if (alertDoc && alertDoc.extractedData) {
      Alert.alert(
        "🚨 Alerte de Crédit",
        (alertDoc.extractedData as any).message + "\nNouveau taux: " + (alertDoc.extractedData as any).new_rate + "%",
        [{
          text: "OK", onPress: async () => {
            const updatedDocs = documents.map(d => d.id === alertDoc.id ? { ...d, alertShown: true } : d);
            await StorageService.saveDocuments(updatedDocs);
          }
        }]
      );
    }
    setIsLoading(false);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesTab = activeTab === "active" ? s.status === "active" : s.status === activeTab;
    const matchesCategory = selectedCategory === "tous" || s.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  const totalPotentialSavings = suggestions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.savings, 0);

  const handleApply = async (id: string) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (suggestion) {
      await StorageService.updateSuggestionStatus(id, "appliquee");
      await StorageService.addToTotalSavings(suggestion.savings);
      await loadSuggestions();
    }
  };

  const handleIgnore = async (id: string) => {
    await StorageService.updateSuggestionStatus(id, "ignoree");
    await loadSuggestions();
  };

  const getCategoryIcon = (category: SuggestionCategory) => {
    switch (category) {
      case "impots": return "doc.text.viewfinder";
      case "cellulaire": return "message.fill";
      case "epicerie": return "house.fill";
      case "services": return "chart.bar.fill";
      case "energie": return "dollarsign.circle.fill";
      default: return "dollarsign.circle.fill";
    }
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.foreground }}>Économies</Text>
          <View style={{ backgroundColor: colors.success + "20", padding: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Économies potentielles</Text>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.success }}>
              {totalPotentialSavings} $ / mois
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: activeTab === tab.key ? "#FFFFFF" : colors.foreground }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
                <View style={{ backgroundColor: colors.primary + "20", width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                  <IconSymbol name={getCategoryIcon(item.category)} size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{item.title}</Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>{item.description}</Text>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.success }}>{item.savings} $ / mois</Text>

                  {item.status === "active" && (
                    <View style={{ flexDirection: "column", gap: 12, marginTop: 16 }}>
                      <TouchableOpacity
                        onPress={() => handleApply(item.id)}
                        style={{ backgroundColor: colors.primary, paddingVertical: 22, borderRadius: 12, alignItems: "center" }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Appliquer l'économie</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleIgnore(item.id)}
                        style={{ backgroundColor: "transparent", paddingVertical: 22, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: "center" }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 18 }}>Ignorer cette offre</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<View style={{ alignItems: "center", paddingVertical: 40 }}><Text style={{ color: colors.muted }}>Aucune suggestion</Text></View>}
        />
      </View>
    </ScreenContainer>
  );
}
