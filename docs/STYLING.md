# SpyGrocery - Styling Guide

Objectif: centraliser toutes les regles visuelles du site pour garder une identite coherente sur toutes les pages et composants.

Ce document est la reference styling du frontend Nuxt.

## Direction visuelle

- Theme: editorial noir/blanc, contraste fort.
- Ambiance: premium, claire, lisible, moderne.
- Priorite: typographie + hierarchie + rythmes d'espacement.
- Regle generale: design system simple, repete, sans styles improvises.

## Regles non negociables

- Tailwind utility classes uniquement.
- Pas de fichiers CSS custom.
- Pas de UI coloree par defaut; base noir/blanc + opacites.
- Effets subtils seulement (hover, ring focus, ombres douces).

## Typographie

Polices officielles:

- `font-sans` = Manrope (texte UI, labels, boutons, inputs).
- `font-display` = Fraunces (titres, montants importants, hero headlines).

Definition Tailwind actuelle:

- `tailwind.config.js`
  - `fontFamily.sans = ['Manrope', 'system-ui', 'sans-serif']`
  - `fontFamily.display = ['Fraunces', 'serif']`

Usage recommande:

- Titres de section/page: `font-display`, italique possible (`italic`), tracking serre (`tracking-tight`).
- Corps et UI controls: `font-sans`.
- Meta labels: petites caps avec tracking large.

Patterns typo utilises:

- Eyebrow/meta: `text-[10px] uppercase tracking-[0.35em] text-white/60`
- Titre principal: `font-display text-4xl sm:text-5xl font-semibold italic tracking-tight`
- Prix/totaux: `font-display text-2xl sm:text-3xl font-semibold italic`

## Palette et contrastes

Base:

- Fond principal: `bg-black`
- Texte principal: `text-white`
- Texte secondaire: `text-white/70`, `text-white/60`, `text-white/40`

Surfaces:

- Cards/panels: `bg-white/5` ou `bg-black/60`
- Borders: `border-white/10` a `border-white/20`
- Overlays: `bg-black/40`, `bg-black/50`, `bg-black/60`

Regles:

- Garder le contraste AA minimum sur texte utile.
- Eviter d'introduire des couleurs hors systeme sans besoin produit clair.

## Layout, spacing, rayons, ombres

Rayons standards:

- Containers principaux: `rounded-2xl`
- Cards hero/lists specifiques: `rounded-[36px]`
- Pill/buttons: `rounded-full`

Espacements:

- Panels: `p-4` a `p-6`
- Grilles de cartes: `gap-4` mobile, `sm:gap-6` desktop
- Sections verticales: rythmes en `mt-4`, `mt-6`, `mt-8`, `pt-6`, `pb-6`

Ombres:

- Cartes fortes: `shadow-[0_30px_80px_rgba(0,0,0,0.55)]`
- Drawer: `shadow-[-10px_0_30px_rgba(0,0,0,0.5)]`

## Composants interactifs

### Boutons

Base:

- Focus visible obligatoire: `focus-visible:ring-2 ... ring-offset-black`
- Boutons pill CTA: `rounded-full`
- Etats hover visibles mais sobers.

Disabled (obligatoire):

- `disabled:opacity-40`
- `disabled:cursor-not-allowed`
- Ne pas garder un hover trompeur quand disabled.

### Inputs et selects

- Formes pill: `rounded-full`
- Fond: `bg-black` ou `bg-white/5`
- Border: `border-white/15`
- Focus ring: blanc avec offset noir.

### Modals

- Backdrop: `bg-black/60 backdrop-blur-sm`
- Surface: `rounded-2xl border border-white/10 bg-black`
- Actions: cancel outline, confirm plein.

## Iconographie

- Bibliotheque: `lucide-vue-next`.
- Taille usuelle: `h-3 w-3`, `h-4 w-4`, `h-6 w-6`, `h-7 w-7` selon importance.
- Les icones ne remplacent pas les labels critiques sans `aria-label`.

## Motion et transitions

- Transitions courtes: `duration-150` a `duration-300`.
- Utiliser surtout:
  - fade (`transition-opacity`)
  - slide drawer (`translate-x`)
  - feedback simple (`scale-110`, `animate-pulse` ponctuel)
- Eviter les animations permanentes agressives.

## Mobile-first

- Toujours optimiser d'abord mobile.
- Compacter cartes et densite en mobile:
  - padding plus petit (`p-3` / `p-4`),
  - typo plus compacte,
  - media moins dominant si necessaire.
- Desktop enrichi via `sm:`, `md:`, `lg:`.

## Pattern visuel de reference (shopping list)

- Structure: header -> contenu scrollable -> footer actions.
- Groupement par store avec sous-total.
- CTA en bas:
  - `Clear` (outline)
  - `Save list` / `Update list` (plein)
- Si liste vide: CTA visiblement disabled.

## Toasts (Sonner)

- Position: top-center.
- Theme: dark.
- Style: fond noir, texte blanc, bordure blanche faible opacite.
- Ton de message: court, actionnable, explicite.

Exemples:

- Ajout produit: `<nom produit>` + `added to your list.`
- Save/update/delete: message succes court.

## Accessibilite visuelle minimale

- Focus keyboard visible sur tous controls.
- Targets cliquables suffisants (buttons ronds min `h-10 w-10`).
- Etats disabled clairement visibles.
- Eviter texte long en uppercase sur tailles trop petites.

## Do / Don't rapides

Do:

- Reutiliser les memes patterns classes (borders, opacites, focus, rayons).
- Garder un contraste fort et une hierarchie typo nette.
- Verifier visuel mobile + desktop apres chaque changement.

Don't:

- Ajouter des couleurs arbitraires.
- Multiplier les variantes de boutons sans besoin.
- Casser le style editorial noir/blanc avec des composants generiques.

## Checklist avant merge (styling)

- Le composant respecte noir/blanc editorial.
- `font-display`/`font-sans` bien utilises.
- Etats hover/focus/disabled visibles.
- Mobile propre (densite, lisibilite, clics).
- Pas de CSS custom file ajoute.
