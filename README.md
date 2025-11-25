# Logiciel de Facturation

Application web de facturation pour professionnels libéraux, développée avec Next.js.

## Fonctionnalités

### Authentification
- Connexion sécurisée avec email et mot de passe
- Gestion des rôles (Admin et Utilisateur)
- Protection des routes par authentification

### Espace Administrateur
- Gestion complète des utilisateurs (création, modification, suppression, activation/désactivation)
- Vue d'ensemble de toutes les factures du système
- Configuration des paramètres globaux (TVA, préfixe des factures, mentions légales)

### Espace Utilisateur
- Gestion des clients (création, modification, suppression)
- Gestion des produits et services (création, modification, suppression)
- Création de factures avec numérotation automatique
- Recherche et filtrage des factures
- Export des données en CSV
- Téléchargement des factures en PDF
- Vue détaillée de chaque facture

### Système de Facturation
- Numérotation automatique et unique des factures (FAC-0001, FAC-0002, etc.)
- Calcul automatique des montants HT, TVA et TTC
- Ajout de plusieurs articles par facture
- Gestion des dates d'émission et d'échéance
- Ajout de notes personnalisées

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

L'application sera accessible sur `http://localhost:3000`

## Connexion à l'API Express

L'application est configurée pour se connecter à une API Express backend. Assurez-vous que votre API est démarrée et accessible à l'URL configurée dans `NEXT_PUBLIC_API_URL`.

### Endpoints API requis

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Récupérer l'utilisateur connecté
- `GET /api/users` - Liste des utilisateurs (Admin)
- `POST /api/users` - Créer un utilisateur (Admin)
- `PUT /api/users/:id` - Modifier un utilisateur (Admin)
- `DELETE /api/users/:id` - Supprimer un utilisateur (Admin)
- `PATCH /api/users/:id/toggle-status` - Activer/désactiver un utilisateur (Admin)
- `GET /api/clients` - Liste des clients
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit
- `GET /api/invoices` - Liste des factures
- `GET /api/invoices/:id` - Détail d'une facture
- `POST /api/invoices` - Créer une facture
- `PUT /api/invoices/:id` - Modifier une facture
- `DELETE /api/invoices/:id` - Supprimer une facture
- `GET /api/invoices/:id/pdf` - Télécharger une facture en PDF

## Technologies utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styles
- **shadcn/ui** - Composants UI
- **Lucide React** - Icônes

## Structure du projet

\`\`\`
├── app/                      # Pages Next.js
│   ├── admin/               # Pages admin
│   ├── dashboard/           # Pages utilisateur
│   └── login/               # Page de connexion
├── components/              # Composants React
│   ├── admin/              # Composants admin
│   ├── user/               # Composants utilisateur
│   └── ui/                 # Composants UI réutilisables
├── contexts/               # Contextes React (Auth)
└── lib/                    # Utilitaires et API client
\`\`\`

## Sécurité

- Authentification par JWT
- Protection des routes par rôle
- Validation des données côté client
- Hashage des mots de passe (côté backend)
