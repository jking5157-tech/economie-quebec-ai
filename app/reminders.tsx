import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ReminderService, type Reminder } from "@/lib/reminder-service";

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const active = await ReminderService.getActiveReminders();
    const overdue = await ReminderService.getOverdueReminders();
    setActiveReminders(active);
    setOverdueReminders(overdue);
  };

  const handleComplete = async (id: string) => {
    await ReminderService.completeReminder(id);
    await loadReminders();
  };

  const handleDelete = async (id: string) => {
    await ReminderService.deleteReminder(id);
    await loadReminders();
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "tax_credit":
        return "dollarsign.circle.fill";
      case "insurance":
        return "shield.fill";
      case "bill_payment":
        return "creditcard.fill";
      case "savings_milestone":
        return "chart.bar.fill";
      default:
        return "bell.fill";
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case "tax_credit":
        return colors.success;
      case "insurance":
        return colors.primary;
      case "bill_payment":
        return colors.warning;
      case "savings_milestone":
        return colors.success;
      default:
        return colors.foreground;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-CA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderReminder = (reminder: Reminder, isOverdue: boolean = false) => (
    <View
      key={reminder.id}
      style={{
        backgroundColor: isOverdue ? colors.error + "10" : colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: isOverdue ? colors.error : colors.border,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: getReminderColor(reminder.reminderType) + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol
            name={getReminderIcon(reminder.reminderType)}
            size={24}
            color={getReminderColor(reminder.reminderType)}
          />
        </View>
        <View className="flex-1 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">{reminder.title}</Text>
            {reminder.isRecurring && (
              <View
                style={{
                  backgroundColor: colors.primary + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                  Récurrent
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-muted">{reminder.description}</Text>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text className="text-sm text-muted">{formatDate(reminder.dueDate)}</Text>
          </View>
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={() => handleComplete(reminder.id)}
              style={{
                flex: 1,
                backgroundColor: colors.success,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text className="text-sm font-semibold text-white">Marquer comme fait</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(reminder.id)}
              style={{
                backgroundColor: colors.error + "20",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

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
              <Text className="text-3xl font-bold text-foreground">Rappels</Text>
              <Text className="text-sm text-muted">
                {activeReminders.length + overdueReminders.length} rappels actifs
              </Text>
            </View>
          </View>

          {/* Rappels en retard */}
          {overdueReminders.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
                <Text className="text-base font-semibold" style={{ color: colors.error }}>
                  En retard ({overdueReminders.length})
                </Text>
              </View>
              <FlatList
                data={overdueReminders}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => renderReminder(item, true)}
              />
            </View>
          )}

          {/* Rappels à venir */}
          {activeReminders.length > 0 && (
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">
                À venir ({activeReminders.length})
              </Text>
              <FlatList
                data={activeReminders}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => renderReminder(item)}
              />
            </View>
          )}

          {/* Message si aucun rappel */}
          {activeReminders.length === 0 && overdueReminders.length === 0 && (
            <View className="flex-1 items-center justify-center gap-4">
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="bell.fill" size={60} color={colors.muted} />
              </View>
              <Text className="text-lg font-semibold text-foreground">Aucun rappel</Text>
              <Text className="text-sm text-muted text-center">
                Les rappels automatiques seront créés en fonction de vos transactions et dates
                importantes.
              </Text>
            </View>
          )}

          {/* Bouton pour créer des rappels automatiques */}
          <TouchableOpacity
            onPress={async () => {
              await ReminderService.createAutomaticReminders();
              await loadReminders();
            }}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text className="text-base font-semibold text-white">
              Créer des rappels automatiques
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
