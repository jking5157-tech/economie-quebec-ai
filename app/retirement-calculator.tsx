import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RetirementCalculatorScreen() {
  const colors = useColors();
  const router = useRouter();

  const [age, setAge] = useState("35");
  const [retirementAge, setRetirementAge] = useState("65");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [currentSavings, setCurrentSavings] = useState("25000");
  const [returnRate, setReturnRate] = useState("5");

  const calculateProjection = () => {
    const years = parseInt(retirementAge) - parseInt(age);
    const monthly = parseFloat(monthlyContribution);
    const current = parseFloat(currentSavings);
    const rate = parseFloat(returnRate) / 100 / 12;

    // Formule des intérêts composés
    const futureValueContributions =
      monthly * ((Math.pow(1 + rate, years * 12) - 1) / rate);
    const futureValueCurrent = current * Math.pow(1 + rate, years * 12);

    return {
      total: Math.round(futureValueContributions + futureValueCurrent),
      fromContributions: Math.round(futureValueContributions),
      fromCurrent: Math.round(futureValueCurrent),
      totalContributed: Math.round(monthly * years * 12 + current),
      interestEarned: Math.round(
        futureValueContributions + futureValueCurrent - (monthly * years * 12 + current)
      ),
    };
  };

  const projection = calculateProjection();

  // Limites de cotisation 2026 (données de référence)
  const limits = {
    reer: 31560,
    celi: 7000,
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
              <Text className="text-3xl font-bold text-foreground">Calculateur REER/CELI</Text>
              <Text className="text-sm text-muted">Planifiez votre retraite</Text>
            </View>
          </View>

          {/* Limites de cotisation */}
          <View className="flex-row gap-3">
            <View
              style={{
                flex: 1,
                backgroundColor: colors.primary + "10",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
            >
              <Text className="text-xs text-muted mb-1">Limite REER 2026</Text>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {limits.reer.toLocaleString()} $
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.success + "10",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.success,
              }}
            >
              <Text className="text-xs text-muted mb-1">Limite CELI 2026</Text>
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {limits.celi.toLocaleString()} $
              </Text>
            </View>
          </View>

          {/* Formulaire */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 16,
            }}
          >
            <Text className="text-base font-semibold text-foreground">Vos informations</Text>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Âge actuel</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Âge de retraite souhaité</Text>
              <TextInput
                value={retirementAge}
                onChangeText={setRetirementAge}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                Cotisation mensuelle ($)
              </Text>
              <TextInput
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Épargne actuelle ($)</Text>
              <TextInput
                value={currentSavings}
                onChangeText={setCurrentSavings}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                Taux de rendement annuel (%)
              </Text>
              <TextInput
                value={returnRate}
                onChangeText={setReturnRate}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>
          </View>

          {/* Projection */}
          <View
            style={{
              backgroundColor: colors.success,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text className="text-sm text-white opacity-80 mb-2">
              Valeur totale à la retraite
            </Text>
            <Text className="text-5xl font-bold text-white mb-4">
              {projection.total.toLocaleString()} $
            </Text>
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                marginVertical: 12,
              }}
            />
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">Total cotisé</Text>
                <Text className="text-base font-semibold text-white">
                  {projection.totalContributed.toLocaleString()} $
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">Intérêts gagnés</Text>
                <Text className="text-base font-semibold text-white">
                  {projection.interestEarned.toLocaleString()} $
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-white opacity-80">Années jusqu'à la retraite</Text>
                <Text className="text-base font-semibold text-white">
                  {parseInt(retirementAge) - parseInt(age)} ans
                </Text>
              </View>
            </View>
          </View>

          {/* Comparaison REER vs CELI */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">REER vs CELI</Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-2xl">🏦</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">REER</Text>
                  <Text className="text-xs text-muted">Régime enregistré d'épargne-retraite</Text>
                </View>
              </View>
              <Text className="text-sm text-foreground">
                ✅ Déduction fiscale immédiate{"\n"}✅ Idéal pour revenus élevés{"\n"}✅ Report
                d'impôt jusqu'à la retraite{"\n"}❌ Imposé au retrait{"\n"}❌ Conversion obligatoire
                à 71 ans
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.success + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-2xl">💰</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">CELI</Text>
                  <Text className="text-xs text-muted">Compte d'épargne libre d'impôt</Text>
                </View>
              </View>
              <Text className="text-sm text-foreground">
                ✅ Retraits non imposables{"\n"}✅ Flexibilité maximale{"\n"}✅ Idéal pour objectifs
                court/moyen terme{"\n"}✅ Pas de conversion obligatoire{"\n"}❌ Pas de déduction
                fiscale
              </Text>
            </View>
          </View>

          {/* Recommandation */}
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
                  Recommandation personnalisée
                </Text>
                <Text className="text-sm text-foreground">
                  Avec votre profil, nous recommandons de maximiser d'abord votre REER pour profiter
                  de la déduction fiscale, puis de cotiser au CELI avec le surplus. Consultez un
                  conseiller financier pour une stratégie personnalisée.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
