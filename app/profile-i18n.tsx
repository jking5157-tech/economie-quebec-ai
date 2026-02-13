import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { saveLanguage } from "@/lib/i18n";

export default function ProfileI18nScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      await saveLanguage(lang);
      setCurrentLanguage(lang);
      
      // Afficher un message de confirmation
      Alert.alert(
        lang === 'fr' ? 'Langue modifiée' : 'Language changed',
        lang === 'fr' 
          ? 'La langue a été changée en français. Redémarrez l\'application pour appliquer tous les changements.'
          : 'Language has been changed to English. Restart the app to apply all changes.',
        [
          {
            text: lang === 'fr' ? 'OK' : 'OK',
            onPress: () => {
              // Sur Expo Go, on ne peut pas redémarrer automatiquement
              // L'utilisateur devra fermer et rouvrir l'app
              if (__DEV__) {
                console.log('Language changed to:', lang);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Données de démonstration
  const stats = {
    totalSaved: 1240,
    savingsGoal: 350,
    suggestionsApplied: 12,
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête avec bouton retour */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">{t('profile.title')}</Text>
          </View>

          {/* Statistiques globales */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">{t('profile.statistics')}</Text>
            
            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted">{t('profile.totalSaved')}</Text>
                <Text className="text-2xl font-bold text-foreground">{stats.totalSaved} $</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-muted">{t('profile.goalAchieved')}</Text>
                <Text className="text-2xl font-bold text-primary">{stats.savingsGoal} $</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-muted">{t('profile.suggestionsApplied')}</Text>
                <Text className="text-2xl font-bold text-foreground">{stats.suggestionsApplied}</Text>
              </View>
            </View>
          </View>

          {/* Paramètres */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">{t('profile.settings')}</Text>
            
            <View className="gap-4">
              {/* Sélecteur de langue */}
              <View>
                <Text className="text-muted mb-3">{t('profile.language')}</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => changeLanguage('fr')}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: currentLanguage === 'fr' ? colors.primary : colors.border,
                      backgroundColor: currentLanguage === 'fr' ? colors.primary + '20' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        color: currentLanguage === 'fr' ? colors.primary : colors.foreground,
                      }}
                    >
                      🇫🇷 Français
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => changeLanguage('en')}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: currentLanguage === 'en' ? colors.primary : colors.border,
                      backgroundColor: currentLanguage === 'en' ? colors.primary + '20' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        color: currentLanguage === 'en' ? colors.primary : colors.foreground,
                      }}
                    >
                      🇬🇧 English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Région */}
              <View>
                <Text className="text-muted mb-3">{t('profile.region')}</Text>
                <View
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text className="text-foreground">Montréal</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bouton retour à l'accueil */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.background, fontWeight: '600', fontSize: 16 }}>
              {t('common.back')} {t('tabs.home')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
