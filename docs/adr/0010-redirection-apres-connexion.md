# 10. Redirection après connexion limitée aux chemins internes

- Statut : acceptée
- Source : `src/routes/login.tsx` (`loginSearchSchema`)

## Contexte

`/login?redirect=…` renvoie vers la page demandée après connexion. Une valeur comme `//site.com` ou `/\site.com` serait comprise par le navigateur comme un autre site : redirection ouverte (audit §8).

## Décision

`redirect` doit correspondre à `^/(?![/\\])` : un chemin qui commence par un seul `/`. Une valeur invalide est ignorée (`.catch(undefined)`) et la connexion redirige vers l'accueil.

## Conséquences

Une redirection vers un autre domaine est impossible, même légitime.
