import { ScrollView, Text, View, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function FamilyGroupScreen() {
  const colors = useColors();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [hasGroup, setHasGroup] = useState(false);

  // Données de démonstration
  const [group, setGroup] = useState({
    name: "Famille Tremblay",
    monthlyIncome: 7500,
    savingsGoal: 10,
    totalSaved: 820,
    members: [
      {
        id: "1",
        name: "Marie Tremblay",
        email: "marie@example.com",
        role: "owner",
        contribution: 450,
      },
      {
        id: "2",
        name: "Jean Tremblay",
        email: "jean@example.com",
        role: "member",
        contribution: 370,
      },
    ],
    sharedExpenses: [
      { id: "1", category: "Épicerie", amount: 650, month: "Février" },
      { id: "2", category: "Hydro-Québec", amount: 145, month: "Février" },
      { id: "3", category: "Internet", amount: 85, month: "Février" },
    ],
  });

  const createGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom pour le groupe");
      return;
    }
    setHasGroup(true);
    setGroup({
      ...group,
      name: groupName,
    });
    Alert.alert("Succès", `Groupe "${groupName}" créé avec succès !`);
  };

  const inviteMember = () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email");
      return;
    }
    Alert.alert(
      "Invitation envoyée",
      `Une invitation a été envoyée à ${inviteEmail}. Le membre pourra rejoindre le groupe en acceptant l'invitation.`
    );
    setInviteEmail("");
  };

  const renderCreateGroup = () => (
    <View className="flex-1 gap-6">
      <View className="items-center gap-4">
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.primary + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol name="person.3.fill" size={60} color={colors.primary} />
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-foreground">Créer un groupe familial</Text>
          <Text className="text-sm text-muted text-center mt-2">
            Partagez votre budget et vos objectifs d'économies avec votre famille
          </Text>
        </View>
      </View>

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
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Nom du groupe</Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Ex: Famille Tremblay"
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

        <TouchableOpacity
          onPress={createGroup}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text className="text-base font-semibold text-white">Créer le groupe</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: colors.primary + "10",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text className="text-sm text-foreground">
          <Text className="font-bold">Avantages :</Text> Suivez les dépenses communes, partagez les
          objectifs d'économies, et recevez des suggestions personnalisées pour toute la famille.
        </Text>
      </View>
    </View>
  );

  const renderGroupDashboard = () => (
    <View className="flex-1 gap-6">
      {/* En-tête du groupe */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <Text className="text-lg font-bold text-white">{group.name}</Text>
        <View className="flex-row items-center justify-between mt-4">
          <View>
            <Text className="text-xs text-white opacity-80">Revenu familial</Text>
            <Text className="text-2xl font-bold text-white">{group.monthlyIncome} $</Text>
          </View>
          <View>
            <Text className="text-xs text-white opacity-80">Objectif ({group.savingsGoal}%)</Text>
            <Text className="text-2xl font-bold text-white">
              {((group.monthlyIncome * group.savingsGoal) / 100).toFixed(0)} $
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: 4,
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${(group.totalSaved / ((group.monthlyIncome * group.savingsGoal) / 100)) * 100}%`,
              height: "100%",
              backgroundColor: "#FFFFFF",
            }}
          />
        </View>
        <Text className="text-xs text-white opacity-80 mt-2">
          {group.totalSaved} $ économisés ce mois-ci
        </Text>
      </View>

      {/* Membres */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">
            Membres ({group.members.length})
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary + "20",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              + Inviter
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={group.members}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View className="flex-row items-center gap-3">
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
                  <IconSymbol name="person.fill" size={24} color={colors.primary} />
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                    {item.role === "owner" && (
                      <View
                        style={{
                          backgroundColor: colors.warning + "20",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text className="text-xs font-medium" style={{ color: colors.warning }}>
                          Propriétaire
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-muted">{item.email}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted">Contribution</Text>
                <Text className="text-lg font-bold" style={{ color: colors.success }}>
                  {item.contribution} $
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Dépenses partagées */}
      <View className="gap-3">
        <Text className="text-base font-semibold text-foreground">Dépenses partagées</Text>
        <FlatList
          data={group.sharedExpenses}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text className="text-base font-semibold text-foreground">{item.category}</Text>
                <Text className="text-sm text-muted">{item.month}</Text>
              </View>
              <Text className="text-lg font-bold text-foreground">{item.amount} $</Text>
            </View>
          )}
        />
      </View>

      {/* Inviter un membre */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 12,
        }}
      >
        <Text className="text-sm font-semibold text-foreground">Inviter un membre</Text>
        <TextInput
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="Email du membre"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <TouchableOpacity
          onPress={inviteMember}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text className="text-base font-semibold text-white">Envoyer l'invitation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête avec bouton retour */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol
                name="chevron.left.forwardslash.chevron.right"
                size={24}
                color={colors.foreground}
              />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Groupe familial</Text>
          </View>

          {hasGroup ? renderGroupDashboard() : renderCreateGroup()}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
