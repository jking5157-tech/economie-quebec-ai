import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table des groupes familiaux pour le partage de budget
 */
export const familyGroups = mysqlTable("family_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  ownerId: int("ownerId").notNull(), // Créateur du groupe
  monthlyIncome: decimal("monthlyIncome", { precision: 10, scale: 2 }),
  savingsGoal: decimal("savingsGoal", { precision: 5, scale: 2 }), // Pourcentage (0.10 = 10%)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyGroup = typeof familyGroups.$inferSelect;
export type InsertFamilyGroup = typeof familyGroups.$inferInsert;

/**
 * Table des membres des groupes familiaux
 */
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

/**
 * Table des invitations aux groupes familiaux
 */
export const familyInvitations = mysqlTable("family_invitations", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  invitedEmail: varchar("invitedEmail", { length: 320 }).notNull(),
  invitedBy: int("invitedBy").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type FamilyInvitation = typeof familyInvitations.$inferSelect;
export type InsertFamilyInvitation = typeof familyInvitations.$inferInsert;

// Tables pour les données utilisateur

/**
 * Table des documents scannés par l'utilisateur
 */
export const scannedDocuments = mysqlTable("scanned_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: varchar("documentType", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  imageUrl: text("imageUrl"),
  extractedData: json("extractedData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Table des suggestions d'économies
 */
export const suggestions = mysqlTable("suggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  savings: decimal("savings", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Table des préférences utilisateur
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  region: varchar("region", { length: 100 }).notNull(),
  savingsGoal: decimal("savingsGoal", { precision: 5, scale: 2 }).notNull(),
  monthlyIncome: decimal("monthlyIncome", { precision: 10, scale: 2 }).notNull(),
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  darkMode: boolean("darkMode").default(false).notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Table de l'historique de chat
 */
export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

/**
 * Table des transactions bancaires
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: varchar("accountId", { length: 100 }),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }),
  vendor: varchar("vendor", { length: 255 }),
  isRecurring: boolean("isRecurring").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Table des rappels intelligents
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reminderType: varchar("reminderType", { length: 50 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  isRecurring: boolean("isRecurring").default(false),
  recurrencePattern: varchar("recurrencePattern", { length: 50 }),
  notificationSent: boolean("notificationSent").default(false),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Table du consentement utilisateur pour le programme de récompenses
 * Conforme à la Loi 25 du Québec - consentement explicite requis
 */
export const userConsent = mysqlTable("user_consent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  consentGiven: boolean("consentGiven").default(false).notNull(),
  consentDate: timestamp("consentDate"),
  withdrawalDate: timestamp("withdrawalDate"),
  rewardPoints: int("rewardPoints").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserConsent = typeof userConsent.$inferSelect;
export type InsertUserConsent = typeof userConsent.$inferInsert;

/**
 * Table des données de marché anonymisées
 * Les données personnelles sont hachées en SHA-256
 * Seuls le montant, la catégorie et la ville sont conservés en clair
 */
export const anonymousMarketData = mysqlTable("anonymous_market_data", {
  id: int("id").autoincrement().primaryKey(),
  hashedUserId: varchar("hashedUserId", { length: 64 }).notNull(), // SHA-256 du userId
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  inventory: json("inventory"),
  transactionMonth: varchar("transactionMonth", { length: 7 }).notNull(), // YYYY-MM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnonymousMarketData = typeof anonymousMarketData.$inferSelect;
export type InsertAnonymousMarketData = typeof anonymousMarketData.$inferInsert;

/**
 * Table des comptes bancaires connectés
 */
export const connectedAccounts = mysqlTable("connected_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  institutionName: varchar("institutionName", { length: 255 }).notNull(),
  accountType: varchar("accountType", { length: 50 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 100 }),
  balance: decimal("balance", { precision: 10, scale: 2 }),
  lastSynced: timestamp("lastSynced"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
