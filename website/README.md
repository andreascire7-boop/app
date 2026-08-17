# website — sito Andrea Scirè (S&C Coach & Massaggiatore Sportivo)

Next.js (App Router), sito dinamico con selettore lingua IT/EN, pagine
Home / Servizi / Chi sono / Contatti e form di contatto via API route.

## Sviluppo locale

```bash
cd website
npm install
cp .env.local.example .env.local   # opzionale, vedi sotto
npm run dev -- -p 3002
```

## Contenuti da personalizzare

- `lib/site.ts` — nome, contatti, social, città.
- `lib/services.ts` — servizi e prezzi (IT/EN).
- `lib/dictionary.ts` — tutti i testi del sito (IT/EN).
- `public/images/` — sostituisci il placeholder con foto reali (hero, chi sono).

## Form contatti

Il form in `/contatti` apre WhatsApp con il messaggio già compilato appena si
clicca "Invia richiesta" — funziona sempre, senza configurazione. In parallelo
prova anche a inviare la richiesta via email tramite `app/api/contact/route.ts`,
ma solo se sono impostate le variabili `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`,
`CONTACT_TO_EMAIL` (vedi `.env.local.example` — per Gmail serve una "app
password", non la password normale). Senza queste variabili la richiesta via
email viene solo loggata sul server; WhatsApp resta comunque garantito.

## Deploy

Consigliato Vercel (stesso setup di `web-dashboard`): collega la cartella
`website` come root del progetto e imposta le variabili d'ambiente SMTP sopra,
se vuoi che il form invii email.
