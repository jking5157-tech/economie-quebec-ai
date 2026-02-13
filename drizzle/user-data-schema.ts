import { pgTable, serial, integer, varchar, text, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core";

/**
 * Table des documents scannés par l'utilisateur
 */
export const scannedDocuments = pgTable("scanned_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Référence à l'utilisateur
  documentType: varchar("document_type", { length: 50 }).notNull(), // facture, releve-bancaire, carte-credit
  date: timestamp("date").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // analysé, en cours, erreur
  imageUrl: text("image_url"), // URL S3 de l'image
  extractedData: jsonb("extracted_data"), // Données extraites par l'AI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Table des suggestions d'économies
 */
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // impots, cellulaire, epicerie, services, energie
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  savings: decimal("savings", { precision: 10, scale: 2 }).notNull(), // Montant d'économies en $
  status: varchar("status", { length: 20 }).notNull(), // active, appliquee, ignoree
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Table des préférences utilisateur
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  region: varchar("region", { length: 100 }).notNull(),
  savingsGoal: decimal("savings_goal", { precision: 5, scale: 2 }).notNull(), // Pourcentage (0.10 = 10%)
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  darkMode: boolean("dark_mode").default(false).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Table de l'historique de chat avec l'assistant AI
 */
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

/**
 * Table des transactions bancaires importées
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: varchar("account_id", { length: 100 }), // ID du compte bancaire
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }), // Catégorie détectée automatiquement
  vendor: varchar("vendor", { length: 255 }), // Commerçant
  isRecurring: boolean("is_recurring").default(false), // Facture récurrente détectée
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Table des rappels intelligents
 */
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // tax_credit, insurance, bill_payment, custom
  dueDate: timestamp("due_date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: varchar("recurrence_pattern", { length: 50 }), // monthly, yearly, etc.
  notificationSent: boolean("notification_sent").default(false),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Table des comptes bancaires connectés
 */
export const connectedAccounts = pgTable("connected_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(), // Desjardins, RBC, etc.
  accountType: varchar("account_type", { length: 50 }).notNull(), // checking, savings, credit_card
  accountNumber: varchar("account_number", { length: 100 }), // Masqué (ex: ****1234)
  balance: decimal("balance", { precision: 10, scale: 2 }),
  lastSynced: timestamp("last_synced"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
