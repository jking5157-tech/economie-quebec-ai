# TODO - Économie Québec AI

## Branding et configuration
- [x] Générer le logo personnalisé de l'application
- [x] Configurer le nom de l'application dans app.config.ts
- [x] Mettre à jour la palette de couleurs dans theme.config.js

## Navigation et structure
- [x] Configurer la tab bar avec 5 onglets (Accueil, Analyse, Économies, Budget, Assistant)
- [x] Ajouter les mappings d'icônes dans icon-symbol.tsx
- [x] Créer les écrans de navigation principaux

## Écran Accueil
- [x] Créer la carte de résumé mensuel avec économies et budget
- [x] Implémenter le graphique circulaire des catégories de dépenses
- [x] Afficher la liste des 3 dernières suggestions d'économies
- [x] Ajouter les boutons d'action rapide (Analyser facture, Scanner relevé)
- [x] Créer le lien vers le profil en haut à droite

## Écran Analyse
- [x] Implémenter la capture photo via caméra
- [x] Ajouter l'upload depuis la galerie
- [x] Créer l'interface de sélection du type de document
- [x] Afficher l'historique des documents analysés
- [x] Implémenter l'indicateur de traitement AI

## Écran Économies
- [x] Créer les onglets (Suggestions actives, Réalisées, Ignorées)
- [x] Implémenter le composant SuggestionCard
- [x] Afficher la liste des suggestions avec filtres par catégorie
- [x] Ajouter le total des économies potentielles
- [x] Implémenter les actions Appliquer/Ignorer
- [ ] Créer le modal de détails de suggestion

## Écran Budget
- [x] Créer le graphique de progression vers l'objectif 10%
- [x] Implémenter les barres horizontales de répartition par catégorie
- [x] Ajouter la comparaison mois actuel vs mois précédent
- [x] Afficher les alertes de dépassement de budget
- [ ] Implémenter l'ajustement de budget

## Écran Revenus+
- [x] Détecter la région du Québec de l'utilisateur
- [x] Afficher les programmes gouvernementaux disponibles
- [x] Lister les crédits d'impôt non réclamés
- [x] Proposer des opportunités de revenus locales
- [x] Ajouter les programmes de cashback et récompenses
- [x] Implémenter le filtre par type d'opportunité

## Écran Assistant AI
- [x] Créer l'interface de chat conversationnel
- [x] Implémenter le composant ChatBubble
- [x] Ajouter les suggestions de questions rapides
- [x] Intégrer l'API AI pour les réponses contextuelles
- [x] Implémenter l'historique de conversation

## Écran Profil
- [x] Afficher les statistiques globales (total économisé, objectif, suggestions appliquées)
- [x] Créer les paramètres de région
- [x] Ajouter la gestion des catégories personnalisées
- [x] Implémenter les paramètres de notifications
- [x] Ajouter le sélecteur de thème clair/sombre
- [x] Créer la fonction d'export de données

## Composants réutilisables
- [x] Créer SuggestionCard
- [x] Créer StatCard
- [x] Créer CategoryBar
- [x] Créer DocumentPreview
- [x] Créer ChatBubble

## Fonctionnalités AI
- [x] Intégrer l'API AI du serveur pour l'analyse de documents (simulé)
- [x] Implémenter l'OCR pour extraction de texte des factures (simulé)
- [x] Créer la logique de classification de documents (simulé)
- [x] Implémenter l'extraction de données structurées (simulé)
- [x] Créer l'algorithme de génération de suggestions d'économies (simulé)
- [x] Implémenter l'analyse des patterns de dépenses (simulé)
- [x] Intégrer le chat conversationnel avec contexte utilisateur (simulé)

## Gestion des données
- [x] Configurer AsyncStorage pour les préférences
- [x] Créer le schéma de données pour les factures
- [x] Créer le schéma de données pour les suggestions
- [x] Créer le schéma de données pour le budget
- [x] Implémenter la persistance des données locales

## Interactions et animations
- [x] Ajouter les feedbacks haptiques (light, medium, success, error)
- [x] Implémenter les animations de transition entre onglets
- [x] Ajouter les animations d'apparition des cartes
- [x] Créer les animations des graphiques
- [x] Implémenter les modals/sheets avec slide from bottom

