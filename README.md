# SpyGrocery Frontend

Comparateur intelligent de prix alimentaires - Frontend Vue.js

## 🚀 Technologies utilisées

- Vue 3 + Vite
- Tailwind CSS
- Pinia (State Management)
- Vue Router
- Supabase (Authentification)
- Axios (HTTP Client)
- Vue i18n (Internationalisation)

## 📦 Installation

``bash
npm install
``

## ⚙️ Configuration

1. Copier le fichier d'environnement :

``bash
cp .env.example .env
``

2. Remplir les variables d'environnement :

``env
VITE_API_URL=[URL de l'API backend]

VITE_SUPABASE_URL=[URL Supabase]

VITE_SUPABASE_KEY=[Clé Supabase]

VITE_STRIPE_LINK=[URL Stripe]
``


## 🛠 Scripts disponibles

``bash
npm run dev
``

## 📁 Structure du projet

src/
├── api/ # Services API
├── assets/ # Ressources statiques
├── components/ # Composants Vue
│ ├── auth/ # Authentification
│ ├── compare/ # Comparaison de prix
│ └── landing/ # Page d'accueil
├── stores/ # Stores Pinia
└── views/ # Pages Router


## 🔒 Variables d'environnement

| Variable            | Description                          |
|---------------------|--------------------------------------|
| VITE_API_URL        | URL de l'API backend                 |
| VITE_SUPABASE_URL   | URL de configuration Supabase       |
| VITE_SUPABASE_KEY   | Clé d'API Supabase                   |
| VITE_STRIPE_LINK    | URL de paiement Stripe               |

## 🌍 Internationalisation

Les traductions sont gérées avec vue-i18n dans :

public/locales/
├── en.json
└── fr.json


## 🎨 Style

- Tailwind CSS pour le styling
- Design responsive mobile-first
- Animations CSS personnalisées

## 🔑 Authentification

Gérée via Supabase avec :
- Connexion/déconnexion
- Gestion de session
- Protection de routes

## 📄 License
MIT © Walid Gharbi