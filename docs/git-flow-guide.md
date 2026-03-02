# Git Flow — Guide développeurs

## Structure des branches

```
main        ← production (releases uniquement, jamais de push direct)
staging     ← intégration / recette (jamais de push direct)
abc/1       ← branches de travail individuelles (prénom + nom + numéro)
```

---

## Nommage des branches

Le nom de ta branche suit le format : **`xyz/N`**

- `x` = première lettre du **prénom**
- `y` = première lettre du **nom de famille**
- `z` = dernière lettre du **nom de famille**
- `N` = numéro incrémental de ta branche (1, 2, 3…)

**Exemple :** Alexandre Bivouac → `abc/1`, `abc/2`, `abc/3`…

---

## Cas 1 — Créer une nouvelle feature / fix

### 1. Se mettre sur staging et être à jour

```bash
git switch staging
git pull origin staging
```

### 2. Créer ta branche

```bash
git switch -c abc/1
```

### 3. Travailler et commiter

```bash
# ... modifications ...
git add .
git commit -m "(feat/fix/chore): description de la fonctionnalité"
```

### 4. Pousser la branche

```bash
git push --set-upstream origin abc/1
```

> Les push suivants sur cette branche se feront simplement avec `git push`.

### 5. Créer une Merge Request

Sur GitHub / GitLab, ouvrir une **Merge Request** :

- **Source :** `abc/1`
- **Target :** `staging`
- Assigner des reviewers

### 6. Une fois la MR approuvée — Merger et nettoyer

Quand les reviewers ont validé :

1. Sélectionner **Squash and Merge** (regroupe tous tes commits en un seul commit propre dans staging)
2. Confirmer le merge
3. Cliquer sur **Delete branch** pour supprimer la branche distante

> Le squash and merge garde l'historique de staging propre : une feature = un commit, au lieu d'avoir tous tes commits intermédiaires (WIP, fix typo, etc.).

Puis en local, nettoyer ta branche :

```bash
git switch staging
git pull origin staging
git branch -d abc/1   # supprime la branche en local
```

---

## Cas 2 — Naviguer entre les branches

À tout moment, tu peux changer de branche avec :

```bash
git switch nom-de-la-branche
```

**Exemples :**

```bash
git switch staging       # aller sur staging
git switch abc/1         # retourner sur ta branche
git switch abc/2         # aller sur une autre de tes branches
```

> ⚠️ Pense à commiter ou stasher tes modifications avant de changer de branche.

---

## Cas 3 — Staging a été mis à jour pendant que tu travaillais

Lorsque des features ont été mergées dans `staging` pendant que tu travaillais sur ta branche, tu dois **rebaser** ta branche sur le nouveau staging pour rester à jour et éviter les conflits au moment de ta MR.

### 1. Se mettre sur sa branche de feature

```bash
git switch abc/1
```

### 2. Récupérer les dernières modifications distantes

```bash
git fetch --all
```

### 3. Rebaser sur staging

```bash
git rebase origin/staging
```

### 4. Résoudre les conflits (si nécessaire)

Git mettra en pause le rebase à chaque conflit. Pour chaque fichier en conflit :

```bash
# Éditer le(s) fichier(s) en conflit, puis :
git add nom-du-fichier

# Continuer le rebase
git rebase --continue
```

> Pour annuler le rebase et revenir à l'état initial : `git rebase --abort`

### 5. Pousser

- **Si la branche n'est pas encore upstream :**

```bash
git push --set-upstream origin abc/1
```

- **Si la branche est déjà upstream** (le rebase a réécrit l'historique) :

```bash
git push --force
```

> ⚠️ Le `--force` est normal après un rebase. Ne l'utilise que sur **ta propre branche**, jamais sur `staging` ou `main`.

---

## Récapitulatif des commandes clés

| Action | Commande |
|--------|----------|
| Mettre staging à jour | `git pull origin staging` |
| Créer une branche | `git switch -c abc/N` |
| Changer de branche | `git switch nom-branche` |
| Premier push | `git push --set-upstream origin abc/N` |
| Push suivants | `git push` |
| Récupérer les mises à jour | `git fetch --all` |
| Rebaser sur staging | `git rebase origin/staging` |
| Push après rebase | `git push --force` |
