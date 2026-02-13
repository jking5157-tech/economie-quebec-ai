import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { uploadRouter } from "./upload-router";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    analyzeDocument: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          documentType: z.enum(["facture", "releve-bancaire", "carte-credit"]),
        })
      )
      .mutation(async ({ input }) => {
        if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
          console.error("❌ ERREUR CRITIQUE : Aucune clé API (Claude ou Gemini) n'est configurée dans le .env !");
          return { success: false, error: "Configuration serveur manquante (ANTHROPIC_API_KEY ou GEMINI_API_KEY)" };
        }

        try {
          const { imageUrl, documentType } = input;

          // Import Gemini client
          const { callGemini, downloadImageAsBase64 } = await import("./_core/gemini");

          // Download file
          const { base64, mediaType } = await downloadImageAsBase64(imageUrl);

          // Prepare system prompt based on document type
          const systemPrompt = `Tu es un agent d'extraction de données de marché à haute résolution pour le Québec. 
Ton objectif est de transformer une image de reçu en un jeu de données JSON exhaustif et structuré pour la revente de données anonymisées (Loi 25).

### MISSIONS D'EXTRACTION STRICTES :
1. MARCHAND : Nom complet, adresse civique, ville et code postal (pour le ciblage régional).
2. ITEMS (L'OR) : Pour CHAQUE ligne du reçu, extrais :
   - Description précise (incluant la marque si visible).
   - Quantité et unité (ex: 2, 1.5kg).
   - Prix unitaire et prix total de la ligne.
   - Si l'item était en promotion/rabais.
3. TRANSACTION : Date exacte, heure, montant TOTAL, et devise (CAD).
4. PAIEMENT : Type (Visa, MasterCard, Débit, Argent) et banque émettrice si visible.
5. FIDÉLITÉ : Identifie tout programme de récompense utilisé (ex: Carte Moi, PC Optimum, Air Miles).

### FORMAT DE RÉPONSE (JSON PUR UNIQUEMENT) :
{
  "metadata": { "merchant_name": "", "address": "", "city": "", "postal_code": "" },
  "transaction": { "date": "", "time": "", "total_amount": 0.00, "payment_type": "" },
  "inventory": [
    { "item": "", "brand": "", "qty": 0, "unit_price": 0.00, "total": 0.00, "promo": false }
  ],
  "loyalty_program": "",
  "category": "Alimentation | Santé | Énergie | Télécoms | Transport"
}`;

          // Call Gemini API
          const response = await callGemini({
            systemPrompt: systemPrompt,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyse ce document et retourne les données en JSON.",
                  },
                  {
                    type: "image", // Label only, handled by mimeType in gemini.ts
                    source: {
                      media_type: mediaType,
                      data: base64,
                    },
                  },
                ],
              },
            ],
          });

          // Vérifier que la réponse existe
          if (!response || !response.content || !response.content[0]) {
            return { success: false, error: "Claude n'a pas retourné de réponse valide" };
          }

          const content = response.content[0].text;
          if (!content) {
            console.error("❌ ERREUR CRITIQUE: Contenu de réponse vide");
            return { success: false, error: "Aucune donnée trouvée dans la réponse" };
          }

          // Parse JSON response
          const parsed = JSON.parse(content);
          console.log("✅ [Analysis] Parsed data:", parsed);

          return {
            success: true,
            extractedData: parsed.extractedData || parsed,
            suggestions: parsed.suggestions || []
          };
        } catch (error) {
          console.error("❌ ERREUR CLAUDE DÉTAILLÉE :", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          return { success: false, error: `Erreur lors de l'analyse: ${errorMessage}` };
        }
      }),

    generateSuggestions: publicProcedure
      .input(
        z.object({
          monthlyIncome: z.number(),
          expenses: z.array(z.object({ category: z.string(), amount: z.number() })),
          region: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = `Tu es conseiller financier québécois. Génère 3-5 suggestions d'économies pour: revenu ${input.monthlyIncome}$, région ${input.region}, dépenses ${JSON.stringify(input.expenses)}. Focus: crédits d'impôt QC, forfaits cellulaires (Fizz vs Vidéotron), Hydro-Québec, épiceries (Maxi, Super C). JSON: {suggestions: [{category, title, description, savings}]}`;
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Génère les suggestions." },
            ],
            response_format: { type: "json_object" },
          });
          const content = response.choices[0].message.content;
          const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
          return { suggestions: parsed.suggestions || [] };
        } catch (error) {
          console.error("Error generating suggestions:", error);
          return { suggestions: [] };
        }
      }),

    chat: publicProcedure
      .input(
        z.object({
          message: z.string(),
          context: z.object({
            monthlyIncome: z.number().optional(),
            currentSavings: z.number().optional(),
            recentExpenses: z.array(z.object({ category: z.string(), amount: z.number() })).optional(),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          let systemPrompt = `Tu es assistant financier AI pour le Québec. Aide à: économiser, trouver crédits d'impôt, optimiser budget, programmes gouvernementaux. Réponds en français québécois.`;
          if (input.context) {
            systemPrompt += `\nContexte: revenu ${input.context.monthlyIncome || "?"}$, économies ${input.context.currentSavings || "?"}$.`;
          }
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });
          return { content: response.choices[0].message.content, suggestions: [] };
        } catch (error) {
          console.error("Error in chat:", error);
          return { content: "Désolé, problème technique." };
        }
      }),

    analyzeHydroQuebecBill: publicProcedure
      .input(z.object({ imageUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = `Analyse facture Hydro-Québec: totalAmount, consumptionKwh, billingPeriod, suggestions (heures creuses, isolation, etc.). JSON.`;
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: [{ type: "text", text: "Analyse:" }, { type: "image_url", image_url: { url: input.imageUrl } }] as any },
            ],
            response_format: { type: "json_object" },
          });

          if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
            console.error("ERREUR CRITIQUE: Réponse IA vide - analyzeHydroQuebecBill");
            return { success: false, error: "Aucune réponse de l'IA" };
          }

          const content = response.choices[0].message.content;
          if (!content) {
            console.error("ERREUR CRITIQUE: Contenu vide - analyzeHydroQuebecBill");
            return { success: false, error: "Aucune donnée trouvée" };
          }

          return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        } catch (error) {
          console.error("ERREUR CRITIQUE - analyzeHydroQuebecBill:", error);
          return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
        }
      }),

    calculateTaxCredits: publicProcedure
      .input(z.object({
        income: z.number(),
        hasChildren: z.boolean(),
        usesPublicTransport: z.boolean(),
        hasChildcareCosts: z.boolean(),
        region: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = `Expert fiscal QC. Calcule crédits pour: revenu ${input.income}$, enfants ${input.hasChildren}, transport ${input.usesPublicTransport}, garde ${input.hasChildcareCosts}, région ${input.region}. JSON: {credits: [{name, amount, description, howToClaim}], totalAmount}`;
          const response = await invokeLLM({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Calcule." }],
            response_format: { type: "json_object" },
          });

          if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
            console.error("ERREUR CRITIQUE: Réponse IA vide - calculateTaxCredits");
            return { success: false, error: "Aucune réponse de l'IA" };
          }

          const content = response.choices[0].message.content;
          if (!content) {
            console.error("ERREUR CRITIQUE: Contenu vide - calculateTaxCredits");
            return { success: false, error: "Aucune donnée trouvée" };
          }

          return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        } catch (error) {
          console.error("ERREUR CRITIQUE - calculateTaxCredits:", error);
          return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
        }
      }),
  }),

  // ===== Programme de Récompenses via Données (Loi 25 Québec) =====
  rewards: router({
    /**
     * Récupère l'état du consentement et les points de l'utilisateur
     */
    getConsent: protectedProcedure.query(async ({ ctx }) => {
      const consent = await db.getUserConsent(ctx.user.id);
      return {
        consentGiven: consent?.consentGiven ?? false,
        rewardPoints: consent?.rewardPoints ?? 0,
        consentDate: consent?.consentDate ?? null,
      };
    }),

    /**
     * Met à jour le consentement de l'utilisateur
     * Si désactivé : déclenche le droit à l'oubli (suppression des données anonymes)
     */
    updateConsent: protectedProcedure
      .input(z.object({ consentGiven: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUserConsent(ctx.user.id, input.consentGiven);
      }),

    /**
     * Soumet une transaction anonymisée (si consentement actif)
     * Les données personnelles sont hachées en SHA-256
     * Seuls montant, catégorie et ville sont conservés
     */
    submitData: protectedProcedure
      .input(z.object({
        amount: z.string(),
        category: z.string(),
        city: z.string(),
        inventory: z.array(z.any()),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.submitAnonymousData(ctx.user.id, input);
      }),

    /**
     * Récupère les points récompenses de l'utilisateur
     */
    getPoints: protectedProcedure.query(async ({ ctx }) => {
      const points = await db.getRewardPoints(ctx.user.id);
      return { points };
    }),
  }),
});

export type AppRouter = typeof appRouter;
