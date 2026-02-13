# Design de l'application Économie Québec AI

## Vue d'ensemble
Application mobile d'agent AI pour aider les Québécois à gérer leurs finances personnelles, analyser leurs dépenses, identifier des économies potentielles et proposer des opportunités de revenus supplémentaires.

## Orientation et usage
- **Orientation**: Portrait (9:16) exclusivement
- **Usage**: Une main, pouce dominant
- **Style**: iOS natif selon Apple Human Interface Guidelines

## Palette de couleurs
- **Primary (Accent)**: #0066CC (Bleu Québec, professionnel et confiance)
- **Background Light**: #FFFFFF
- **Background Dark**: #151718
- **Surface Light**: #F8F9FA (Cartes légèrement grisées)
- **Surface Dark**: #1E2022
- **Success**: #22C55E (Économies réalisées)
- **Warning**: #F59E0B (Alertes de dépenses)
- **Error**: #EF4444 (Dépassements de budget)
- **Foreground Light**: #11181C
- **Foreground Dark**: #ECEDEE

## Liste des écrans

### 1. Accueil (Home)
**Contenu principal**:
- Carte de résumé mensuel (économies réalisées, budget restant, objectif d'épargne 10%)
- Graphique circulaire des catégories de dépenses du mois
- Liste des 3 dernières suggestions d'économies avec montant potentiel
- Bouton d'action rapide "Analyser une facture"
- Bouton "Scanner un relevé bancaire"

**Fonctionnalité**:
- Affichage en temps réel des données financières
- Navigation vers les détails de chaque suggestion
- Accès rapide à l'analyse de documents

### 2. Analyse (Scan)
**Contenu principal**:
- Zone de capture photo/upload de document
- Options: Facture, Relevé bancaire, Relevé de carte de crédit
- Historique des 5 derniers documents analysés
- Indicateur de traitement AI en cours

**Fonctionnalité**:
- Capture photo via caméra
- Upload depuis galerie
- Analyse OCR + AI pour extraction de données
- Détection automatique du type de document

### 3. Économies (Savings)
**Contenu principal**:
- Onglets: "Suggestions actives", "Réalisées", "Ignorées"
- Cartes de suggestions avec:
  - Catégorie (Impôts, Cellulaire, Épicerie, Services, etc.)
  - Montant d'économie potentielle
  - Description de l'action recommandée
  - Bouton "Appliquer" / "Ignorer"
- Filtre par catégorie
- Total des économies potentielles en haut

**Fonctionnalité**:
- Liste scrollable de suggestions personnalisées
- Marquage des suggestions appliquées/ignorées
- Détails avec liens vers alternatives (ex: forfaits cellulaires moins chers)

### 4. Budget (Budget)
**Contenu principal**:
- Graphique de progression vers l'objectif 10% d'épargne
- Répartition des dépenses par catégorie (barres horizontales)
- Comparaison mois actuel vs mois précédent
- Alertes de dépassement de budget
- Bouton "Ajuster mon budget"

**Fonctionnalité**:
- Visualisation des tendances de dépenses
- Définition de limites par catégorie
- Notifications de dépassement

### 5. Revenus+ (Income)
**Contenu principal**:
- Carte de localisation (région du Québec détectée)
- Liste d'opportunités de revenus supplémentaires:
  - Programmes gouvernementaux disponibles
  - Crédits d'impôt non réclamés
  - Opportunités de travail à temps partiel locales
  - Programmes de cashback et récompenses
- Filtre par type d'opportunité

**Fonctionnalité**:
- Géolocalisation pour opportunités régionales
- Liens vers applications/inscriptions
- Estimation du revenu potentiel

### 6. Assistant AI (Chat)
**Contenu principal**:
- Interface de chat conversationnel
- Bulles de messages (utilisateur + AI)
- Suggestions de questions rapides:
  - "Comment économiser sur mes impôts?"
  - "Trouve-moi un meilleur forfait cellulaire"
  - "Analyse mes dépenses du mois"
- Bouton micro pour commande vocale (optionnel)

**Fonctionnalité**:
- Chat en temps réel avec l'agent AI
- Analyse contextuelle des finances de l'utilisateur
- Recommandations personnalisées

### 7. Profil (Profile)
**Contenu principal**:
- Statistiques globales:
  - Total économisé depuis inscription
  - Objectif d'épargne mensuel (10%)
  - Nombre de suggestions appliquées
- Paramètres:
  - Région du Québec
  - Catégories de dépenses personnalisées
  - Notifications
  - Thème (clair/sombre)
- Bouton "Exporter mes données"

**Fonctionnalité**:
- Configuration de l'application
- Visualisation des performances d'épargne
- Gestion des préférences

## Flux utilisateur principaux

### Flux 1: Analyser une facture
1. Utilisateur tape sur "Analyser une facture" (Accueil)
2. Écran Analyse s'ouvre
3. Utilisateur prend photo ou upload document
4. AI analyse le document (indicateur de chargement)
5. Résultats affichés avec suggestions d'économies
6. Utilisateur peut accepter/ignorer les suggestions
7. Retour à l'Accueil avec mise à jour des données

### Flux 2: Consulter et appliquer une suggestion d'économie
1. Utilisateur consulte la liste des suggestions (Écran Économies)
2. Tape sur une carte de suggestion
3. Sheet modal s'ouvre avec détails complets:
   - Explication détaillée
   - Montant d'économie
   - Étapes pour appliquer
   - Liens externes si nécessaire
4. Utilisateur tape "Appliquer"
5. Suggestion marquée comme appliquée
6. Mise à jour du total d'économies réalisées

### Flux 3: Discuter avec l'assistant AI
1. Utilisateur ouvre l'onglet Assistant AI
2. Tape ou dicte une question
3. AI répond avec analyse contextuelle
4. AI peut proposer des actions (ex: "Voulez-vous que j'analyse vos factures d'électricité?")
5. Utilisateur peut continuer la conversation ou appliquer une action

### Flux 4: Configurer l'objectif d'épargne
1. Utilisateur ouvre Profil
2. Tape sur "Objectif d'épargne mensuel"
3. Slider pour ajuster le pourcentage (5% à 30%)
4. Confirmation
5. Mise à jour des calculs dans Budget et Accueil

## Composants réutilisables

### SuggestionCard
- Carte avec icône de catégorie
- Titre de la suggestion
- Montant d'économie en vert
- Description courte
- Boutons d'action

### StatCard
- Carte avec icône
- Valeur numérique grande
- Label descriptif
- Indicateur de tendance (hausse/baisse)

### CategoryBar
- Barre horizontale avec pourcentage
- Label de catégorie
- Montant dépensé
- Couleur selon dépassement ou non

### DocumentPreview
- Miniature du document scanné
- Date d'analyse
- Type de document
- Statut (analysé, en cours, erreur)

### ChatBubble
- Bulle utilisateur (alignée droite, bleu)
- Bulle AI (alignée gauche, gris)
- Timestamp
- Avatar AI

## Navigation

### Tab Bar (bas de l'écran)
1. Accueil (icône: house.fill)
2. Analyse (icône: doc.text.viewfinder)
3. Économies (icône: dollarsign.circle.fill)
4. Budget (icône: chart.bar.fill)
5. Assistant (icône: message.fill)

### Navigation secondaire
- Profil accessible via icône en haut à droite de l'Accueil
- Retour via gesture swipe ou bouton back natif iOS

## Interactions

### Feedback tactile
- Tap sur carte de suggestion: Scale 0.97 + haptic light
- Swipe pour supprimer une suggestion: Haptic medium
- Succès d'analyse: Haptic success
- Erreur: Haptic error

### Animations
- Transition entre onglets: Fade 250ms
- Apparition des cartes: Fade in 200ms avec stagger de 50ms
- Graphiques: Animation de remplissage 400ms
- Modal/Sheet: Slide from bottom 300ms

## Considérations spécifiques Québec

### Langue
- Interface en français québécois
- Terminologie locale (ex: "cellulaire" au lieu de "mobile")
- Formats de date: JJ/MM/AAAA

### Contenu régional
- Programmes gouvernementaux du Québec
- Crédits d'impôt provinciaux
- Fournisseurs de services québécois (Vidéotron, Bell, etc.)
- Épiceries locales pour comparaison de prix

### Données financières
- Dollar canadien (CAD)
- TPS + TVQ dans les calculs
- Périodes fiscales québécoises

## Fonctionnalités AI

### Analyse de documents
- OCR pour extraction de texte
- Classification automatique (facture, relevé, reçu)
- Extraction de données structurées (montant, date, fournisseur, catégorie)
- Détection d'anomalies (prix inhabituellement élevés)

### Suggestions d'économies
- Analyse des patterns de dépenses
- Comparaison avec bases de données de prix
- Détection de dépenses récurrentes optimisables
- Recommandations personnalisées selon profil

### Assistant conversationnel
- Compréhension du langage naturel
- Contexte des finances de l'utilisateur
- Réponses avec sources et liens
- Proactivité (alertes, rappels)

## Stockage des données
- **Local (AsyncStorage)**: Préférences utilisateur, thème, paramètres
- **Pas de backend requis initialement**: Application locale avec AI intégré
- **Optionnel futur**: Sync cloud pour multi-device

## Accessibilité
- Taille de police ajustable
- Contraste élevé en mode sombre
- Labels pour screen readers
- Zones tactiles minimum 44x44pt
