import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";

type BankAccount = {
  id: string;
  institutionName: string;
  accountType: "checking" | "savings" | "credit_card";
  accountNumber: string; // Masqué
  balance: number;
  lastSynced: Date;
  isActive: boolean;
};

export default function BankAccountsScreen() {
  const colors = useColors();
  const router = useRouter();

  // Données de démonstration
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      institutionName: "Desjardins",
      accountType: "checking",
      accountNumber: "****1234",
      balance: 2450.75,
      lastSynced: new Date(),
      isActive: true,
    },
    {
      id: "2",
      institutionName: "RBC",
      accountType: "credit_card",
      accountNumber: "****5678",
      balance: -850.25,
      lastSynced: new Date(Date.now() - 3600000), // Il y a 1h
      isActive: true,
    },
  ]);

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "checking":
        return "Compte chèques";
      case "savings":
        return "Compte épargne";
      case "credit_card":
        return "Carte de crédit";
      default:
        return type;
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
      case "savings":
        return "dollarsign.circle.fill";
      case "credit_card":
        return "creditcard.fill";
      default:
        return "dollarsign.circle.fill";
    }
  };

  const handleSync = (accountId: string) => {
    // Simuler une synchronisation
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, lastSynced: new Date() } : acc
      )
    );
  };

  const handleAddAccount = () => {
    // Ouvrir l'interface de connexion bancaire
    alert(
      "Connexion bancaire\n\nPour connecter votre compte bancaire, nous utiliserions une API comme Plaid ou Flinks qui permet de se connecter de manière sécurisée aux institutions financières québécoises.\n\nCette fonctionnalité nécessite une intégration avec un fournisseur tiers."
    );
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
              <Text className="text-3xl font-bold text-foreground">Comptes bancaires</Text>
              <Text className="text-sm text-muted">Gérez vos comptes connectés</Text>
            </View>
          </View>

          {/* Résumé */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                Synchronisation automatique
              </Text>
            </View>
            <Text className="text-sm text-foreground">
              Vos comptes sont synchronisés automatiquement pour détecter les opportunités
              d'économies et suivre votre budget en temps réel.
            </Text>
          </View>

          {/* Liste des comptes */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Comptes connectés</Text>
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colors.primary + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconSymbol
                        name={getAccountIcon(item.accountType)}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View className="flex-1 gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-foreground">
                          {item.institutionName}
                        </Text>
                        <View
                          style={{
                            backgroundColor: item.isActive
                              ? colors.success + "20"
                              : colors.error + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color: item.isActive ? colors.success : colors.error,
                            }}
                          >
                            {item.isActive ? "Actif" : "Inactif"}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-muted">
                        {getAccountTypeLabel(item.accountType)} • {item.accountNumber}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-xl font-bold"
                          style={{
                            color:
                              item.balance >= 0 ? colors.success : colors.error,
                          }}
                        >
                          {item.balance >= 0 ? "" : "-"}
                          {Math.abs(item.balance).toFixed(2)} $
                        </Text>
                        <Text className="text-xs text-muted">
                          Sync: {item.lastSynced.toLocaleTimeString("fr-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleSync(item.id)}
                        style={{
                          backgroundColor: colors.primary,
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <Text className="text-sm font-semibold text-white">
                          Synchroniser maintenant
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>

          {/* Bouton ajouter un compte */}
          <TouchableOpacity
            onPress={handleAddAccount}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: colors.primary,
              borderStyle: "dashed",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconSymbol name="plus.circle.fill" size={40} color={colors.primary} />
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              Ajouter un compte bancaire
            </Text>
            <Text className="text-sm text-muted text-center">
              Connectez vos comptes Desjardins, RBC, BMO, TD, etc.
            </Text>
          </TouchableOpacity>

          {/* Institutions supportées */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Institutions supportées
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "Desjardins",
                "RBC",
                "BMO",
                "TD",
                "Banque Nationale",
                "CIBC",
                "Scotiabank",
                "Tangerine",
              ].map((bank) => (
                <View
                  key={bank}
                  style={{
                    backgroundColor: colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text className="text-xs text-foreground">{bank}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
