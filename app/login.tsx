import { View, Text, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { getLoginUrl } from "@/constants/oauth";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Nécessaire pour fermer le navigateur après l'authentification
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colors = useColors();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    try {
      const loginUrl = getLoginUrl();
      
      if (Platform.OS === "web") {
        // Sur web, rediriger directement
        window.location.href = loginUrl;
      } else {
        // Sur mobile, ouvrir dans le navigateur
        const result = await WebBrowser.openAuthSessionAsync(loginUrl, null);
        
        if (result.type === "success") {
          // La redirection se fera automatiquement via le deep link
          console.log("Connexion réussie");
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-between">
        {/* Contenu principal */}
        <View className="flex-1 justify-center gap-8">
          {/* Logo et titre */}
          <View className="items-center gap-4">
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 30,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="dollarsign.circle.fill" size={64} color="#FFFFFF" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-foreground">Économie Québec</Text>
              <Text className="text-base text-muted text-center">
                Votre assistant AI pour gérer vos finances
              </Text>
            </View>
          </View>

          {/* Fonctionnalités */}
          <View className="gap-4">
            <View className="flex-row items-start gap-3">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.success + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Analyse intelligente
                </Text>
                <Text className="text-sm text-muted">
                  Scannez vos factures et relevés pour des suggestions personnalisées
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="chart.bar.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Suivi en temps réel
                </Text>
                <Text className="text-sm text-muted">
                  Visualisez vos dépenses et économies avec des graphiques interactifs
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.warning + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="bell.fill" size={24} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Rappels intelligents
                </Text>
                <Text className="text-sm text-muted">
                  Recevez des alertes pour vos crédits d'impôt et dates importantes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Boutons d'action */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text className="text-base font-semibold text-white">Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-base font-semibold text-foreground">
              Continuer sans compte
            </Text>
          </TouchableOpacity>

          <Text className="text-xs text-muted text-center mt-2">
            En vous connectant, vos données seront synchronisées entre tous vos appareils
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
