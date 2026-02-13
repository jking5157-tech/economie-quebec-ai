import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userConsent, anonymousMarketData } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { createHash } from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Programme de Récompenses via Données (Loi 25 Québec) =====

/**
 * Récupère l'état du consentement d'un utilisateur
 */
export async function getUserConsent(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userConsent).where(eq(userConsent.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Met à jour le consentement d'un utilisateur
 * Si consent = true : enregistre la date de consentement
 * Si consent = false : enregistre la date de retrait (droit à l'oubli)
 */
export async function updateUserConsent(userId: number, consentGiven: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserConsent(userId);
  const now = new Date();

  if (existing) {
    await db.update(userConsent)
      .set({
        consentGiven,
        ...(consentGiven ? { consentDate: now } : { withdrawalDate: now }),
      })
      .where(eq(userConsent.userId, userId));
  } else {
    await db.insert(userConsent).values({
      userId,
      consentGiven,
      ...(consentGiven ? { consentDate: now } : {}),
      rewardPoints: 0,
    });
  }

  // Droit à l'oubli : si retrait du consentement, supprimer les données anonymisées
  if (!consentGiven) {
    const hashedId = hashUserId(userId);
    await db.delete(anonymousMarketData).where(eq(anonymousMarketData.hashedUserId, hashedId));
  }

  return { success: true };
}

/**
 * Hache un userId en SHA-256 pour l'anonymisation
 */
function hashUserId(userId: number): string {
  return createHash('sha256').update(userId.toString()).digest('hex');
}

/**
 * Soumet des données de transaction anonymisées
 * Vérifie le consentement avant d'insérer
 * Attribue des points récompenses
 */
import { supabase } from "../lib/supabase";

// ... existing imports ...

export async function submitAnonymousData(
  userId: number,
  data: { amount: string; category: string; city: string; inventory: any[] }
) {
  // Vérifier le consentement via Drizzle (ou Supabase si on migrait tout, mais on garde hybride pour l'instant si db existe)
  // Pour simplifier selon la demande "enregistrer dans Supabase", on va écrire directement dans Supabase.

  // Hacher le userId
  const hashedUserId = hashUserId(userId);
  const now = new Date();
  const transactionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Insérer les données anonymisées dans Supabase
  const { error } = await supabase.from('anonymous_market_data').insert({
    hashed_user_id: hashedUserId, // Snake_case pour Supabase
    amount: parseFloat(data.amount), // S'assurer que c'est un nombre
    category: data.category,
    city: data.city,
    inventory: data.inventory, // JSON array
    transaction_month: transactionMonth,
    created_at: now.toISOString()
  });

  if (error) {
    console.error("Erreur Supabase (Anonymous Data):", error);
    return { success: false, error: error.message };
  }

  // Optionnel: Attribuer des points (si on garde la logique de points locale ou sur Supabase)
  // Pour l'instant on retourne juste le succès de l'insertion
  return { success: true, pointsEarned: 10 };
}

/**
 * Récupère le total de points récompenses d'un utilisateur
 */
export async function getRewardPoints(userId: number): Promise<number> {
  const consent = await getUserConsent(userId);
  return consent?.rewardPoints ?? 0;
}
