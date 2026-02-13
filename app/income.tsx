import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";

type OpportunityType = "gouvernement" | "impot" | "emploi" | "cashback";

interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  potentialIncome: number;
  region: string;
  link?: string;
}

const FILTERS = [
  { key: "tous" as const, label: "Tous" },
  { key: "gouvernement" as const, label: "Programmes" },
  { key: "impot" as const, label: "Crédits d'impôt" },
  { key: "emploi" as const, label: "Emplois" },
  { key: "cashback" as const, label: "Cashback" },
];

export default function IncomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<OpportunityType | "tous">("tous");

  // Données de démonstration
  const userRegion = "Montréal";
  const [opportunities] = useState<Opportunity[]>([
    {
      id: "1",
      type: "gouvernement",
      title: "Allocation canadienne pour enfants (ACE)",
      description: "Prestation mensuelle pour les familles avec enfants de moins de 18 ans",
      potentialIncome: 560,
      region: "Québec",
    },
    {
      id: "2",
      type: "impot",
      title: "Crédit d'impôt pour solidarité",
      description: "Aide financière pour les ménages à revenu faible ou modeste",
      potentialIncome: 85,
      region: "Québec",
    },
    {
      id: "3",
      type: "impot",
      title: "Crédit pour frais de garde d'enfants",
      description: "Réclamez jusqu'à 75% des frais de garde admissibles",
      potentialIncome: 320,
      region: "Québec",
    },
    {
      id: "4",
      type: "emploi",
      title: "Livraison à temps partiel - DoorDash",
      description: "Gagnez jusqu'à 25$/h en livrant des repas dans votre quartier",
      potentialIncome: 400,
      region: "Montréal",
      link: "https://doordash.com",
    },
    {
      id: "5",
      type: "cashback",
      title: "Carte de crédit Tangerine",
      description: "2% de cashback sur 3 catégories de votre choix",
      potentialIncome: 45,
      region: "Canada",
    },
    {
      id: "6",
      type: "gouvernement",
      title: "Remboursement TPS/TVQ",
      description: "Crédit trimestriel pour les ménages à revenu modeste",
      potentialIncome: 75,
      region: "Québec",
    },
    {
      id: "7",
      type: "cashback",
      title: "Rakuten - Cashback en ligne",
      description: "Obtenez jusqu'à 10% de cashback sur vos achats en ligne",
      potentialIncome: 30,
      region: "Canada",
    },
  ]);

  const filteredOpportunities = opportunities.filter((opp) =>
    selectedFilter === "tous" ? true : opp.type === selectedFilter
  );

  const totalPotential = opportunities.reduce((sum, opp) => sum + opp.potentialIncome, 0);

  const getTypeIcon = (type: OpportunityType) => {
    switch (type) {
      case "gouvernement":
        return "house.fill";
      case "impot":
        return "doc.text.viewfinder";
      case "emploi":
        return "chart.bar.fill";
      case "cashback":
        return "dollarsign.circle.fill";
      default:
        return "dollarsign.circle.fill";
    }
  };

  const getTypeColor = (type: OpportunityType) => {
    switch (type) {
      case "gouvernement":
        return colors.primary;
      case "impot":
        return colors.success;
      case "emploi":
        return colors.warning;
      case "cashback":
        return "#8B5CF6";
      default:
        return colors.primary;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        {/* En-tête avec bouton retour */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Revenus+</Text>
            <Text className="text-sm text-muted">Région: {userRegion}</Text>
          </View>
        </View>

        {/* Carte de résumé */}
        <View
          style={{
            backgroundColor: colors.success + "20",
            padding: 20,
            borderRadius: 16,
          }}
        >
          <Text className="text-sm text-muted mb-1">Revenus potentiels totaux</Text>
          <Text className="text-3xl font-bold" style={{ color: colors.success }}>
            {totalPotential} $ / mois
          </Text>
          <Text className="text-xs text-muted mt-2">
            {opportunities.length} opportunités disponibles
          </Text>
        </View>

        {/* Bouton calculateur d'impôt */}
        <TouchableOpacity
          onPress={() => router.push("/tax-calculator")}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IconSymbol name="dollarsign.circle.fill" size={24} color="#FFFFFF" />
          <Text className="text-base font-semibold text-white">
            Calculer mes crédits d'impôt QC
          </Text>
        </TouchableOpacity>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{
                  backgroundColor: selectedFilter === filter.key ? colors.primary : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: selectedFilter === filter.key ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedFilter === filter.key ? "#FFFFFF" : colors.foreground,
                  }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Liste des opportunités */}
        <FlatList
          data={filteredOpportunities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-start gap-3">
                <View
                  style={{
                    backgroundColor: getTypeColor(item.type) + "20",
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSymbol name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
                </View>
                <View className="flex-1 gap-2">
                  <View className="flex-row items-start justify-between">
                    <Text className="text-base font-semibold text-foreground flex-1">
                      {item.title}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.success + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text className="text-xs font-bold" style={{ color: colors.success }}>
                        +{item.potentialIncome}$
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-muted">{item.description}</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-muted">📍 {item.region}</Text>
                    {item.link && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text className="text-xs font-semibold text-white">En savoir plus</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-base text-muted">Aucune opportunité dans cette catégorie</Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}
