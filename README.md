# Portfolio — Salim Zabeirou

Portfolio Web en HTML, CSS et JavaScript natif (thème **Glacier**), sans framework.
Un script PHP facultatif gère l'envoi du formulaire de contact.

## Ouvrir en local (WAMP)

1. Démarrer WampServer (icône verte).
2. Ouvrir http://localhost/portfolio-salim/ puis recharger avec `Ctrl+F5`.

Le fichier `.htaccess` du dossier (`RewriteEngine On`) évite que les règles de
`C:\wamp64\www\.htaccess` (un autre projet) s'appliquent au portfolio.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Contenu des sections et des fenêtres projets |
| `style.css` | Design Glacier, responsive, réduction des animations |
| `script.js` | Interactions et formulaire |
| `config.js` | **Coordonnées, CV et activation du formulaire** |
| `contact.php` | Envoi du formulaire (validation et anti-spam côté serveur) |
| `contact-config.example.php` | Modèle de configuration de l'envoi |
| `assets/` | Photo, images des projets, favicon |

## Ajouter vos coordonnées

Remplir `config.js`. Un champ vide n'est pas affiché.

## Ajouter le CV

Copier le PDF dans `assets/`, puis renseigner `cv` dans `config.js`.
Le bouton n'apparaît que si le fichier répond comme un PDF (via `http://`, pas en double-clic).

## Activer le formulaire

1. Copier `contact-config.example.php` en `contact-config.php` et remplir `to` et `from`.
2. Mettre `formEndpoint: 'contact.php'` dans `config.js`.
3. Il faut un serveur capable d'envoyer des e-mails avec `mail()`. WAMP n'en fournit pas
   par défaut : en local, le site affichera donc une erreur d'envoi (jamais un faux succès).

Un succès signifie que le serveur de messagerie a **accepté** le message : vérifier la
réception réelle (et le dossier spam) après la mise en ligne.

Protections : champ piège, délai minimal de saisie, contrôle de l'origine, validation,
5 envois par heure et par IP, 50 par jour au total.

## Réduction des animations

Le site suit le réglage système. Sous Windows : Paramètres > Accessibilité >
Effets visuels > Effets d'animation. S'il est désactivé, le site s'affiche sans animations.

## Avant une mise en ligne

- Remplacer `og:image` dans `index.html` par une URL absolue et ajouter `og:url`.
- Ne pas publier de dossier de sauvegarde.

## Changer de palette

La classe de `<div class="pf th-glacier" id="pf-root">` choisit la palette :
`th-sahel`, `th-or`, `th-emeraude`, `th-synth`.