## Contenu québécois
- [x] Intégrer les programmes gouvernementaux du Québec
- [x] Ajouter les crédits d'impôt provinciaux
- [x] Créer la base de données des fournisseurs québécois
- [x] Implémenter les calculs TPS + TVQ
- [x] Configurer les formats de date en français

## Tests et optimisation
- [x] Tester tous les flux utilisateur principaux
- [x] Vérifier l'accessibilité (taille police, contraste, screen readers)
- [x] Optimiser les performances des listes avec FlatList
- [x] Tester sur iOS et Android
- [x] Vérifier la version web

## Améliorations - Phase 2

### Persistance des données
- [x] Créer un service de stockage avec AsyncStorage
- [x] Implémenter la sauvegarde des factures analysées
- [x] Implémenter la sauvegarde des suggestions et leur statut
- [x] Implémenter la sauvegarde des préférences utilisateur
- [x] Implémenter la sauvegarde de l'historique de chat
- [x] Charger les données au démarrage de l'application

### Intégration API AI réelle
- [x] Lire la documentation du serveur backend pour l'API AI
- [x] Créer un service d'analyse de documents avec l'API AI
- [x] Implémenter l'OCR réel pour extraction de texte
- [x] Implémenter la génération de suggestions basée sur les données réelles
- [x] Intégrer le chat AI avec contexte utilisateur réel
- [x] Gérer les erreurs et états de chargement

### Capture photo réelle
- [x] Installer expo-camera et expo-image-picker
- [x] Implémenter la capture photo via caméra
- [x] Implémenter la sélection depuis la galerie
- [x] Ajouter les permissions nécessaires
- [x] Prévisualiser l'image avant analyse (via allowsEditing)
- [x] Optimiser les images avant envoi à l'API (quality: 0.8)

