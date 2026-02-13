// NotificationService désactivé pour éviter les crashs sur Expo Go
// import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReminderType =
  | "tax_credit"
  | "insurance"
  | "bill_payment"
  | "savings_milestone"
  | "custom";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly" | "none";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  reminderType: ReminderType;
  dueDate: Date;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  notificationSent: boolean;
  completed: boolean;
  createdAt: Date;
}

const REMINDERS_KEY = "@reminders";

export class ReminderService {
  /**
   * Créer un nouveau rappel
   */
  static async createReminder(reminder: Omit<Reminder, "id" | "createdAt">): Promise<Reminder> {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const reminders = await this.getAllReminders();
    reminders.push(newReminder);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));

    // Planifier la notification (Désactivé pour Expo Go)
    await this.scheduleNotification(newReminder);

    return newReminder;
  }

  /**
   * Récupérer tous les rappels
   */
  static async getAllReminders(): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_KEY);
      if (!data) return [];

      const reminders = JSON.parse(data);
      // Convertir les dates string en objets Date
      return reminders.map((r: any) => ({
        ...r,
        dueDate: new Date(r.dueDate),
        createdAt: new Date(r.createdAt),
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des rappels:", error);
      return [];
    }
  }

  /**
   * Récupérer les rappels actifs (non complétés et à venir)
   */
  static async getActiveReminders(): Promise<Reminder[]> {
    const allReminders = await this.getAllReminders();
    return allReminders.filter((r) => !r.completed && r.dueDate >= new Date());
  }

  /**
   * Récupérer les rappels en retard
   */
  static async getOverdueReminders(): Promise<Reminder[]> {
    const allReminders = await this.getAllReminders();
    return allReminders.filter((r) => !r.completed && r.dueDate < new Date());
  }

  /**
   * Marquer un rappel comme complété
   */
  static async completeReminder(id: string): Promise<void> {
    const reminders = await this.getAllReminders();
    const index = reminders.findIndex((r) => r.id === id);

    if (index !== -1) {
      reminders[index].completed = true;

      // Si récurrent, créer le prochain rappel
      if (reminders[index].isRecurring && reminders[index].recurrencePattern) {
        const nextReminder = this.createRecurringReminder(reminders[index]);
        reminders.push(nextReminder);
        await this.scheduleNotification(nextReminder);
      }

      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    }
  }

  /**
   * Supprimer un rappel
   */
  static async deleteReminder(id: string): Promise<void> {
    const reminders = await this.getAllReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));

    // Annuler la notification (Désactivé)
    // await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Créer le prochain rappel récurrent
   */
  private static createRecurringReminder(reminder: Reminder): Reminder {
    const nextDueDate = new Date(reminder.dueDate);

    switch (reminder.recurrencePattern) {
      case "daily":
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case "weekly":
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case "monthly":
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case "yearly":
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
    }

    return {
      ...reminder,
      id: Date.now().toString(),
      dueDate: nextDueDate,
      completed: false,
      notificationSent: false,
      createdAt: new Date(),
    };
  }

  /**
   * Planifier une notification pour un rappel
   */
  private static async scheduleNotification(reminder: Reminder): Promise<void> {
    // Stub pour Expo Go - Ne fait rien
    console.log("Notification scheduled (stubbed):", reminder.title);
  }

  /**
   * Créer des rappels automatiques basés sur le profil utilisateur
   */
  static async createAutomaticReminders(): Promise<void> {
    const now = new Date();

    // Rappel pour la déclaration d'impôts (30 avril)
    const taxDeadline = new Date(now.getFullYear(), 3, 30); // Avril = 3
    if (taxDeadline > now) {
      await this.createReminder({
        title: "Déclaration d'impôts",
        description:
          "N'oubliez pas de soumettre votre déclaration d'impôts avant le 30 avril pour éviter les pénalités.",
        reminderType: "tax_credit",
        dueDate: taxDeadline,
        isRecurring: true,
        recurrencePattern: "yearly",
        notificationSent: false,
        completed: false,
      });
    }

    // Rappel pour les crédits d'impôt trimestriels (TPS/TVQ)
    const nextQuarter = new Date(now);
    nextQuarter.setMonth(Math.ceil((now.getMonth() + 1) / 3) * 3);
    nextQuarter.setDate(1);

    await this.createReminder({
      title: "Crédits TPS/TVQ",
      description:
        "Vérifiez si vous êtes éligible aux crédits de TPS et de solidarité du Québec.",
      reminderType: "tax_credit",
      dueDate: nextQuarter,
      isRecurring: true,
      recurrencePattern: "monthly",
      notificationSent: false,
      completed: false,
    });

    // Rappel pour renouvellement d'assurance auto (1er mars)
    const insuranceRenewal = new Date(now.getFullYear(), 2, 1); // Mars = 2
    if (insuranceRenewal < now) {
      insuranceRenewal.setFullYear(insuranceRenewal.getFullYear() + 1);
    }

    await this.createReminder({
      title: "Renouvellement assurance auto",
      description:
        "C'est le moment de comparer les prix des assurances auto pour économiser.",
      reminderType: "insurance",
      dueDate: insuranceRenewal,
      isRecurring: true,
      recurrencePattern: "yearly",
      notificationSent: false,
      completed: false,
    });
  }

  /**
   * Détecter automatiquement les dates importantes depuis les transactions
   */
  static async detectImportantDates(transactions: any[]): Promise<Reminder[]> {
    const detectedReminders: Reminder[] = [];

    // Détecter les factures récurrentes (électricité, internet, etc.)
    const recurringTransactions = transactions.filter((t) => t.isRecurring);

    for (const transaction of recurringTransactions) {
      const nextDueDate = new Date(transaction.date);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const reminder = await this.createReminder({
        title: `Paiement: ${transaction.vendor}`,
        description: `Facture récurrente de ${transaction.amount.toFixed(2)} $ à payer.`,
        reminderType: "bill_payment",
        dueDate: nextDueDate,
        isRecurring: true,
        recurrencePattern: "monthly",
        notificationSent: false,
        completed: false,
      });

      detectedReminders.push(reminder);
    }

    return detectedReminders;
  }
}
