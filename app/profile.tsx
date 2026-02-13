import { ScrollView, Text, View, TouchableOpacity, Switch, Platform, Animated, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, TextInput } from "react-native";
import { PDFExportService } from "@/lib/pdf-export-service";
import { useRouter } from "expo-router";
import { NotificationService } from "@/lib/notification-service";
import Slider from "@react-native-community/slider";
import { useUserContext } from "@/contexts/UserContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
// NOTE ARCHITECTURALE (Loi 25 Québec) :
// AsyncStorage est INTERDIT pour le consentement.
// Source de vérité UNIQUE = base de données serveur via tRPC.
// Aucun getItem/setItem/fallback local pour ce champ.

export default function ProfileScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  // === CONSENTEMENT : Source de vérité = serveur DB uniquement ===
  // Pas de useState(false) comme valeur initiale : on attend le serveur.
  const [consentLoading, setConsentLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const { isAuthenticated } = useAuth();
  const trpcUtils = trpc.useUtils();

  // Toast helper
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  }, [toastOpacity]);

  // SOURCE DE VÉRITÉ UNIQUE : la query serveur tRPC
  // Le Switch lit EXCLUSIVEMENT depuis cette query.
  // Aucun AsyncStorage, aucun fallback local, aucun useState initial.
  const consentQuery = trpc.rewards.getConsent.useQuery(undefined, {
    enabled: isAuthenticated,
    // Refetch à chaque focus pour garantir la cohérence
    refetchOnWindowFocus: true,
    // Pas de cache stale : toujours frais
    staleTime: 0,
  });
  const updateConsentMutation = trpc.rewards.updateConsent.useMutation();

  // Valeurs dérivées DIRECTEMENT de la query serveur
  // Si la query n'a pas encore répondu, on affiche un état de chargement (pas de fallback local)
  const dataConsentGiven = consentQuery.data?.consentGiven ?? false;
  const rewardPoints = consentQuery.data?.rewardPoints ?? 0;
  const consentDataLoaded = consentQuery.isSuccess || !isAuthenticated;

  // Handler du Switch : mutation serveur + invalidation query + rollback
  const handleConsentToggle = useCallback(async (newValue: boolean) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour activer le programme de récompenses."
      );
      return;
    }

    const performUpdate = async (value: boolean) => {
      // Sauvegarder l'état serveur actuel pour rollback
      const previousData = consentQuery.data;
      setConsentLoading(true);

      // UI optimiste : mettre à jour le cache tRPC immédiatement
      trpcUtils.rewards.getConsent.setData(undefined, (old) => ({
        consentGiven: value,
        rewardPoints: old?.rewardPoints ?? 0,
        consentDate: old?.consentDate ?? null,
      }));

      try {
        // Mutation serveur (source de vérité)
        await updateConsentMutation.mutateAsync({ consentGiven: value });
        // Invalider et refetch depuis le serveur pour synchroniser
        await trpcUtils.rewards.getConsent.invalidate();
        showToast(
          value
            ? "Succès : Consentement activé. Vous gagnez des points !"
            : "Succès : Consentement retiré. Données supprimées.",
          "success"
        );
      } catch (error) {
        // ROLLBACK : restaurer le cache tRPC à l'état précédent
        if (previousData) {
          trpcUtils.rewards.getConsent.setData(undefined, () => previousData);
        } else {
          // Si pas de données précédentes, invalider pour refetch
          await trpcUtils.rewards.getConsent.invalidate();
        }
        showToast("Erreur : Impossible de mettre à jour le consentement.", "error");
      } finally {
        setConsentLoading(false);
      }
    };

    if (!newValue) {
      // Confirmation avant retrait (droit à l'oubli - Loi 25)
      Alert.alert(
        "Retrait du consentement",
        "Vos données anonymisées seront supprimées conformément à votre droit à l'oubli (Loi 25). La collecte cessera immédiatement.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Confirmer",
            style: "destructive",
            onPress: () => performUpdate(false),
          },
        ]
      );
    } else {
      await performUpdate(true);
    }
  }, [isAuthenticated, consentQuery.data, updateConsentMutation, trpcUtils, showToast]);

  // Utiliser le Context au lieu de useState locaux
  const {
    userName,
    monthlyIncome,
    savingsGoal,
    housingExpense,
    groceriesExpense,
    transportExpense,
    cellphoneExpense,
    servicesExpense,
    otherExpense,
    setUserName,
    setMonthlyIncome,
    setSavingsGoal,
    setHousingExpense,
    setGroceriesExpense,
    setTransportExpense,
    setCellphoneExpense,
    setServicesExpense,
    setOtherExpense,
  } = useUserContext();

  // Convertir savingsGoal (0.1) en pourcentage (10) pour l'affichage
  const savingsGoalPercent = savingsGoal * 100;

  useEffect(() => {
    loadNotificationPrefs();
  }, []);

  const loadNotificationPrefs = async () => {
    const prefs = await NotificationService.getPreferences();
    setNotificationsEnabled(prefs.enabled);
  };

  const updateSavingsGoal = async (percent: number) => {
    await setSavingsGoal(percent / 100); // Convertir 10 -> 0.1
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // const granted = await NotificationService.requestPermissions(); // Disabled to prevent Expo Go crash
      const granted = false;
      if (!granted) {
        alert("Veuillez activer les notifications dans les paramètres de votre appareil");
        return;
      }
    }
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await NotificationService.updatePreferences({ enabled: newValue });
  };

  // Données de démonstration
  const stats = {
    totalSaved: 1240,
    savingsGoal: 350,
    suggestionsApplied: 12,
    memberSince: "Janvier 2026",
  };

  const regions = [
    "Montréal",
    "Québec",
    "Laval",
    "Gatineau",
    "Longueuil",
    "Sherbrooke",
    "Saguenay",
    "Trois-Rivières",
  ];

  const [selectedRegion, setSelectedRegion] = useState("Montréal");

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête avec bouton retour */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Profil</Text>
          </View>

          {/* Champ Nom */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-2">Votre nom</Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Entrez votre nom ou prénom"
              placeholderTextColor={colors.muted}
              className="text-base text-foreground py-2"
              style={{ outlineStyle: 'none' } as any}
            />
          </View>

          {/* Configuration de base */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            <Text className="text-sm font-semibold text-foreground">Configuration de base</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Revenu mensuel</Text>
              <TextInput
                value={monthlyIncome.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setMonthlyIncome(value);
                }}
                placeholder="Ex: 3500"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>
          </View>

          {/* Dépenses mensuelles */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            <Text className="text-sm font-semibold text-foreground">Dépenses mensuelles</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted">Logement</Text>
              <TextInput
                value={housingExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setHousingExpense(value);
                }}
                placeholder="Ex: 1200"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Épicerie</Text>
              <TextInput
                value={groceriesExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setGroceriesExpense(value);
                }}
                placeholder="Ex: 450"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Transport</Text>
              <TextInput
                value={transportExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setTransportExpense(value);
                }}
                placeholder="Ex: 280"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Cellulaire</Text>
              <TextInput
                value={cellphoneExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setCellphoneExpense(value);
                }}
                placeholder="Ex: 85"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Services (Internet, streaming)</Text>
              <TextInput
                value={servicesExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setServicesExpense(value);
                }}
                placeholder="Ex: 120"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Autres</Text>
              <TextInput
                value={otherExpense.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setOtherExpense(value);
                }}
                placeholder="Ex: 330"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                className="text-base text-foreground py-2 px-3 bg-background rounded-lg border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>
          </View>

          {/* Avatar et info utilisateur */}
          <View className="items-center gap-3">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">Utilisateur Québec</Text>
              <Text className="text-sm text-muted">Membre depuis {stats.memberSince}</Text>
            </View>
          </View>

          {/* Statistiques globales */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-4">Vos performances</Text>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Économies totales</Text>
                <Text className="text-lg font-bold" style={{ color: colors.success }}>
                  {stats.totalSaved.toFixed(0)} $
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Suggestions appliquées</Text>
                <Text className="text-lg font-bold text-foreground">{stats.suggestionsApplied}</Text>
              </View>
            </View>
          </View>

          {/* Objectif d'épargne avec slider */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-2">Objectif d'épargne mensuel</Text>
            <Text className="text-2xl font-bold text-foreground mb-4">{savingsGoalPercent.toFixed(0)}%</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={25}
              step={1}
              value={savingsGoalPercent}
              onValueChange={updateSavingsGoal}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-muted">5%</Text>
              <Text className="text-xs text-muted">25%</Text>
            </View>
          </View>

          {/* Région */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-3">Région</Text>
            <View className="flex-row flex-wrap gap-2">
              {regions.map((region) => (
                <TouchableOpacity
                  key={region}
                  onPress={() => setSelectedRegion(region)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selectedRegion === region ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: selectedRegion === region ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selectedRegion === region ? "#FFFFFF" : colors.foreground,
                      fontSize: 14,
                    }}
                  >
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Paramètres */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-4">Paramètres</Text>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Notifications</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Mode sombre</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Programme de Récompenses via Données - Loi 25 Québec */}
          {/* Source de vérité : DB serveur via tRPC. Aucun AsyncStorage. */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: dataConsentGiven ? colors.success : colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">Programme de récompenses</Text>
              {rewardPoints > 0 && (
                <View style={{ backgroundColor: colors.success, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{rewardPoints} pts</Text>
                </View>
              )}
            </View>

            {/* Affichage conditionnel : chargement serveur ou Switch */}
            {isAuthenticated && !consentDataLoaded ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>Chargement du consentement...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ fontSize: 13, color: colors.foreground, flex: 1, marginRight: 12 }}>
                  Partager mes données anonymisées
                </Text>
                <Switch
                  value={dataConsentGiven}
                  disabled={consentLoading || (!isAuthenticated)}
                  onValueChange={handleConsentToggle}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor={Platform.OS === "android" ? (dataConsentGiven ? colors.success : "#f4f3f4") : "#FFFFFF"}
                />
              </View>
            )}

            {!isAuthenticated && (
              <Text style={{ fontSize: 12, color: colors.warning, marginBottom: 8, fontWeight: '600' }}>
                Connexion requise pour activer ce programme.
              </Text>
            )}

            <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 16 }}>
              J'accepte de partager mes données d'achat de façon anonyme (sans mon nom ni mes infos personnelles) à des fins d'analyse de marché en échange de points récompenses. Je peux retirer ce consentement à tout moment.
            </Text>

            {dataConsentGiven && (
              <View style={{ marginTop: 12, backgroundColor: colors.background, borderRadius: 8, padding: 12 }}>
                <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>
                  Programme actif • Vos données sont anonymisées (SHA-256)
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
                  Seuls le montant, la catégorie et la ville sont conservés. Aucune information personnelle n'est partagée.
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={async () => {
                try {
                  await PDFExportService.generateMonthlyReport({
                    month: new Date().toLocaleString('fr-CA', { month: 'long' }),
                    year: new Date().getFullYear(),
                    totalSaved: monthlyIncome - (housingExpense + groceriesExpense + transportExpense + cellphoneExpense + servicesExpense + otherExpense),
                    savingsGoal: monthlyIncome * savingsGoal,
                    percentageAchieved: ((monthlyIncome - (housingExpense + groceriesExpense + transportExpense + cellphoneExpense + servicesExpense + otherExpense)) / (monthlyIncome * savingsGoal)) * 100,
                    categories: [
                      { name: 'Logement', amount: housingExpense, percentage: (housingExpense / monthlyIncome) * 100 },
                      { name: 'Épicerie', amount: groceriesExpense, percentage: (groceriesExpense / monthlyIncome) * 100 },
                      { name: 'Transport', amount: transportExpense, percentage: (transportExpense / monthlyIncome) * 100 },
                      { name: 'Cellulaire', amount: cellphoneExpense, percentage: (cellphoneExpense / monthlyIncome) * 100 },
                      { name: 'Services', amount: servicesExpense, percentage: (servicesExpense / monthlyIncome) * 100 },
                      { name: 'Autres', amount: otherExpense, percentage: (otherExpense / monthlyIncome) * 100 },
                    ],
                    suggestions: [],
                  });
                  Alert.alert("Succès", "Le rapport PDF a été généré avec succès");
                } catch (error) {
                  Alert.alert("Erreur", "Impossible de générer le rapport PDF");
                }
              }}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
                Exporter rapport mensuel (PDF)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/tax-calculator")}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-base font-semibold text-foreground">Calculateur de crédits d'impôt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/profile-i18n")}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-base font-semibold text-foreground">Changer de langue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Déconnexion",
                  "Êtes-vous sûr de vouloir vous déconnecter ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Déconnexion", style: "destructive", onPress: () => { } },
                  ]
                );
              }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.error,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.error }}>
                Déconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Toast notification */}
      {toastMessage && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: toastType === "success" ? colors.success : colors.error,
            borderRadius: 12,
            padding: 14,
            opacity: toastOpacity,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600", textAlign: "center" }}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </ScreenContainer>
  );
}