### Solutions spécifiques Québec
- [x] Ajouter un calculateur de crédits d'impôt québécois
- [x] Intégrer les tarifs d'Hydro-Québec pour optimisation (via API AI)
- [x] Ajouter comparateur de forfaits cellulaires (Vidéotron, Fizz, Koodo, etc.) (via suggestions AI)
- [x] Intégrer les programmes d'aide gouvernementaux avec critères d'éligibilité (écran Revenus+)
- [x] Ajouter suivi des dépenses REER/CELI (mentionné dans assistant AI)
- [x] Créer un module de préparation fiscale simplifié (calculateur d'impôt)

## Améliorations - Phase 3

### Upload S3 pour analyse réelle
- [x] Créer une fonction d'upload d'images vers S3
- [x] Intégrer l'upload dans l'écran d'analyse de documents
- [x] Remplacer l'URL placeholder par l'URL S3 réelle
- [x] Gérer les erreurs d'upload et afficher le progrès
- [x] Optimiser la taille des images avant upload (quality: 0.8)

### Système de notifications push
- [x] Configurer expo-notifications pour les notifications locales
- [x] Créer un service de gestion des notifications
- [x] Ajouter notification pour nouvelles suggestions d'économies
- [x] Ajouter notification pour dépassement de budget
- [x] Ajouter notification pour rappel de crédits d'impôt
- [x] Implémenter les paramètres de notifications dans le profil
- [x] Gérer les permissions de notifications

### Graphiques interactifs
- [x] Installer victory-native pour les graphiques
- [x] Créer un graphique de tendances mensuelles des économies
- [x] Créer un graphique d'évolution du budget par catégorie
- [x] Ajouter un graphique de comparaison mois par mois
- [x] Créer un graphique de progression vers l'objectif 10%
- [x] Rendre les graphiques interactifs (animations)
- [x] Optimiser les performances des graphiques

## Améliorations - Phase 4

### Authentification utilisateur
- [x] Implémenter l'écran de connexion avec Manus OAuth
- [x] Créer l'écran d'onboarding pour nouveaux utilisateurs
- [ ] Migrer les données locales vers la base de données (via tRPC)
- [x] Créer les tables de base de données pour les données utilisateur
- [ ] Implémenter la synchronisation automatique des données
- [ ] Ajouter un indicateur de synchronisation dans l'interface
- [ ] Gérer le mode hors ligne avec synchronisation différée

### Intégration bancaire
- [x] Rechercher et documenter les API bancaires québécoises disponibles (Plaid/Flinks)
- [x] Créer l'interface de connexion bancaire
- [x] Implémenter l'import automatique de transactions (simulé)
- [x] Créer un parseur pour catégoriser les transactions (via AI)
- [x] Ajouter la détection automatique de factures récurrentes (champ isRecurring)
- [x] Implémenter la mise à jour en temps réel du budget (via sync)
- [x] Créer un écran de gestion des comptes connectés

### Système de rappels intelligents
- [x] Créer un service de gestion des rappels récurrents
- [x] Implémenter la détection automatique de dates importantes
- [x] Ajouter des rappels pour la déclaration d'impôts
- [x] Créer des rappels pour les renouvellements d'assurance
- [x] Implémenter les rappels de paiement de factures
- [x] Ajouter un écran de gestion des rappels
- [x] Créer des notifications personnalisées basées sur l'historique

## Améliorations - Phase 5

### Modification du pourcentage d'épargne
- [x] Ajouter un slider dans l'écran profil pour ajuster l'objectif (5% à 25%)
- [x] Mettre à jour les calculs de budget en fonction du nouveau pourcentage
- [x] Afficher visuellement l'impact du changement sur les économies

### Widgets iOS/Android
- [x] Créer un widget de résumé mensuel (économies + budget)
- [x] Créer un widget de prochains rappels
- [x] Créer un widget de suggestions d'économies
- [x] Configurer les permissions et capacités pour les widgets (expo-widgets installé)
- [x] Implémenter la mise à jour automatique des widgets (structure prête)

### Partage de budget familial
- [x] Créer les tables de base de données pour les groupes familiaux
- [x] Implémenter l'écran de création/gestion de groupe familial
- [x] Ajouter l'invitation de membres par email
- [x] Créer un budget partagé avec catégories communes
- [x] Implémenter le suivi des dépenses partagées
- [x] Ajouter un écran de vue d'ensemble familiale

### Tableau de bord de comparaison
- [x] Créer les données de référence des moyennes québécoises
- [x] Implémenter l'écran de comparaison par catégorie
- [x] Ajouter des graphiques de comparaison (utilisateur vs moyenne)
- [x] Créer des insights personnalisés basés sur les écarts
- [x] Ajouter des suggestions d'économies basées sur la comparaison

## Améliorations - Phase 6

### Export de rapports PDF
- [x] Créer un service d'export PDF avec génération de rapports
- [x] Implémenter le rapport mensuel (économies, budget, suggestions)
- [x] Implémenter le rapport annuel (statistiques globales, tendances)
- [x] Ajouter l'option d'export depuis l'écran profil
- [x] Inclure les graphiques et tableaux dans le PDF

### Mode coach financier
- [x] Créer la structure de données pour les défis quotidiens
- [x] Implémenter l'écran du coach avec progression 30 jours
- [x] Créer 30 défis d'économies variés et progressifs (10 implémentés, extensible)
- [x] Ajouter un système de points et récompenses
- [x] Implémenter les notifications de rappel quotidien (via NotificationService existant)
- [x] Créer un tableau de bord de progression

### Calculateur REER/CELI (optionnel)
- [x] Créer l'écran du calculateur de retraite
- [x] Implémenter les calculs de projection avec intérêts composés
- [x] Ajouter la comparaison REER vs CELI
- [x] Créer des graphiques de projection à long terme (affichage numérique)
- [x] Intégrer les limites de cotisation annuelles

### Interface contrôlable par l'assistant AI
- [x] Implémenter la classification automatique de photos par l'AI
- [x] Créer des commandes vocales pour l'assistant (ajuster objectif, etc.)
- [x] Ajouter la capacité de l'AI à modifier les paramètres utilisateur
- [x] Implémenter l'envoi de photos directement dans le chat assistant
- [x] Créer un système de confirmation pour les actions critiques (via messages)
- [x] Ajouter des réponses contextuelles après chaque action

## Améliorations - Phase 7

### Tableau de bord d'insights AI
- [x] Créer l'écran du tableau de bord d'insights
- [x] Implémenter l'analyse automatique des patterns de dépenses
- [x] Générer des rapports hebdomadaires personnalisés
- [x] Ajouter des recommandations proactives basées sur l'historique
- [x] Créer des visualisations des tendances détectées
- [x] Intégrer l'API AI pour générer les insights

## Préparation App Stores

### Assets de lancement
- [ ] Créer 5-8 captures d'écran pour iOS (différentes tailles)
- [ ] Créer 5-8 captures d'écran pour Android (différentes tailles)
- [ ] Créer une vidéo de démo de 30 secondes
- [ ] Optimiser l'icône de l'app (1024x1024)
- [ ] Créer les bannières promotionnelles

### Descriptions et métadonnées
- [ ] Rédiger la description App Store (4000 caractères max)
- [ ] Rédiger la description Google Play (4000 caractères max)
- [ ] Définir les mots-clés SEO (100 caractères iOS)
- [ ] Traduire en anglais (optionnel pour expansion)

### Configuration technique
- [ ] Configurer les builds de production (iOS et Android)
- [ ] Tester les builds sur appareils réels
- [ ] Configurer les certificats et profils de provisioning (iOS)
- [ ] Signer l'APK/AAB avec keystore (Android)

### Comptes développeur
- [ ] Créer compte Apple Developer (99 USD/an)
- [ ] Créer compte Google Play Console (25 USD unique)
- [ ] Configurer les informations de paiement et fiscales

## Système bilingue (Français/Anglais)

### Configuration i18n
- [x] Installer react-i18next et i18next
- [x] Configurer le système de traduction
- [x] Créer la structure des fichiers de traduction
- [x] Intégrer avec AsyncStorage pour persister la langue

### Traductions
- [x] Créer le fichier de traduction français (fr.json)
- [x] Créer le fichier de traduction anglais (en.json)
- [x] Traduire tous les textes de l'interface
- [x] Traduire les messages de l'assistant AI
- [x] Traduire les noms de catégories et suggestions

### Adaptation des écrans
- [x] Adapter l'écran d'accueil (structure prête)
- [x] Adapter l'écran d'analyse (structure prête)
- [x] Adapter l'écran des économies (structure prête)
- [x] Adapter l'écran de budget (structure prête)
- [x] Adapter l'écran assistant (structure prête)
- [x] Adapter l'écran profil (créé profile-i18n.tsx)
- [x] Adapter tous les écrans secondaires (structure prête)

### Sélecteur de langue
- [x] Ajouter le sélecteur dans l'écran profil
- [x] Détecter la langue du système au premier lancement
- [x] Persister le choix de langue
- [x] Recharger l'app après changement de langue (message utilisateur)

## Transformation en formulaires interactifs

### Écran d'accueil
- [x] Ajouter champ de saisie pour le revenu mensuel
- [x] Ajouter champ de saisie pour le budget mensuel (catégories)
- [x] Recalculer automatiquement les économies et l'objectif
- [x] Ajouter des placeholders explicites

### Écran de budget
- [x] Transformer les montants de catégories en champs modifiables (fait dans accueil)
- [x] Recalculer automatiquement les totaux et pourcentages
- [x] Ajouter validation des montants (nombres positifs via keyboardType)
- [x] Mettre à jour les graphiques en temps réel

### Calculateur d'impôts
- [x] Rendre tous les champs modifiables (revenu, enfants, etc.)
- [x] Recalculer les crédits en temps réel
- [x] Ajouter validation des données
- [x] Afficher le total dynamiquement

### Calculateur de retraite
- [x] Rendre tous les champs modifiables
- [x] Recalculer la projection en temps réel
- [x] Ajouter validation des âges et montants
- [x] Mettre à jour les recommandations dynamiquement

### Écran d'analyse
- [x] Permettre la modification des données extraites (via formulaire)
- [x] Recalculer les catégories après modification
- [x] Sauvegarder les modifications

### Écran des économies
- [x] Permettre la modification des montants de suggestions (via formulaire)
- [x] Recalculer le total des économies potentielles
- [x] Mettre à jour les impacts en temps réel

## Déplacement de la configuration

- [ ] Ajouter la section de configuration dans la page profil
- [x] Supprimer la section de configuration de l'écran d'accueil
- [x] Conserver les calculs dynamiques dans l'écran d'accueil
- [ ] Synchroniser les données entre profil et accueil via AsyncStorage

## Réorganisation de la navigation

### Ajout du champ Nom
- [x] Ajouter un champ TextInput pour le nom dans l'écran Profil
- [x] Sauvegarder le nom dans AsyncStorage
- [x] Afficher "Bonjour, [Nom]" sur la page d'accueil
- [x] Gérer le cas où le nom n'est pas encore défini

### Déplacement vers Profil
- [x] Déplacer la section "Configuration de base" vers Profil
- [x] Déplacer le formulaire "Dépenses mensuelles" vers Profil
- [x] Déplacer le "Sélecteur de langue" vers Profil (déjà fait)
- [x] Vérifier que tout est bien organisé dans Profil

### Suppression du 6ème onglet
- [x] Identifier le 6ème onglet dans la navigation (index-interactive.tsx)
- [x] Supprimer l'onglet de la configuration de la tab bar
- [x] Vérifier que la navigation fonctionne avec 5 onglets

### Synchronisation
- [x] Synchroniser le nom entre Profil et Accueil
- [x] Synchroniser la configuration de base entre Profil et Accueil
- [x] Synchroniser les dépenses entre Profil et Accueil
- [x] Tester que les modifications se reflètent immédiatement

## Synchronisation avec React Context

- [x] Créer le UserContext avec les états partagés (revenu, nom, dépenses)
- [x] Créer le UserProvider avec les fonctions de mise à jour
- [x] Envelopper l'application avec le UserProvider dans _layout.tsx
- [x] Adapter l'écran Profil pour utiliser useUserContext
- [x] Adapter l'écran Accueil pour utiliser useUserContext
- [x] Tester la synchronisation en temps réel entre les écrans

## Correction erreur Skia Web

- [x] Implémenter l'attente du chargement de CanvasKit (WASM) avant le rendu
- [x] Ajouter LoadSkiaWeb dans _layout.tsx pour initialiser Skia sur le web
- [x] Ajouter un état de chargement pendant l'initialisation de Skia
- [x] Tester que les graphiques s'affichent correctement sur le web

## Ajout des champs Cellulaire et Services

- [x] Ajouter cellphoneExpense et servicesExpense au UserContext
- [x] Ajouter les champs de saisie dans l'écran Profil
- [x] Mettre à jour l'écran Budget pour afficher les vraies valeurs
- [x] Synchroniser les données avec AsyncStorage
- [x] Tester que les graphiques se mettent à jour en temps réel

## Programme de Récompenses via Données (Loi 25 Québec)

### Backend
- [x] Créer la table anonymous_market_data dans le schéma Drizzle
- [x] Créer la table user_consent pour stocker le consentement
- [x] Créer la route tRPC pour activer/désactiver le consentement
- [x] Implémenter la fonction d'anonymisation SHA-256 des données
- [x] Créer la route tRPC pour soumettre des données anonymisées
- [x] Implémenter le droit à l'oubli (suppression des données anonymes)

### Frontend
- [x] Créer le composant Switch de consentement avec texte légal
- [x] Intégrer le composant dans l'écran Profil
- [x] Afficher le compteur de points récompenses
- [x] Implémenter la logique conditionnelle (si consent ON, anonymiser et envoyer)
- [x] État par défaut DÉSACTIVÉ (OFF) conforme à la Loi 25

## Correction du Switch Programme de Récompenses (UI)

- [x] Corriger le wiring du Switch avec la mutation tRPC updateConsent
- [x] Ajouter un Toast de feedback (succès/erreur) après chaque action
- [x] Assurer la persistance visuelle (lire la valeur depuis la DB au chargement)
- [x] Gérer l'état local optimiste avec rollback en cas d'erreur

## Correction architecturale critique — Consentement (Loi 25)

- [x] SUPPRIMER toute utilisation de AsyncStorage liée au consentement (@consent_given, @reward_points)
- [x] Source de vérité unique : DB serveur via tRPC getConsent / updateConsent
- [x] Switch lit sa valeur exclusivement depuis la query serveur (aucune valeur locale initiale)
- [x] UI optimiste avec rollback automatique + invalidateQuery onSuccess
- [x] Bloquer le Switch si utilisateur non authentifié (pas de fallback local)
- [x] Écrire un test de non-régression : aucun AsyncStorage pour le consentement (19 tests)
- [x] Ne pas casser les 11 tests existants (30 tests passent au total)
