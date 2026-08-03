# Provare l'app da un URL pubblico (senza condividere credenziali con Claude)

Questa guida porta l'app da "gira nel container di sviluppo" a un URL vero,
raggiungibile da qualunque browser. Tutto via account gratuiti che crei/usi
tu — non serve darmi nessun token o password, solo collegare GitHub.

Tempo stimato: ~10 minuti, tutto gratis (nessuna carta di credito richiesta
da Render/Vercel sui piani free usati qui).

## 1. Backend + AI engine + database (Render)

1. Vai su [render.com](https://render.com) e accedi con GitHub.
2. **New +** → **Blueprint**.
3. Seleziona il repo `andreascire7-boop/app`, branch
   `claude/strength-conditioning-tennis-app-lg57zd`.
4. Render legge `render.yaml` alla radice del repo e propone 3 risorse:
   `sc-postgres` (database), `sc-ai-engine`, `sc-backend`. Conferma il deploy.
5. Aspetta che `sc-ai-engine` diventi "Live" (pochi minuti), poi apri quel
   servizio e copia il suo URL pubblico (tipo
   `https://sc-ai-engine-xxxx.onrender.com`).
6. Apri `sc-backend` → **Environment** → modifica `AI_ENGINE_BASE_URL`
   incollando l'URL copiato al punto 5 → **Save, rebuild and deploy**.
7. Quando anche `sc-backend` è "Live", copia il suo URL pubblico (es.
   `https://sc-backend-xxxx.onrender.com`) — ti serve al passo successivo.

Nota piano free di Render: il servizio "dorme" dopo ~15 minuti di
inattività e il primo caricamento dopo la pausa richiede ~30-50 secondi:
normale, non è un errore.

## 2. Web-dashboard / app atleta (Vercel)

1. Vai su [vercel.com](https://vercel.com) e accedi con GitHub.
2. **Add New** → **Project** → importa lo stesso repo `andreascire7-boop/app`.
3. **Root Directory**: seleziona `web-dashboard` (non la radice del repo).
4. Branch: `claude/strength-conditioning-tennis-app-lg57zd`.
5. In **Environment Variables** aggiungi:
   - `NEXT_PUBLIC_API_BASE_URL` = l'URL di `sc-backend` copiato al passo 1.7.
6. **Deploy**.

Al termine avrai un URL tipo `https://tuo-progetto.vercel.app` — aprilo,
clicca "Prova l'app come atleta" e segui l'onboarding: è il prodotto vero,
motore AI reale incluso, non una demo statica.

## 3. (Opzionale, la UI mobile vera) Provare la build web di Flutter

L'app Flutter reale (quella pensata per iPhone/Android) compila anche per il
browser — l'ho verificato in questa sessione. Non è ancora collegata a un
hosting pubblico one-click come i due passi sopra, ma puoi provarla in
locale se hai un computer con Flutter installato:

```bash
cd mobile
flutter pub get
flutter build web --release --no-web-resources-cdn \
  --dart-define=API_BASE_URL=https://sc-backend-xxxx.onrender.com   # l'URL del passo 1.7
cd build/web && python3 -m http.server 8080
```

Poi apri `http://localhost:8080`. Nota `--no-web-resources-cdn`: senza
questo flag Flutter scarica CanvasKit da una CDN Google invece di usare i
file già inclusi nella build — di solito non serve, ma se il rendering
resta bianco è il primo sospetto.

## Aggiornare dopo nuove modifiche

Sia Render che Vercel sono collegati al branch: ogni nuovo push che faccio
su `claude/strength-conditioning-tennis-app-lg57zd` triggera un redeploy
automatico su entrambi, senza bisogno di rifare questi passaggi.
