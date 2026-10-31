# DetailView — tableau de comparaison

## Penser « miroir »

Le tableau compare deux unités de part et d'autre de la colonne centrale
`Statistic` : tout ce qui est à gauche est le reflet exact de ce qui est à
droite, par rapport à cette colonne.

- **Ordre horizontal inversé** : desktop = `[valeur G] [annexe G] [Statistic] [annexe D] [valeur D]`.
  Dans une cellule, l'élément le plus proche du centre à gauche est aussi le
  plus proche du centre à droite (ex. boutons +/- à l'extérieur, champ à
  l'intérieur ; contenu des annexes collé à la valeur qu'il modifie).
- **Ordre vertical identique** : ce qui est au-dessus à gauche est au-dessus à
  droite (ex. sur mobile, icônes d'attaque au-dessus de la valeur des deux
  côtés). Attention à l'ordre dans le template : avec `flex-wrap`, un élément
  placé après la valeur passe *en dessous* au retour à la ligne.
- **Alignement** : une ligne ne doit jamais décaler les champs de valeur par
  rapport aux autres lignes ; le contenu en plus (pastilles, icônes) va dans
  les colonnes annexes, à largeur fixe (« +N » au-delà de `max`).

Toute modification d'un côté se vérifie de l'autre, sur desktop **et** mobile
(`isMobile` = `$q.screen.lt.md`, 3 colonnes), par exemple avec Playwright en
comparant les positions gauche/droite.
