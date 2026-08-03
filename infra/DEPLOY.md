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
4. Render legge `render.yaml` alla radice del repo e propone 4 risorse:
   `sc-postgres` (database), `sc-ai-engine`, `sc-backend`, `sc-mobile-web`
   (la build web dell'app Flutter vera). Conferma il deploy.
5. Aspetta che `sc-ai-engine` diventi "Live" (pochi minuti), poi apri quel
   servizio e copia il suo URL pubblico (tipo
   `https://sc-ai-engine-xxxx.onrender.com`).
6. Apri `sc-backend` → **Environment** → modifica `AI_ENGINE_BASE_URL`
   incollando l'URL copiato al punto 5 → **Save, rebuild and deploy**.
7. Quando anche `sc-backend` è "Live", copia il suo URL pubblico (es.
   `https://sc-backend-xxxx.onrender.com`) — ti serve ai passi successivi.
8. Apri `sc-mobile-web` → **Environment** → modifica `API_BASE_URL`
   incollando l'URL di `sc-backend` (punto 7) → **Save, rebuild and deploy**
   (qui serve un rebuild vero, non solo un restart, perché Flutter web
   compila l'URL dentro il bundle — richiede un paio di minuti in più).

Nota piano free di Render: ogni servizio "dorme" dopo ~15 minuti di
inattività e il primo caricamento dopo la pausa richiede ~30-50 secondi:
normale, non è un errore. `sc-mobile-web` in particolare la prima build può
richiedere qualche minuto in più delle altre (scarica l'immagine Docker con
Flutter incluso).

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

## 3. La UI mobile vera (già online dopo il passo 1.8)

`sc-mobile-web` (deployato al passo 1) è la vera app Flutter — quella
pensata per iPhone/Android — compilata per il browser, non il
web-dashboard. Il suo URL pubblico (es.
`https://sc-mobile-web-xxxx.onrender.com`) è già pronto dopo il passo 1.8:
apri il servizio su Render e copia l'URL da lì.

Avviso: questo servizio l'ho verificato con `flutter build web` +
`flutter analyze` (puliti) e con un browser automatizzato (la vera schermata
di login renderizza correttamente), ma **non ho potuto testare la build via
Docker in questo ambiente** (nessun demone Docker disponibile qui) — è lo
stesso identico Dockerfile che Render userà, quindi dovrebbe funzionare, ma
se la prima build fallisce dimmelo e la sistemo.

Se preferisci provarla in locale invece che online, con un computer che ha
Flutter installato:

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
