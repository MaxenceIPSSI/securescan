# SecureScan

SecureScan est une plateforme d'analyse de sécurité automatisée pour projets logiciels.
L'application vas permettre de soumettre un projet via l'URL Git ou l'archive ZIP, ainsi que d'exécuter plusieurs outils d'analyse de sécurité, d'agréger les résultats, de les mapper aux catégories OWASP Top 10:2025 et de proposer des corrections automatiques.

---

# Objectif du projet

L'objectif est de développer un système capable de :

- analyser automatiquement un projet logiciel
- identifier des vulnérabilités
- classifier les vulnérabilités selon OWASP Top 10
- proposer des corrections
- générer un rapport de sécurité

---

# Fonctionnalités principales

## Soumission du projet

Deux modes sont possibles :
- URL d'un repository Git
- Upload d'une archive ZIP

Le projet est ensuite cloné ou extrait côté serveur pour être analysé et traité.

---

## Analyse de sécurité automatisée

SecureScan exécute plusieurs outils d'analyse via CLI :

- analyse statique du code 
- analyse des dépendances
- détection de secrets

Chaque outil produit ces résultats au format JSON qui sont ensuite parsés et normalisés.

---

## Agrégation et classification

Les résultats sont de :

- fusionnés
- normalisés
- classifiés selon OWASP Top 10:2025

## Dashboard de sécurité

L'application fournit un tableau de bord permettant de visualiser :

- score de sécurité global
- distribution par sévérité
- distribution par catégorie OWASP
- liste détaillée des vulnérabilités

Les vulnérabilités peuvent être filtrées par :

- le niveau de sévérité
- l'outil
- la catégorie OWASP

---

## Corrections automatiques

SecureScan propose sa corrections basées sur des templates pour plusieurs types de vulnérabilités :

- SQL Injection
- Cross Site Scripting (XSS)
- dépendances vulnérables
- secrets exposés
- mots de passe en clair

L'utilisateur peut :

- accepter
- rejeter

chaque correction sera proposée.

---

## Intégration Git

Si des corrections sont validées :

- une branche est créée automatiquement
- les corrections sont appliquées
- un commit est généré
- la branche est poussée sur le repository

Exemple de branche :
fix/securescan-YYYY-MM-DD

---

## Génération de rapport

SecureScan génère un rapport de sécurité contenant :

- résumé de l'analyse
- score global
- statistiques
- liste des vulnérabilités
- corrections proposées

Formats disponibles :

- HTML
- PDF

---

# Architecture du projet

Le projet est structuré en plusieurs composants :

### Frontend

Interface utilisateur permettant :

- soumission de projet
- visualisation des résultats
- validation des corrections

Technologies :

- React

---

### Backend

Le backend gère :

- orchestration des analyses
- parsing des résultats
- classification OWASP
- gestion des corrections
- intégration Git

Technologies :

- Node.js
- Express

---

### Outils d'analyse

Les outils sont exécutés via CLI :

- SAST
- analyse des dépendances
- détection de secrets

Les résultats sont convertis dans un format commun.

---

# Diagrammes UML

## Use Case

![UseCase](docs/diagrammes/usecase.png)

---

## Diagramme d'activité

![Activite](docs/diagrammes/activite.png)

---

## Diagramme de séquence

![Sequence](docs/diagrammes/sequence.png)

---

# Installation

## Prérequis

- Node.js
- npm
- Git

---

## Installation du backend
cd backend
npm install

Lancer le serveur :
npm start

---

## Installation du frontend
cd frontend
npm install

Lancer l'application :
npm run dev

---

# Utilisation

1. Soumettre le projet (Git ou ZIP)
2. Lancer l'analyse
3. Consulter le dashboard
4. Valider les corrections
5. Générer le rapport

---

# Structure du projet



---

# Auteurs

Projet réalisé dans le cadre du Hackathon SecureScan 2026, par Maxence GIROUD, Rania ZERAMDINI et Omar Kessentini