# Guide de Déploiement Vercel & KV

Ton projet est prêt pour le hackathon ! Voici les étapes pour le mettre en ligne avec le multijoueur fonctionnel.

## 1. Push sur GitHub
Assure-toi que tout ton code est sur GitHub.

```bash
git add .
git commit -m "feat: add multiplayer lobby with vercel kv"
git push
```

## 2. Créer le projet sur Vercel
1. Va sur [Vercel Dashboard](https://vercel.com/dashboard).
2. Clique sur **"Add New..."** -> **"Project"**.
3. Importe ton repo GitHub `XRPLearn`.
4. Dans "Framework Preset", laisse **Next.js**.
5. Dans "Root Directory", clique sur "Edit" et sélectionne `scaffold-xrp/apps/web` (car c'est là que se trouve l'app Next.js).
6. Clique sur **Deploy**.

## 3. Ajouter la Base de Données (Vercel KV)
Une fois le déploiement initial terminé (ou pendant), tu dois ajouter le stockage pour les joueurs.

1. Dans ton projet Vercel, va dans l'onglet **Storage**.
2. Clique sur **"Create Database"**.
3. Choisis **KV (Redis)**.
4. Donne-lui un nom (ex: `xrplearn-kv`).
5. Choisis une région (ex: `Frankfurt` ou `London` pour l'Europe).
6. Clique sur **Create**.

## 4. Lier la Base de Données
1. Une fois créée, clique sur le bouton **"Connect Project"** (si ce n'est pas déjà fait).
2. Sélectionne ton projet `XRPLearn`.
3. Vercel va automatiquement ajouter les variables d'environnement (`KV_URL`, `KV_REST_API_URL`, etc.) à ton projet.
4. **Important :** Tu dois **Redéployer** ton projet pour que ces variables soient prises en compte.
   - Va dans l'onglet **Deployments**.
   - Clique sur les 3 petits points du dernier déploiement -> **Redeploy**.

## 5. C'est prêt ! 🚀
Ton URL de projet (ex: `xrplearn.vercel.app`) est maintenant accessible.
- Ouvre-la sur ton téléphone.
- Entre un pseudo.
- Demande à tes coéquipiers de faire pareil.
- Vous devriez tous vous voir dans le Lobby !

## Note pour le développement local
Si tu veux tester le multijoueur en local (`pnpm dev`), tu dois récupérer les variables d'env de Vercel KV (dans l'onglet "Settings" -> "Environment Variables" de ton projet Vercel) et les mettre dans un fichier `.env.local` dans `apps/web/`.
