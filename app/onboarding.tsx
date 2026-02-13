import { View, Text, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StorageService } from "@/lib/storage";

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "dollarsign.circle.fill" as const,
      title: "Bienvenue sur Économie Québec",
      description:
        "Votre assistant AI personnel pour gérer vos finances et économiser au moins 10% de vos revenus.",
      color: colors.primary,
    },
    {
      icon: "doc.text.viewfinder" as const,
      title: "Analysez vos documents",
      description:
        "Scannez vos factures et relevés bancaires. Notre AI les analyse pour détecter des opportunités d'économies.",
      color: colors.success,
    },
    {
      icon: "chart.bar.fill" as const,
      title: "Suivez vos progrès",
      description:
        "Visualisez vos dépenses, économies et progression vers votre objectif avec des graphiques interactifs.",
      color: colors.warning,
    },
    {
      icon: "bell.fill" as const,
      title: "Recevez des rappels",
      description:
        "Ne manquez plus jamais un crédit d'impôt ou une date importante grâce à nos notifications intelligentes.",
      color: colors.error,
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Marquer l'onboarding comme terminé
      const prefs = await StorageService.getPreferences();
      await StorageService.savePreferences({
        ...prefs,
        onboardingCompleted: true,
      });
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    const prefs = await StorageService.getPreferences();
    await StorageService.savePreferences({
      ...prefs,
      onboardingCompleted: true,
    });
    router.replace("/(tabs)");
  };

  const step = steps[currentStep];

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-between">
        {/* Bouton Skip */}
        <View className="items-end">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-base font-medium" style={{ color: colors.primary }}>
              Passer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu de l'étape */}
        <View className="flex-1 justify-center items-center gap-8">
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: step.color + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name={step.icon} size={80} color={step.color} />
          </View>

          <View className="items-center gap-4 px-4">
            <Text className="text-3xl font-bold text-foreground text-center">{step.title}</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              {step.description}
            </Text>
          </View>
        </View>

        {/* Indicateurs et bouton */}
        <View className="gap-6">
          {/* Indicateurs de progression */}
          <View className="flex-row justify-center gap-2">
            {steps.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === currentStep ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentStep ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>

          {/* Bouton suivant */}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text className="text-base font-semibold text-white">
              {currentStep < steps.length - 1 ? "Suivant" : "Commencer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
