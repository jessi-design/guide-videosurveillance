# GuideCaméras — blog d'affiliation automatisé

Blog Astro qui publie automatiquement, chaque jour, un article de ~2500 mots optimisé SEO
(comparatif, guide complet ou article thématique) sur le thème des caméras de vidéosurveillance,
avec insertion automatique de liens d'affiliation Amazon.

## Comment ça marche

```
GitHub Actions (cron quotidien)
   → scripts/generate-article.mjs
       → choisit le prochain sujet dans data/topics.json
       → appelle l'API Claude pour rédiger l'article (JSON structuré)
       → insère les liens Amazon depuis data/products.json (uniquement les produits "verified": true)
       → récupère une image d'illustration libre de droits sur Pexels
       → génère une image d'épingle Pinterest prête à publier (3 mises en page x 2 teintes en rotation)
       → écrit un fichier .md dans src/content/articles/
   → commit + push automatique
   → Vercel détecte le push et redéploie le site
```

### Publier sur Pinterest

Chaque article génère automatiquement une image d'épingle (1000x1500) ainsi qu'un titre et une
description adaptés à Pinterest. Va sur **`https://<ton-site>/pinterest`** (page volontairement
non référencée, absente du menu et du sitemap) pour :

1. Télécharger l'image de l'épingle.
2. Copier le titre et la description en un clic.
3. Aller sur Pinterest et créer l'épingle manuellement avec ces trois éléments.

La publication automatique *sur* Pinterest (sans action manuelle) demanderait l'accès à l'API
Pinterest, soumis à validation par Pinterest — non couvert par ce système pour l'instant.

Aucune intervention manuelle n'est nécessaire une fois la configuration ci-dessous effectuée.
Le système ne tombe jamais à court de sujets : une fois les ~90 sujets de `data/topics.json`
épuisés (environ 3 mois), il continue en combinant des types de caméras/usages avec des formats
d'article (voir `fallbackIngredients` / `fallbackTemplates` dans ce fichier).

## Structure du projet

- `src/content/articles/` — les articles générés (Markdown + frontmatter), un fichier par jour.
- `src/content.config.ts` — schéma de validation des articles (titre, description, type, mots-clés, FAQ…).
- `src/layouts/`, `src/components/` — mise en page, SEO (meta, Open Graph, JSON-LD Article/FAQPage/Breadcrumb), disclosure d'affiliation.
- `src/pages/` — accueil, listes par catégorie (`/comparatifs/`, `/guides/`, `/astuces/`), page article, RSS, mentions légales.
- `data/products.json` — catalogue des produits recommandables (**à compléter avec tes vrais ASIN**, voir ci-dessous).
- `data/topics.json` — liste des sujets à publier, dans l'ordre.
- `scripts/generate-article.mjs` — le script de génération.
- `.github/workflows/daily-article.yml` — l'automatisation quotidienne.

## Mise en place (à faire une seule fois)

### 1. Créer un dépôt GitHub

Crée un dépôt (public ou privé) sur GitHub, puis pousse ce projet :

```sh
git init
git add .
git commit -m "Initial commit: système de blog vidéosurveillance automatisé"
git branch -M main
git remote add origin https://github.com/<ton-compte>/<ton-repo>.git
git push -u origin main
```

### 2. Créer une clé API Anthropic

