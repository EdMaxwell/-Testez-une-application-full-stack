# Yoga App

Application full-stack de gestion de sessions de yoga.

- **Front-end** : Angular 14
- **Back-end** : Spring Boot 2.6 (source compatible Java 8, exécution recommandée avec Java 11)
- **Tests unitaires front** : Jest
- **Tests unitaires/intégration back** : JUnit 5 / Mockito + tests d'intégration
- **Tests end-to-end** : Cypress 10

---

## Quickstart (résumé)

> Objectif : lancer rapidement l’app et se connecter.

```bash
# 1) Récupérer le projet
git clone https://github.com/EdMaxwell/-Testez-une-application-full-stack.git
cd -Testez-une-application-full-stack

# 2) Initialiser la DB (à exécuter depuis la racine)
mysql -u user -p123456 test < ressources/sql/script.sql

# 3) Lancer le back
cd back
mvn spring-boot:run

# 4) Lancer le front (dans un autre terminal)
cd ../front
npm install
npm start
```

Compte admin :

- Email : `yoga@studio.com`
- Password : `test!1234`

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Récupérer le projet](#2-récupérer-le-projet)
3. [Installation de la base de données](#3-installation-de-la-base-de-données)
4. [Installation de l'application](#4-installation-de-lapplication)
5. [Lancer l'application](#5-lancer-lapplication)
6. [Lancer les tests](#6-lancer-les-tests)
7. [Générer les rapports de couverture](#7-générer-les-rapports-de-couverture)
8. [Captures des rapports de couverture](#8-captures-des-rapports-de-couverture)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prérequis

| Outil       | Version recommandée |
| ----------- | ------------------- |
| Java (JDK)  | 11 recommandé       |
| Maven       | 3.6+                |
| Node.js     | 16.x LTS            |
| npm         | 8.x+                |
| Angular CLI | 14.2.x              |
| MySQL       | 8.x (port 3306)     |

> **Vérification rapide**
>
> ```bash
> java -version
> mvn -version
> node -v
> npm -v
> ng version
> mysql --version
> ```

---

## 2. Récupérer le projet

```bash
git clone https://github.com/EdMaxwell/-Testez-une-application-full-stack.git
cd -Testez-une-application-full-stack
```

---

## 3. Installation de la base de données

### 3.1 Installer MySQL

Téléchargez et installez MySQL depuis [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) (port par défaut : **3306**).

### 3.2 Créer la base de données et l'utilisateur

Connectez-vous à MySQL en tant qu'administrateur :

```bash
mysql -u root -p
```

Puis exécutez les commandes suivantes :

```sql
CREATE DATABASE test;
CREATE USER 'user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON test.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Initialiser le schéma et les données

Le script SQL de référence se trouve dans `ressources/sql/script.sql`. Il crée les tables (`TEACHERS`, `SESSIONS`, `USERS`, `PARTICIPATE`) et insère deux professeurs et un compte administrateur.

> **Important** : exécuter cette commande **depuis la racine du dépôt** (là où se trouve le dossier `ressources/`).

```bash
mysql -u user -p123456 test < ressources/sql/script.sql
```

### 3.4 Compte administrateur par défaut

| Champ    | Valeur            |
| -------- | ----------------- |
| Email    | `yoga@studio.com` |
| Password | `test!1234`       |

### 3.5 Variables de configuration (back-end)

Le fichier `back/src/main/resources/application.properties` contient les paramètres de connexion :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/test?allowPublicKeyRetrieval=true
spring.datasource.username=user
spring.datasource.password=123456
```

Modifiez ces valeurs si vous utilisez des identifiants différents.

---

## 4. Installation de l'application

### 4.1 Installer les dépendances du front-end

```bash
cd front
npm install
cd ..
```

### 4.2 Installer les dépendances du back-end

```bash
cd back
mvn clean install -DskipTests
cd ..
```

---

## 5. Lancer l'application

> ⚠️ **Ordre de démarrage important** : DB → Back-end → Front-end

### 5.1 Démarrer la base de données

Assurez-vous que le service MySQL est démarré et accessible sur le port **3306**.

```bash
# Linux / macOS (systemd)
sudo systemctl start mysql

# macOS (Homebrew)
brew services start mysql
```

### 5.2 Démarrer le back-end (API Spring Boot)

```bash
cd back
mvn spring-boot:run
```

L'API démarre sur [**http://localhost:8080**](http://localhost:8080).

### 5.3 Démarrer le front-end (Angular)

```bash
cd front
npm start
```

L'application Angular est accessible sur [**http://localhost:4200**](http://localhost:4200).

### 5.4 URLs utiles

| Service | URL                                                    |
| ------- | ------------------------------------------------------ |
| Front   | [http://localhost:4200](http://localhost:4200)         |
| API     | [http://localhost:8080/api](http://localhost:8080/api) |

### 5.5 Compte de test

| Champ    | Valeur            |
| -------- | ----------------- |
| Email    | `yoga@studio.com` |
| Password | `test!1234`       |

---

## 6. Lancer les tests

### 6.1 Tests front-end (Jest)

```bash
cd front
npm test
```

Pour lancer en mode watch :

```bash
npm run test:watch
```

### 6.2 Tests back-end (JUnit / Mockito)

```bash
cd back
mvn clean test
```

Cette commande exécute tous les tests unitaires et d'intégration (classes `*Test.java`, `*Tests.java`, `*IT.java`).

> **Note** : les tests back-end utilisent une base **H2 in-memory** configurée dans `back/src/test/resources/application.properties`. Aucune connexion MySQL n'est nécessaire pour les tests.

### 6.3 Tests end-to-end (Cypress)

> ⚠️ Le back-end et le front-end doivent être démarrés avant de lancer les tests e2e.

**Mode interactif (navigateur Cypress) :**

```bash
cd front
npm run e2e
```

**Mode CI (headless, Chrome) :**

```bash
cd front
npm run e2e:ci
```

---

## 7. Générer les rapports de couverture

### 7.1 Couverture front-end (Jest)

```bash
cd front
npm run test:coverage
```

Le rapport HTML est généré dans :

```text
front/coverage/jest/lcov-report/index.html
```

### 7.2 Couverture back-end (JaCoCo)

```bash
cd back
mvn clean verify
```

JaCoCo génère automatiquement le rapport pendant le build. Le rapport HTML est disponible dans :

```text
back/target/site/jacoco/index.html
```

> ⚠️ **Seuil JaCoCo** : la vérification du seuil est exécutée pendant la phase `verify`. Utilisez donc `mvn clean verify` pour contrôler que la couverture minimale est bien respectée.

### 7.3 Couverture e2e (Cypress + NYC/Istanbul)

> ⚠️ Le back-end et le front-end doivent être démarrés avant de lancer la couverture e2e.

```bash
cd front
npm run e2e:coverage
```

Cette commande exécute Cypress en mode CI puis génère un rapport LCOV avec NYC.

Le rapport HTML est généré dans :

```text
front/coverage/lcov-report/index.html
```

---

## 8. Captures des rapports de couverture

Les captures d'écran des rapports de couverture sont stockées dans `docs/coverage/`.

### Couverture front-end (Jest)



### Couverture back-end (JaCoCo)



### Couverture e2e (Cypress)



---

## 9. Troubleshooting

| Problème                            | Cause probable                          | Solution                                                       |
| ----------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| Le front ne se connecte pas à l'API | Proxy non configuré ou back non démarré | Vérifiez que le back est lancé sur le port 8080 avant le front |
| `Access denied` MySQL               | Mauvais utilisateur/mot de passe        | Vérifiez `application.properties` et les droits MySQL          |
| Port 4200 déjà occupé               | Un autre processus Angular est actif    | `lsof -i :4200` puis `kill <PID>`                              |
| Port 8080 déjà occupé               | Un autre serveur est actif              | `lsof -i :8080` puis `kill <PID>`                              |
| Tests e2e échouent immédiatement    | App non démarrée                        | Démarrez DB + back + front avant `npm run e2e:ci`              |
| `mvn: command not found`            | Maven non installé                      | Installez Maven 3.6+ et ajoutez-le au PATH                     |
| `ng: command not found`             | Angular CLI non installé                | `npm install -g @angular/cli@14`                               |

---

## Références

- Bonnes pratiques pour un README : [https://www.ionos.fr/digitalguide/sites-internet/developpement-web/fichier-readme/](https://www.ionos.fr/digitalguide/sites-internet/developpement-web/fichier-readme/)

