// NotificationService désactivé pour éviter les crashs sur Expo Go
// import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { StorageService } from "./storage";

export type NotificationType =
  | "new_suggestion"
  | "budget_exceeded"
  | "tax_credit_reminder"
  | "savings_milestone";

export interface NotificationPreferences {
  enabled: boolean;
  newSuggestions: boolean;
  budgetAlerts: boolean;
  taxReminders: boolean;
  savingsMilestones: boolean;
}

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    return false;
  },

  async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    triggerSeconds: number = 0
  ): Promise<string | null> {
    console.log("Notification skipped (Expo Go):", title);
    return null;
  },

  async notifyNewSuggestion(savingsAmount: number, category: string) {
    console.log("notifyNewSuggestion skipped");
  },

  async notifyBudgetExceeded(category: string, amount: number, budget: number) {
    console.log("notifyBudgetExceeded skipped");
  },

  async notifyTaxCreditReminder(creditName: string, amount: number, deadline: string) {
    console.log("notifyTaxCreditReminder skipped");
  },

  async notifySavingsMilestone(totalSaved: number, goal: number) {
    console.log("notifySavingsMilestone skipped");
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return {
      enabled: false,
      newSuggestions: false,
      budgetAlerts: false,
      taxReminders: false,
      savingsMilestones: false,
    };
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    console.log("updatePreferences skipped");
  },

  async cancelAllNotifications() {
    console.log("cancelAllNotifications skipped");
  },

  async getScheduledNotifications() {
    return [];
  },
};