1. Va sur [console.anthropic.com](https://console.anthropic.com), crée un compte si besoin.
2. Ajoute un moyen de paiement et un peu de crédit (facturation à l'usage — un article de 2500
   mots coûte de l'ordre de quelques centimes avec Claude Sonnet).
3. Crée une clé API (**API Keys** → **Create Key**). Copie-la, elle ne sera plus affichée ensuite.

### 3. Configurer les secrets GitHub

Dans ton dépôt GitHub : **Settings → Secrets and variables → Actions**.

Onglet **Secrets** (valeurs sensibles) :
- `ANTHROPIC_API_KEY` — la clé créée à l'étape 2.
- `AMAZON_TAG` — ton tag d'affilié Amazon Associates (ex: `monsite-21`).
- `PEXELS_API_KEY` — clé gratuite créée sur [pexels.com/api](https://www.pexels.com/api/),
  utilisée pour ajouter une image d'illustration libre de droits à chaque article. Optionnel :
  sans cette clé, les articles sont publiés sans image.

Onglet **Variables** (non sensible, optionnel) :
- `SITE_URL` — l'URL finale du site une fois déployé (ex: `https://guide-videosurveillance.vercel.app`).
- `ARTICLE_MODEL` — laisse vide pour utiliser le modèle par défaut (`claude-sonnet-5`).

### 4. Compléter le catalogue produits

Ouvre `data/products.json`. Tous les produits y sont actuellement des **placeholders non
vérifiés** (`"asin": "REMPLACER_ASIN"`, `"verified": false`) — le script ne les utilisera jamais
tant que ce n'est pas corrigé, donc aucun risque de lien cassé publié par erreur. Pour chaque
produit que tu veux pouvoir recommander :

1. Trouve le produit sur Amazon.fr et récupère son **ASIN** (visible dans l'URL du produit,
   ou via la barre d'outils **SiteStripe** d'Amazon Associates une fois connecté à ton compte
   partenaire).
2. Remplace `"asin": "REMPLACER_ASIN"` par le vrai ASIN.
3. Vérifie que le modèle et le titre du produit correspondent bien à `name`/`brand`.
4. Passe `"verified"` à `true`.

Tu peux aussi ajouter d'autres produits (autres marques, autres catégories) en suivant le même
format.

> **Important — conformité Amazon Associates** : les règles du programme interdisent d'afficher
> des prix qui ne proviennent pas en temps réel de leur API. C'est pourquoi ce site n'affiche
> jamais de prix : seulement un lien "Voir le prix sur Amazon".

### 5. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com), crée un compte avec ton GitHub.
2. **Add New → Project**, sélectionne ton dépôt.
3. Vercel détecte Astro automatiquement (build command `astro build`, output `dist/`). Clique sur **Deploy**.
4. Une fois déployé, note l'URL (ex: `https://guide-videosurveillance.vercel.app`) et mets-la dans :
   - la variable GitHub `SITE_URL` (étape 3),
   - `astro.config.mjs` si tu préfères une valeur en dur plutôt que la variable d'environnement.
5. (Optionnel) Dans **Project Settings → Domains**, ajoute ton propre nom de domaine.

Chaque `git push` sur `main` (donc chaque publication automatique) redéploiera le site.

### 6. AdSense et Pinterest (spécifique à ce nouveau domaine)

- Le script AdSense dans `src/layouts/BaseLayout.astro` réutilise le même compte Google AdSense
  que le site GuideAirfryer existant. Pense à **ajouter ce nouveau site** dans ton dashboard
  AdSense (**Sites → Ajouter un site**) une fois déployé, et attends la validation avant de
  compter sur des revenus publicitaires ici.
- L'ancienne balise de vérification de domaine Pinterest (`p:domain_verify`) a été retirée car
  elle est propre à l'ancien domaine. Si tu veux vérifier ce nouveau domaine sur Pinterest,
  génère une nouvelle balise depuis les paramètres Pinterest et ajoute-la dans `BaseLayout.astro`.

### 7. Premier test manuel

Dans GitHub : **Actions → Publication quotidienne d'un article → Run workflow**. Ça lance une
génération immédiate sans attendre le lendemain. Vérifie les logs, puis va voir le nouvel
article commité dans `src/content/articles/` et publié sur ton site Vercel.

Le cron est programmé à 6h UTC chaque jour (`.github/workflows/daily-article.yml`), modifiable
si tu préfères un autre horaire.

## Utilisation en local (optionnel)

```sh
npm install
npm run dev        # site en local sur http://localhost:4321

# pour tester la génération d'un article sans passer par GitHub Actions :
$env:ANTHROPIC_API_KEY="sk-ant-..."   # PowerShell
$env:AMAZON_TAG="tonTag-21"
npm run generate

# ou, en copiant .env.example vers .env et en le remplissant :
node --env-file=.env scripts/generate-article.mjs
```

## Avant la mise en ligne définitive

- Complète `src/pages/mentions-legales.astro` avec ta véritable identité/statut (obligatoire légalement en France).
- Vérifie que ton compte Amazon Associates est bien actif pour le marché France (amazon.fr).
- Amazon exige au moins 3 ventes qualifiées dans les 180 jours suivant l'inscription, sous peine
  de fermeture du compte partenaire — publie et fais connaître le site rapidement.
- Complète `data/products.json` avec de vrais ASIN vérifiés (voir étape 4) : sans ça, aucun lien
  produit ne sera inséré dans les articles.
- Relis quelques articles générés avant de les partager largement : le script vérifie la
  longueur et la structure, mais une relecture humaine reste recommandée au début.
