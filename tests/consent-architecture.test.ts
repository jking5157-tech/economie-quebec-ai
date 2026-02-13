import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Tests de non-régression architecturale — Consentement (Loi 25 Québec)
 *
 * OBJECTIF : Garantir que le consentement légal n'est JAMAIS stocké
 * ou influencé par AsyncStorage ou tout autre état local.
 *
 * Source de vérité UNIQUE = base de données serveur via tRPC.
 *
 * Ces tests analysent le code source statiquement pour détecter
 * toute violation de cette contrainte architecturale.
 */

const PROFILE_PATH = join(__dirname, "..", "app", "profile.tsx");

function readProfileSource(): string {
  return readFileSync(PROFILE_PATH, "utf-8");
}

describe("Architecture Consentement — Non-régression (Loi 25 Québec)", () => {
  const source = readProfileSource();

  it("NE DOIT PAS importer AsyncStorage dans profile.tsx", () => {
    // Vérifier qu'il n'y a aucun import d'AsyncStorage
    const importPattern = /import\s+.*AsyncStorage.*from\s+['"]@react-native-async-storage\/async-storage['"]/;
    expect(source).not.toMatch(importPattern);
  });

  it("NE DOIT PAS utiliser AsyncStorage.getItem pour le consentement", () => {
    // Vérifier qu'il n'y a aucun appel getItem
    const getItemPattern = /AsyncStorage\.getItem\s*\(/;
    expect(source).not.toMatch(getItemPattern);
  });

  it("NE DOIT PAS utiliser AsyncStorage.setItem pour le consentement", () => {
    // Vérifier qu'il n'y a aucun appel setItem
    const setItemPattern = /AsyncStorage\.setItem\s*\(/;
    expect(source).not.toMatch(setItemPattern);
  });

  it("NE DOIT PAS stocker @consent_given dans le stockage local", () => {
    // Vérifier qu'aucune clé de stockage local liée au consentement n'existe
    expect(source).not.toContain("@consent_given");
  });

  it("NE DOIT PAS stocker @reward_points dans le stockage local", () => {
    expect(source).not.toContain("@reward_points");
  });

  it("NE DOIT PAS avoir de useState initial pour dataConsentGiven", () => {
    // Le consentement ne doit pas avoir de valeur initiale locale (useState(false) ou useState(true))
    // Il doit être dérivé directement de la query serveur
    const localConsentState = /const\s+\[dataConsentGiven,\s*setDataConsentGiven\]\s*=\s*useState/;
    expect(source).not.toMatch(localConsentState);
  });

  it("NE DOIT PAS avoir de useState initial pour rewardPoints", () => {
    const localPointsState = /const\s+\[rewardPoints,\s*setRewardPoints\]\s*=\s*useState/;
    expect(source).not.toMatch(localPointsState);
  });

  it("DOIT dériver dataConsentGiven depuis consentQuery.data", () => {
    // Le consentement doit être lu depuis la query serveur
    const derivedFromQuery = /const\s+dataConsentGiven\s*=\s*consentQuery\.data\?\.consentGiven/;
    expect(source).toMatch(derivedFromQuery);
  });

  it("DOIT dériver rewardPoints depuis consentQuery.data", () => {
    const derivedFromQuery = /const\s+rewardPoints\s*=\s*consentQuery\.data\?\.rewardPoints/;
    expect(source).toMatch(derivedFromQuery);
  });

  it("DOIT utiliser trpc.rewards.getConsent.useQuery comme source de vérité", () => {
    expect(source).toContain("trpc.rewards.getConsent.useQuery");
  });

  it("DOIT utiliser trpc.rewards.updateConsent.useMutation pour les modifications", () => {
    expect(source).toContain("trpc.rewards.updateConsent.useMutation");
  });

  it("DOIT utiliser invalidate() après mutation réussie (pas juste refetch)", () => {
    // invalidate force un refetch depuis le serveur, garantissant la cohérence
    expect(source).toContain("rewards.getConsent.invalidate()");
  });

  it("DOIT bloquer le Switch si l'utilisateur n'est pas authentifié", () => {
    // Le Switch doit être disabled quand !isAuthenticated
    expect(source).toContain("!isAuthenticated");
    // Vérifier que le disabled du Switch inclut la condition d'authentification
    const switchDisabled = /disabled=\{[^}]*!isAuthenticated[^}]*\}/;
    expect(source).toMatch(switchDisabled);
  });

  it("DOIT avoir un mécanisme de rollback en cas d'erreur de mutation", () => {
    // Vérifier la présence d'un rollback via setData
    expect(source).toContain("setData(undefined");
    // Vérifier qu'il y a un bloc catch avec rollback
    expect(source).toContain("ROLLBACK");
  });

  it("DOIT contenir un commentaire architectural interdisant AsyncStorage pour le consentement", () => {
    expect(source).toContain("AsyncStorage est INTERDIT pour le consentement");
  });
});

describe("Architecture Consentement — Backend (Loi 25 Québec)", () => {
  it("DOIT utiliser protectedProcedure pour getConsent (authentification requise)", () => {
    const routerSource = readFileSync(
      join(__dirname, "..", "server", "routers.ts"),
      "utf-8"
    );
    expect(routerSource).toContain("getConsent: protectedProcedure");
  });

  it("DOIT utiliser protectedProcedure pour updateConsent (authentification requise)", () => {
    const routerSource = readFileSync(
      join(__dirname, "..", "server", "routers.ts"),
      "utf-8"
    );
    expect(routerSource).toContain("updateConsent: protectedProcedure");
  });

  it("DOIT implémenter le droit à l'oubli dans updateUserConsent", () => {
    const dbSource = readFileSync(
      join(__dirname, "..", "server", "db.ts"),
      "utf-8"
    );
    // Vérifier que la suppression des données est déclenchée quand consentGiven = false
    expect(dbSource).toContain("delete(anonymousMarketData)");
  });

  it("DOIT vérifier le consentement côté serveur avant soumission de données", () => {
    const dbSource = readFileSync(
      join(__dirname, "..", "server", "db.ts"),
      "utf-8"
    );
    // Double vérification : le backend vérifie aussi le consentement
    expect(dbSource).toContain("consent.consentGiven");
  });
});
